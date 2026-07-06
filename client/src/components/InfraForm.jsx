import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, AlertTriangle, Sparkles } from 'lucide-react';
import FormField from './FormField';

const REGIONS_AWS = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-west-1', 'eu-west-2', 'eu-central-1',
  'ap-southeast-1', 'ap-south-1', 'ap-northeast-1',
];

const REGIONS_AZURE = [
  'East US', 'East US 2', 'West US', 'West US 2',
  'West Europe', 'North Europe', 'UK South',
  'Southeast Asia', 'Central India', 'Japan East',
];

const DEFAULT_FORM = {
  cloud_provider: 'AWS',
  app_type: 'Web Application',
  users_daily: 'Less than 1,000',
  db_type: 'SQL',
  storage_gb: '10-50GB',
  region: 'us-east-1',
  high_availability: 'No',
  security_level: 'Basic',
  uptime: 99,
  runtime_value: 1,
  runtime_unit: 'Months',
  monthly_budget: '',
};

export default function InfraForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState(DEFAULT_FORM);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Reset region when provider changes
      ...(name === 'cloud_provider' && {
        region: value === 'AWS' ? 'us-east-1' : 'East US',
      }),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const runtimeMonths =
      form.runtime_unit === 'Years'
        ? Math.round(Number(form.runtime_value) * 12)
        : Math.round(Number(form.runtime_value));

    onSubmit({
      cloud_provider: form.cloud_provider,
      app_type: form.app_type,
      users_daily: form.users_daily,
      db_type: form.db_type,
      storage_gb: form.storage_gb,
      region: form.region,
      high_availability: form.high_availability,
      security_level: form.security_level,
      uptime: Number(form.uptime),
      runtime_months: runtimeMonths,
      monthly_budget: form.monthly_budget ? Number(form.monthly_budget) : null,
    });
  };

  const regions = form.cloud_provider === 'AWS' ? REGIONS_AWS : REGIONS_AZURE;
  const uptimeFloat = Number(form.uptime);
  const showUptimeWarning = uptimeFloat >= 99.9;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Provider Selection */}
      <div>
        <p className="section-label">Step 1 — Cloud Provider</p>
        <div className="grid grid-cols-2 gap-3">
          {['AWS', 'Azure'].map((provider) => (
            <motion.button
              key={provider}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setForm((p) => ({ ...p, cloud_provider: provider, region: provider === 'AWS' ? 'us-east-1' : 'East US' }))}
              disabled={isLoading}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                form.cloud_provider === provider
                  ? 'border-violet-500 bg-violet-600/10 shadow-glow-violet'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]'
              }`}
            >
              <span className="text-2xl">{provider === 'AWS' ? '🟠' : '🔵'}</span>
              <span className={`text-sm font-semibold ${
                form.cloud_provider === provider ? 'text-violet-300' : 'text-slate-400'
              }`}>{provider}</span>
              {form.cloud_provider === provider && (
                <motion.div
                  layoutId="provider-pill"
                  className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-400"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Application Details */}
      <div className="space-y-4">
        <p className="section-label">Step 2 — Application Details</p>

        <FormField
          label="Application Type"
          name="app_type"
          type="select"
          value={form.app_type}
          onChange={handleChange}
          disabled={isLoading}
          options={['Web Application', 'REST API', 'ML / AI System', 'Mobile Backend', 'E-commerce Platform', 'Microservices']}
        />

        <FormField
          label="Expected Daily Users"
          name="users_daily"
          type="select"
          value={form.users_daily}
          onChange={handleChange}
          disabled={isLoading}
          options={['Less than 1,000', '1K - 10K', '10K - 100K', '100K+']}
          helper="Used to determine compute scaling requirements"
        />

        <FormField
          label="Database Type"
          name="db_type"
          type="select"
          value={form.db_type}
          onChange={handleChange}
          disabled={isLoading}
          options={['SQL', 'NoSQL', 'None']}
          helper="SQL = PostgreSQL/MySQL  ·  NoSQL = DynamoDB/Cosmos DB"
        />

        <FormField
          label="Storage Requirement"
          name="storage_gb"
          type="select"
          value={form.storage_gb}
          onChange={handleChange}
          disabled={isLoading}
          options={['< 10GB', '10-50GB', '50-500GB', '500GB+', 'None']}
        />

        <FormField
          label="Deployment Region"
          name="region"
          type="select"
          value={form.region}
          onChange={handleChange}
          disabled={isLoading}
          options={regions}
        />
      </div>

      {/* Reliability & Security */}
      <div className="space-y-4">
        <p className="section-label">Step 3 — Reliability & Security</p>

        <FormField
          label="High Availability"
          name="high_availability"
          type="select"
          value={form.high_availability}
          onChange={handleChange}
          disabled={isLoading}
          options={['Yes', 'No']}
          helper="Enables multi-zone deployment and redundancy"
        />

        <FormField
          label="Security Level"
          name="security_level"
          type="select"
          value={form.security_level}
          onChange={handleChange}
          disabled={isLoading}
          options={['Basic', 'High', 'Compliance-focused (e.g. HIPAA)']}
        />

        {/* Uptime SLA Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              Expected Uptime SLA
              <Info size={13} className="text-slate-600" />
            </label>
            <span className={`text-sm font-bold font-mono ${
              showUptimeWarning ? 'text-amber-400' : 'text-violet-400'
            }`}>
              {Number(form.uptime).toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            name="uptime"
            min="90"
            max="100"
            step="0.1"
            value={form.uptime}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, ${
                showUptimeWarning ? '#F59E0B' : '#7C3AED'
              } ${((form.uptime - 90) / 10) * 100}%, #1E293B ${((form.uptime - 90) / 10) * 100}%)`,
            }}
          />
          <div className="flex justify-between text-[10px] text-slate-700">
            <span>90%</span><span>95%</span><span>99%</span><span>99.9%</span><span>100%</span>
          </div>
          {showUptimeWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3"
            >
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              <span>99.9%+ SLA requires multi-AZ deployment — increases cost by <strong>1.5×</strong></span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Budget & Duration */}
      <div className="space-y-4">
        <p className="section-label">Step 4 — Budget & Timeline</p>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Runtime</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="runtime_value"
              value={form.runtime_value}
              onChange={handleChange}
              disabled={isLoading}
              min="1" max="120"
              placeholder="12"
              className="input-field flex-1"
            />
            <select
              name="runtime_unit"
              value={form.runtime_unit}
              onChange={handleChange}
              disabled={isLoading}
              className="select-field w-28"
            >
              <option>Months</option>
              <option>Years</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Monthly Budget (INR)
            <span className="text-slate-600 font-normal ml-1">— optional</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">₹</span>
            <input
              type="number"
              name="monthly_budget"
              value={form.monthly_budget}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="50000"
              min="0"
              className="input-field pl-8"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -1 }}
        whileTap={{ scale: isLoading ? 1 : 0.97 }}
        className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Generate Architecture
          </>
        )}
      </motion.button>

      <p className="text-center text-[11px] text-slate-600">
        Powered by GPT-4o with rule-based fallback
      </p>
    </form>
  );
}
