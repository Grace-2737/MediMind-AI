# MediMind AI

### An Intelligent Health Record Analysis and Health Insight Generation System
*Academic CSE / AI System Project*

---

## 1. Overview & Core Product Principle

**MediMind AI** is an intelligent clinical decision-support and health literacy platform. It moves beyond passive medical-record file storage by executing an automated 9-stage data transformation pipeline:

$$\text{Upload} \longrightarrow \text{Extract} \longrightarrow \text{Analyze} \longrightarrow \text{Compare} \longrightarrow \text{Detect} \longrightarrow \text{Explain} \longrightarrow \text{Generate Insights} \longrightarrow \text{Visualize} \longrightarrow \text{Remind}$$

### Important Medical Product Principle
MediMind AI does **not** replace licensed clinical judgment or diagnose diseases with certainty. All outputs are explicitly categorized as:
- **AI-assisted risk indicators**
- **Health insights**
- **Detected abnormalities**
- **Observed longitudinal trends**
- **Suggested clinical follow-ups**
- **Decision-support information**

---

## 2. System Architecture & Tech Stack

```text
[ React 19 + Tailwind CSS + Recharts + Web Speech API ]
                       │ (REST APIs / JSON)
                       ▼
[ Python FastAPI / Express Full-Stack Server ]
       │                      │                      │
       ▼                      ▼                      ▼
[ PyMuPDF & OCR Engine ]  [ Scikit-Learn ML ]  [ Google Gemini 3.8 Flash ]
  (Text Stream & OCR)    (Risk Classifiers)    (Bilingual NLP Summaries)
                              │
                              ▼
           [ PostgreSQL via SQLAlchemy ORM / Storage ]
```

### Frontend
- **Framework**: React 19 (SPA with Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Data Visualization**: Recharts (Longitudinal line charts, dual-report comparison bar graphs, abnormality frequency breakdown)
- **Icons**: Lucide React
- **Text-to-Speech**: Web Speech API (`SpeechSynthesis`) with bilingual support (`en-US` and `ta-IN`)
- **Multilingual UI**: Instant runtime toggle between **English** and **தமிழ் (Tamil)**

### Backend
- **Framework**: Python FastAPI / Node.js Express hybrid architecture
- **Database**: PostgreSQL with SQLAlchemy ORM (Relational schemas for Users, Patients, Doctors, Reports, Parameters, Reminders, and AuditLogs)
- **OCR & Document Extraction**: PyMuPDF (`fitz`) for digital PDFs + Tesseract OCR simulation for scanned camera captures
- **Machine Learning (AI/ML)**: Scikit-learn `RandomForestClassifier` and multi-factor risk scoring pipeline
- **NLP / LLM Integration**: Google Gemini 3.8 Flash (`@google/genai`) for dual-mode clinical summaries (Patient-friendly + Doctor SOAP) and the conversational "Ask MediMind" assistant

---

## 3. Role-Based Capabilities

### 1. Patient Module (`Arun Kumar`)
- **Health Overview Dashboard**: Key vitals, recent reports, active risk indicators, and upcoming diagnostic reminders
- **Smart Report Upload**: Multi-format ingestion (PDF/Images) with live step-by-step extraction progress
- **Abnormality Detection**: Real-time evaluation against clinical reference intervals with visual color-coded gauges
- **Longitudinal Trend Analysis**: Recharts tracking for HbA1c, Fasting Glucose, Total Cholesterol, LDL, Triglycerides, and Creatinine
- **Report Comparison**: Side-by-side Report A vs. Report B delta calculation ($+0.6\%$, $-15\text{ mg/dL}$)
- **"Ask MediMind" Conversational AI**: Natural-language health Q&A grounded in stored clinical records
- **Bilingual Audio Narration**: Text-to-speech speaker controls for all explanations in English & Tamil
- **Searchable Medical Glossary**: Educational reference definitions for lab parameters
- **Smart Test Reminders**: Calendar scheduling for upcoming tests

### 2. Doctor Module (`Dr. Priya Sharma`)
- **Authorized Patient Roster**: Search, filter, and review assigned patients
- **Comprehensive Clinical Chart**: Baseline demographics, chronic issues, active pharmacotherapy, and emergency contacts
- **AI Clinical SOAP Summaries**: Structured Subjective, Objective, Assessment, Plan documentation
- **Physician Notes**: Record clinical remarks, treatment changes, and follow-up advice directly into patient timeline
- **Diagnostic Orders**: Schedule targeted follow-up lab reviews with urgency flags
- **Clinical Summary Export**: One-click printable medical review summary document

### 3. Administrator Module (`System Administrator`)
- **User & Provider Directory**: Manage patients, doctors, and system administrators
- **Doctor Credential Verification**: Review licensure (e.g. `TN-MED-91204`) and approve doctors
- **System Analytics**: Monthly ingestion volume, abnormality distribution charts, and AI query throughput
- **Live Audit Trail**: Chronological event logs with timestamp, actor, action, and details

---

## 4. Setup & Running Instructions (VS Code on Windows / Mac / Linux)

### Prerequisites
- **Node.js** (v18 or v20 LTS recommended): Download from [nodejs.org](https://nodejs.org/).
- **Visual Studio Code**: Download from [code.visualstudio.com](https://code.visualstudio.com/).

### Running in VS Code on Windows 10/11:

1. **Extract and Open the Project**:
   - Extract the downloaded ZIP file.
   - Open VS Code, select **File > Open Folder...**, and select the extracted project folder (where `package.json` is located).

2. **Open Integrated Terminal in VS Code**:
   - Press **Ctrl + `** (backtick) or go to **Terminal > New Terminal**.

3. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
   > **Note**: An `.npmrc` file with `legacy-peer-deps=true` is included in the project, so standard `npm install` also runs without `ERESOLVE` peer dependency conflict errors.

4. **Configure Environment Variables**:
   - In PowerShell:
     ```powershell
     Copy-Item .env.example .env
     ```
   - In Command Prompt:
     ```cmd
     copy .env.example .env
     ```
   - Add your Gemini API key in `.env` if using live OCR and AI features (`GEMINI_API_KEY="your_key"`).

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   - Open your browser at **`http://localhost:3000`**.

### Common Windows Troubleshooting:
- **`Failed to resolve import "react-is"`**:
  If this appears in your browser, run in your terminal:
  ```bash
  npm install react-is --legacy-peer-deps
  ```
  Then re-run `npm run dev`.
- **`File ... cannot be loaded because running scripts is disabled`**:
  Run this in PowerShell: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` or switch terminal to `Command Prompt` (cmd).
- **`Port 3000 is in use`**:
  Set `PORT=3001` in `.env` or stop the conflicting process.

---

## 5. Pre-Loaded Academic Test Accounts

For rapid academic evaluation, MediMind AI includes 1-click role switching in the navigation header:
- **Patient**: Arun Kumar (`user-patient-1` · 46M, Pre-diabetes & Dyslipidemia monitoring)
- **Doctor**: Dr. Priya Sharma (`user-doctor-1` · MD Diabetology, Apex Specialty)
- **Admin**: System Administrator (`user-admin-1`)
