<div align="center">

# 🏥 CarePredictAI

### AI-Powered Patient Deterioration Risk Prediction Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-care--predict--ai.vercel.app-blue?style=for-the-badge&logo=vercel)](https://care-predict-ai.vercel.app/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.5-EE4C2C?style=for-the-badge&logo=pytorch)](https://pytorch.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

*Upload patient time-series data → Get 90-day multi-condition deterioration risk scores with full explainability*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [How It Works](#-how-it-works)
- [Data Format](#-data-format)
- [Model Details](#-model-details)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 Overview

**CarePredictAI** is a clinical decision support tool that uses a **Multi-Task LSTM neural network** to predict patient deterioration risk across four critical conditions over the next 90 days:

| Condition | Target Variable |
|-----------|----------------|
| 🩸 Diabetes | `diabetes_90d_deterioration` |
| ⚖️ Obesity | `obesity_90d_deterioration` |
| ❤️ Heart Failure | `heart_failure_90d_deterioration` |
| 🫘 Kidney Failure | `kidney_failure_90d_deterioration` |

Clinicians upload a CSV file containing longitudinal patient records. The model processes 60-day time-series sequences, outputs per-patient risk probabilities, and provides feature-level explainability so clinicians understand **why** a patient is flagged as high risk.

---

## ✨ Features

### 🤖 AI & Prediction
- **Multi-Task LSTM** — shared temporal encoder with task-specific output heads
- **Batch predictions** — process hundreds of patients at once from a single CSV
- **Risk stratification** — automatic High / Medium / Low tier assignment
- **Feature attribution** — per-patient top contributing features (drivers)

### 📊 Results Dashboard (5 Tabs)
| Tab | What You See |
|-----|-------------|
| **Summary** | Risk distribution pie chart, probability histogram, high-risk count |
| **Metrics** | AUROC, AUPRC, confusion matrix per condition |
| **Explainability** | Top feature drivers per patient — understand *why* |
| **Patient List** | Sortable, filterable table of all patients with risk scores |
| **Download** | Export predictions as CSV for EHR integration |

### 🎨 UI / UX
- Drag-and-drop CSV upload with client-side validation
- Real-time progress overlay during model inference
- AI Chatbot assistant for interpreting results
- Dark / Light theme toggle
- Fully responsive (mobile-friendly)
- Column preview & schema checker before submission

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | Component framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| shadcn/ui + Radix UI | Accessible component library |
| Recharts | Data visualizations |
| React Router v6 | Client-side routing |
| React Dropzone | File upload |
| TanStack Query | Async state management |
| Supabase JS | Auth & database (optional) |

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | REST API framework |
| PyTorch 2.5 | Neural network training & inference |
| scikit-learn | Preprocessing, metrics |
| pandas / numpy | Data wrangling |
| Uvicorn | ASGI server |

---

## 🏗 Architecture

```
care-predict-ai/
│
├── frontend/           ← React + Vite SPA (deployed on Vercel)
│   └── src/
│       ├── components/
│       │   ├── upload/         ← CSV upload, validation, progress
│       │   ├── results/        ← Results modal + 5 tabs
│       │   │   └── tabs/       ← Summary, Metrics, Explainability, etc.
│       │   ├── Chatbot/        ← AI assistant
│       │   └── layout/         ← Header, Footer
│       └── pages/              ← Index, About
│
└── backend/            ← FastAPI + PyTorch (deployed on Render)
    ├── app.py          ← API routes + MultiTaskLSTM model definition
    ├── healthcare_deterioration_pytorch_model.pth  ← Trained weights
    └── requirements.txt
```

**Request flow:**

```
User uploads CSV
    ↓
Frontend validates schema (required columns check)
    ↓
POST /predict  →  FastAPI backend
    ↓
MultiTaskLSTM inference (60-day sequences)
    ↓
JSON response { patient_id, probability, risk_level, drivers[] }
    ↓
Results Dashboard renders (Summary / Metrics / Explainability / List / Download)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 and npm / bun
- **Python** ≥ 3.10
- **CUDA** (optional, falls back to CPU automatically)

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the API server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install          # or: bun install

# 3. Create environment file
cp .env.example .env
# Edit .env and set:
#   VITE_API_URL=http://localhost:8000

# 4. Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🔄 How It Works

1. **Upload** — Drag and drop a CSV file containing patient records. The frontend validates that all required columns are present before sending.

2. **Select Condition** — Choose which of the four deterioration targets you want to focus on (the model predicts all four simultaneously).

3. **Inference** — The CSV is sent to the FastAPI backend. The `HealthcareDeteriorationPredictor` class:
   - Preprocesses data (encoding, scaling)
   - Creates 60-day sliding window sequences per patient
   - Runs forward pass through the `MultiTaskLSTM`
   - Returns per-patient risk probabilities and top feature drivers

4. **Explore Results** — Navigate the 5-tab dashboard to review risk scores, model metrics, and per-patient explainability.

5. **Export** — Download predictions as a CSV for integration with your EHR system.

---

## 📄 Data Format

Your CSV must include the following columns:

```
patient_id, day_index, date, age, sex, ethnicity,
bmi_baseline, height_cm, blood_type, family_history, weight_kg,
systolic_bp, diastolic_bp, heart_rate, respiratory_rate,
temperature_c, oxygen_saturation, hba1c, fasting_glucose,
glucose_random, cholesterol_total, ldl, hdl, triglycerides,
creatinine, egfr, bun, c_reactive_protein, nt_proBNP, bnP_approx,
hemoglobin, wbc_count, platelet_count, alt, ast,
medication_count, adherence_rate, insulin_use, metformin_use,
antihypertensive_use, statin_use, ace_inhibitor_use, diuretic_use,
beta_blocker_use, antiplatelet_use, diet_type, exercise_level,
daily_steps, exercise_minutes, sleep_hours, stress_level,
smoking_status, alcohol_use, water_intake_liters, screen_time_hours,
mental_health_score, hypertension, coronary_artery_disease,
chronic_kidney_disease, prior_stroke, copd_flag,
bp_variability_7d, glucose_variability_7d, weight_change_30d,
bmi_trend, adherence_trend,
diabetes_90d_deterioration, obesity_90d_deterioration,
heart_failure_90d_deterioration, kidney_failure_90d_deterioration
```

> **Tip:** Download a sample file from the app's upload panel to see the exact format.  
> Each `patient_id` should have **at least 60 rows** (one per day) for the LSTM sequence to be valid.

---

## 🧠 Model Details

### MultiTaskLSTM Architecture

```
Input (features × 60 time steps)
        ↓
LSTM Layer 1  →  128 hidden units
        ↓
LSTM Layer 2  →  64 hidden units
        ↓
LSTM Layer 3  →  32 hidden units
        ↓
Shared Dense  →  64 → 32 units (ReLU + Dropout 0.2)
        ↓
┌─────────────┬────────────┬────────────────┬────────────────┐
│  Diabetes   │  Obesity   │  Heart Failure │ Kidney Failure │
│  head 16→1  │  head 16→1 │   head 16→1    │   head 16→1    │
│  Sigmoid    │  Sigmoid   │   Sigmoid      │   Sigmoid      │
└─────────────┴────────────┴────────────────┴────────────────┘
```

- **Sequence length:** 60 days
- **Task type:** Multi-label binary classification
- **Output:** Probability ∈ [0, 1] per condition per patient
- **Training device:** CUDA (auto-fallback to CPU)
- **Metrics reported:** AUC-ROC, Accuracy, Precision, Recall per target

---

## 📡 API Reference

### `GET /`
Health check

```json
{ "message": "Healthcare Deterioration Prediction API is running 🚑" }
```

### `POST /predict`
Upload patient data CSV and receive risk predictions.

**Request:** `multipart/form-data`  
**Field:** `file` — CSV file

**Response:**
```json
[
  {
    "patient_id": "P00001",
    "diabetes_90d_deterioration": 0.82,
    "obesity_90d_deterioration": 0.67,
    "heart_failure_90d_deterioration": 0.91,
    "kidney_failure_90d_deterioration": 0.44
  }
]
```

---

## 📁 Project Structure

```
care-predict-ai/
├── backend/
│   ├── app.py                              # FastAPI app + LSTM model
│   ├── healthcare_deterioration_pytorch_model.pth  # Pre-trained weights
│   ├── requirements.txt
│   ├── render.yaml                         # Render deployment config
│   ├── Procfile
│   └── demo1.csv / test_data.csv
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── upload/
    │   │   │   ├── UploadCard.tsx          # Drag-drop + validation
    │   │   │   ├── ProcessingOverlay.tsx   # Inference progress UI
    │   │   │   └── ibutton.tsx
    │   │   ├── results/
    │   │   │   ├── ResultsModal.tsx        # 5-tab results container
    │   │   │   ├── RiskVisualization.tsx
    │   │   │   └── tabs/
    │   │   │       ├── SummaryTab.tsx      # Charts + high-risk summary
    │   │   │       ├── MetricsTab.tsx      # AUROC, AUPRC, confusion matrix
    │   │   │       ├── ExplainabilityTab.tsx
    │   │   │       ├── PatientListTab.tsx  # Sortable patient table
    │   │   │       └── DownloadTab.tsx     # CSV export
    │   │   ├── Chatbot/
    │   │   │   └── Chatbot.tsx             # AI assistant
    │   │   └── layout/
    │   │       ├── Header.tsx
    │   │       └── Footer.tsx
    │   ├── pages/
    │   │   ├── Index.tsx                   # Main page
    │   │   └── About.tsx
    │   └── lib/
    │       └── supabase.ts                 # Supabase client
    ├── public/
    │   └── sample-data/                    # Sample CSV files
    ├── package.json
    └── vite.config.ts
```

---

## ☁️ Deployment

### Frontend → Vercel

```bash
# Build
npm run build

# Deploy (or connect GitHub repo to Vercel dashboard)
vercel --prod
```

Set environment variable in Vercel dashboard:
```
VITE_API_URL=https://your-backend.onrender.com
```

### Backend → Render

The `render.yaml` and `Procfile` are already configured.

1. Push backend to a GitHub repo
2. Connect to [Render](https://render.com) → New Web Service
3. Set **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`
4. Add environment variable `PORT=8000`

---

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Open a Pull Request
```

Please follow the existing code style and add tests where applicable.

---

## ⚠️ Disclaimer

This tool is intended for **research and decision support purposes only**. It is not a substitute for professional medical judgment. Always consult a qualified healthcare provider before making clinical decisions.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
Built with ❤️ for better patient outcomes
</div>
