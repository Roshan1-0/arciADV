/**
 * Terraform HCL code generator.
 * Supports AWS and Azure.
 * Generates main.tf, variables.tf, outputs.tf
 */

function generateTerraformCode(cloudProvider, components, region) {
  const provider = (cloudProvider || 'AWS').toLowerCase();
  if (!['aws', 'azure'].includes(provider)) {
    return generateAWSTerraform(components, region);
  }
  return provider === 'azure'
    ? generateAzureTerraform(components, region)
    : generateAWSTerraform(components, region);
}

function generateAWSTerraform(components, region) {
  const hasDB = components.some(c => c.type === 'database');
  const hasStorage = components.some(c => c.type === 'storage');
  const hasCache = components.some(c => c.type === 'cache');
  const computeCount = Math.max(...components.filter(c => c.type === 'compute').map(c => c.count), 1);
  const dbService = components.find(c => c.type === 'database')?.service_name || '';
  const isNoSQL = dbService.toLowerCase().includes('dynamo');

  const mainTf = `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.5.0"
}

provider "aws" {
  region = var.aws_region
}

# ─── VPC & Networking ────────────────────────────────────────────────────────

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(local.common_tags, { Name = "\${var.project_name}-vpc" })
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = merge(local.common_tags, { Name = "\${var.project_name}-igw" })
}

resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = merge(local.common_tags, { Name = "\${var.project_name}-public-\${count.index + 1}" })
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = merge(local.common_tags, { Name = "\${var.project_name}-private-\${count.index + 1}" })
}

data "aws_availability_zones" "available" {
  state = "available"
}

# ─── Security Groups ──────────────────────────────────────────────────────────

resource "aws_security_group" "alb" {
  name        = "\${var.project_name}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}

resource "aws_security_group" "app" {
  name        = "\${var.project_name}-app-sg"
  description = "Security group for application EC2 instances"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}

# ─── Application Load Balancer ────────────────────────────────────────────────

resource "aws_lb" "main" {
  name               = "\${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  tags = local.common_tags
}

resource "aws_lb_target_group" "app" {
  name     = "\${var.project_name}-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }

  tags = local.common_tags
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# ─── EC2 Auto Scaling ─────────────────────────────────────────────────────────

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_launch_template" "app" {
  name_prefix   = "\${var.project_name}-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type

  vpc_security_group_ids = [aws_security_group.app.id]

  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum update -y
    yum install -y docker
    systemctl start docker
    systemctl enable docker
  EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags          = local.common_tags
  }
}

resource "aws_autoscaling_group" "app" {
  name                = "\${var.project_name}-asg"
  vpc_zone_identifier = aws_subnet.private[*].id
  target_group_arns   = [aws_lb_target_group.app.arn]
  health_check_type   = "ELB"

  min_size         = 1
  max_size         = ${computeCount + 2}
  desired_capacity = ${computeCount}

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "\${var.project_name}-app"
    propagate_at_launch = true
  }
}
${hasDB && !isNoSQL ? `
# ─── RDS PostgreSQL ───────────────────────────────────────────────────────────

resource "aws_db_subnet_group" "main" {
  name       = "\${var.project_name}-db-subnet"
  subnet_ids = aws_subnet.private[*].id
  tags       = local.common_tags
}

resource "aws_security_group" "rds" {
  name        = "\${var.project_name}-rds-sg"
  description = "Security group for RDS instance"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  tags = local.common_tags
}

resource "aws_db_instance" "main" {
  identifier        = "\${var.project_name}-db"
  engine            = "postgres"
  engine_version    = "15.4"
  instance_class    = var.db_instance_class
  allocated_storage = 20
  storage_encrypted = true

  db_name  = replace(var.project_name, "-", "_")
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 7
  skip_final_snapshot     = false
  final_snapshot_identifier = "\${var.project_name}-final-snapshot"

  tags = local.common_tags
}` : ''}
${hasDB && isNoSQL ? `
# ─── DynamoDB ─────────────────────────────────────────────────────────────────

resource "aws_dynamodb_table" "main" {
  name           = "\${var.project_name}-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = local.common_tags
}` : ''}
${hasStorage ? `
# ─── S3 Storage ───────────────────────────────────────────────────────────────

resource "aws_s3_bucket" "app" {
  bucket = "\${var.project_name}-assets-\${random_id.bucket_suffix.hex}"
  tags   = local.common_tags
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_versioning" "app" {
  bucket = aws_s3_bucket.app.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "app" {
  bucket = aws_s3_bucket.app.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}` : ''}
${hasCache ? `
# ─── ElastiCache Redis ────────────────────────────────────────────────────────

resource "aws_elasticache_subnet_group" "main" {
  name       = "\${var.project_name}-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "\${var.project_name}-redis"
  description                = "Redis cache for \${var.project_name}"
  node_type                  = "cache.t3.micro"
  num_cache_clusters         = 1
  port                       = 6379
  subnet_group_name          = aws_elasticache_subnet_group.main.name
  automatic_failover_enabled = false
  tags                       = local.common_tags
}` : ''}

# ─── CloudWatch Monitoring ────────────────────────────────────────────────────

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "\${var.project_name}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 120
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "CPU utilization above 80%"
  alarm_actions       = []
}

# ─── Locals ───────────────────────────────────────────────────────────────────

locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    CreatedBy   = "InfraGen AI"
  }
}
`;

  const varsTf = `variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "${region || 'us-east-1'}"
}

variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
  default     = "infragen-app"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}
${hasDB && !isNoSQL ? `
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_username" {
  description = "Database administrator username"
  type        = string
  default     = "dbadmin"
  sensitive   = true
}

variable "db_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true
}` : ''}
`;

  const outputsTf = `output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "autoscaling_group_name" {
  description = "Name of the Auto Scaling Group"
  value       = aws_autoscaling_group.app.name
}
${hasDB && !isNoSQL ? `
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}` : ''}
${hasStorage ? `
output "s3_bucket_name" {
  description = "Name of the S3 assets bucket"
  value       = aws_s3_bucket.app.id
}` : ''}
`;

  return { 'main.tf': mainTf, 'variables.tf': varsTf, 'outputs.tf': outputsTf };
}

function generateAzureTerraform(components, region) {
  const hasDB = components.some(c => c.type === 'database');
  const hasStorage = components.some(c => c.type === 'storage');
  const computeCount = Math.max(...components.filter(c => c.type === 'compute').map(c => c.count), 1);

  const mainTf = `terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.5.0"
}

provider "azurerm" {
  features {}
}

# ─── Resource Group ───────────────────────────────────────────────────────────

resource "azurerm_resource_group" "main" {
  name     = "\${var.project_name}-rg"
  location = var.azure_region
  tags     = local.common_tags
}

# ─── Virtual Network ──────────────────────────────────────────────────────────

resource "azurerm_virtual_network" "main" {
  name                = "\${var.project_name}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags
}

resource "azurerm_subnet" "app" {
  name                 = "app-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "db" {
  name                 = "db-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
}

# ─── Application Gateway (Load Balancer) ──────────────────────────────────────

resource "azurerm_public_ip" "gateway" {
  name                = "\${var.project_name}-gw-pip"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = local.common_tags
}

resource "azurerm_application_gateway" "main" {
  name                = "\${var.project_name}-appgw"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  sku {
    name     = "Standard_v2"
    tier     = "Standard_v2"
    capacity = 2
  }

  gateway_ip_configuration {
    name      = "app-gateway-ip"
    subnet_id = azurerm_subnet.app.id
  }

  frontend_ip_configuration {
    name                 = "frontend-ip"
    public_ip_address_id = azurerm_public_ip.gateway.id
  }

  frontend_port {
    name = "http-port"
    port = 80
  }

  backend_address_pool {
    name = "app-backend-pool"
  }

  backend_http_settings {
    name                  = "http-settings"
    cookie_based_affinity = "Disabled"
    port                  = 8080
    protocol              = "Http"
    request_timeout       = 60
  }

  http_listener {
    name                           = "http-listener"
    frontend_ip_configuration_name = "frontend-ip"
    frontend_port_name             = "http-port"
    protocol                       = "Http"
  }

  request_routing_rule {
    name                       = "routing-rule"
    rule_type                  = "Basic"
    http_listener_name         = "http-listener"
    backend_address_pool_name  = "app-backend-pool"
    backend_http_settings_name = "http-settings"
    priority                   = 1
  }

  tags = local.common_tags
}

# ─── VM Scale Set ─────────────────────────────────────────────────────────────

resource "azurerm_linux_virtual_machine_scale_set" "app" {
  name                = "\${var.project_name}-vmss"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = var.vm_size
  instances           = ${computeCount}
  admin_username      = "azureuser"

  admin_ssh_key {
    username   = "azureuser"
    public_key = file("~/.ssh/id_rsa.pub")
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  os_disk {
    storage_account_type = "Standard_LRS"
    caching              = "ReadWrite"
  }

  network_interface {
    name    = "app-nic"
    primary = true

    ip_configuration {
      name                                   = "internal"
      primary                                = true
      subnet_id                              = azurerm_subnet.app.id
      application_gateway_backend_address_pool_ids = [tolist(azurerm_application_gateway.main.backend_address_pool)[0].id]
    }
  }

  tags = local.common_tags
}
${hasDB ? `
# ─── Azure SQL Database ───────────────────────────────────────────────────────

resource "azurerm_mssql_server" "main" {
  name                         = "\${var.project_name}-sqlserver"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = var.db_admin_username
  administrator_login_password = var.db_admin_password
  tags                         = local.common_tags
}

resource "azurerm_mssql_database" "main" {
  name           = "\${var.project_name}-db"
  server_id      = azurerm_mssql_server.main.id
  collation      = "SQL_Latin1_General_CP1_CI_AS"
  license_type   = "LicenseIncluded"
  sku_name       = "S1"
  tags           = local.common_tags
}` : ''}
${hasStorage ? `
# ─── Azure Blob Storage ───────────────────────────────────────────────────────

resource "azurerm_storage_account" "app" {
  name                     = "\${replace(var.project_name, "-", "")}storage"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = local.common_tags
}

resource "azurerm_storage_container" "assets" {
  name                  = "assets"
  storage_account_name  = azurerm_storage_account.app.name
  container_access_type = "private"
}` : ''}

# ─── Azure Monitor ────────────────────────────────────────────────────────────

resource "azurerm_monitor_action_group" "main" {
  name                = "\${var.project_name}-action-group"
  resource_group_name = azurerm_resource_group.main.name
  short_name          = "infragen"
  tags                = local.common_tags
}

# ─── Locals ───────────────────────────────────────────────────────────────────

locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    CreatedBy   = "InfraGen AI"
  }
}
`;

  const varsTf = `variable "azure_region" {
  description = "Azure region to deploy resources"
  type        = string
  default     = "${region || 'East US'}"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "infragen-app"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "vm_size" {
  description = "VM Scale Set size"
  type        = string
  default     = "Standard_B2ms"
}
${hasDB ? `
variable "db_admin_username" {
  description = "Database administrator username"
  type        = string
  default     = "sqladmin"
  sensitive   = true
}

variable "db_admin_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true
}` : ''}
`;

  const outputsTf = `output "application_gateway_public_ip" {
  description = "Public IP of the Application Gateway"
  value       = azurerm_public_ip.gateway.ip_address
}

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "vmss_name" {
  description = "Name of the VM Scale Set"
  value       = azurerm_linux_virtual_machine_scale_set.app.name
}
${hasDB ? `
output "sql_server_fqdn" {
  description = "FQDN of the SQL Server"
  value       = azurerm_mssql_server.main.fully_qualified_domain_name
  sensitive   = true
}` : ''}
`;

  return { 'main.tf': mainTf, 'variables.tf': varsTf, 'outputs.tf': outputsTf };
}

module.exports = { generateTerraformCode };
