# AI-Powered Infrastructure Design Generator

This project is a complete production-ready web application that takes user requirements and automatically generates a recommended cloud architecture diagram, cost estimation, and deployable Terraform scripts using generative AI. 

It supports outputting infrastructure configurations for **AWS** and **Azure**.

## 🚀 Features
- **Requirements Input:** Form to capture application specs (daily users, DB type, budget, etc.).
- **AI Recommendation:** Utilizes OpenAI's GPT models to design optimal cloud architecture.
- **Architecture Diagram:** Auto-renders dynamic Mermaid.js diagrams directly in the browser.
- **Cost Estimation:** Approximates monthly operating costs for the generated resources.
- **Terraform Generation:** Outputs `main.tf`, `variables.tf`, and `outputs.tf` using Jinja2 templates, ready to download and deploy.

## 🛠 Tech Stack
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Python + FastAPI
- **AI Engine:** OpenAI API
- **Templating:** Jinja2
- **Diagrams:** Mermaid.js

## 📦 Project Structure
- `/frontend`: React SPA with Tailwind styling.
- `/backend`: FastAPI server, AI orchestrator, Jinja templates, and Cost models.

## ⚙️ Setup & Installation

### Requirements
- Python 3.9+ 
- Node.js 18+

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Set your OpenAI key
cp .env.example .env
# Edit .env and paste your actual OPENAI_API_KEY
```

Run the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
> **Note:** If `OPENAI_API_KEY` is not provided or fails, the backend gracefully falls back to generating a mock architecture response.

### 2. Frontend Setup
Open a new terminal.
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

Visit the local URL shown in the terminal (usually `http://localhost:5173`) to open the app.

## 🎨 Design Aesthetic
The dashboard features an ultra-modern dark theme utilizing deep slates, vibrant blues, and emerald accents, crafted with TailwindCSS for a premium UI/UX feel matching modern cloud dashboards.
