# CuraHealth AI — Intelligent Health Intake & Wellness Assistant

CuraHealth AI is a production-grade, premium digital health information dashboard designed for clinical hackathon submissions. It integrates an adaptive symptom-checker wizard, medication facts lookup, conversational AI chat, and a visual vision analyzer for medicine label/skin checks.

---

## 🏗️ Architecture Overview

```text
               +--------------------------------------------------+
               |                Vite + React App                  |
               |  (Tailwind CSS, Framer Motion, Web Speech API)   |
               +--------------------------------------------------+
                                        |
                 HTTP REST Calls (JSON) | (Port 8000 / Proxy / CORS)
                                        v
               +--------------------------------------------------+
               |                 FastAPI Backend                  |
               +--------------------------------------------------+
                  |                     |                      |
                  v (Safety Scan)       v (JSON validation)    v (Visual check)
       +--------------------+  +------------------+  +-------------------+
       |  Local Emergency   |  |   ai_service.py  |  |   Image Analysis  |
       |  Keyword Pre-filter|  |  (Groq Gateway)  |  |  (OCR & Skin Scan)|
       +--------------------+  +------------------+  +-------------------+
                  |                     |                      |
                  | (Emergency)         v                      v
                  |            +------------------+  +-------------------+
                  |            | OpenAI-compatible|  |   Fallback Mock   |
                  |            |  JSON Endpoints  |  |   Visual Report   |
                  |            +------------------+  +-------------------+
                  v                     |
       +--------------------+           |
       |  Global Emergency  |<----------+
       |   Banner Trigger   |
       +--------------------+
```

---

## ✨ Key Platform Features

1. **Dashboard-Driven UI**: Vibrant glassmorphic theme with a persistent dark mode toggle and sub-tab activity tracking.
2. **Adaptive Symptom Checker**: Multi-step wizard intake initiating from free-text symptoms, issuing 2 to 5 clarification questions, and rendering dynamic `<StructuredResultCard />` reports.
3. **Double-Layer Safety Scans**: Instant local keyword scans (cardiovascular, respiratory, neurological stroke triggers, profuse bleeding, crisis self-harm) combined with LLM assessment checks to bypass model latency.
4. **General Health Chat**: Empathetic conversational companion that automatically embeds `<StructuredResultCard />` modules when physical complaints are discussed.
5. **Web Speech Audio dictation**: Integrates Speech-to-Text input (dictation microphone) and Text-to-Speech response reading, localized dynamically based on active language.
6. **Multilingual (i18n) Support**: Full UI translation dictionaries for English, Hindi, and Marathi. Sends active locale codes to the backend to generate diagnostic assessments in the chosen language.
7. **Client-Side PDF Exports**: Branded PDF reports generated using `jsPDF` directly from result cards, embedding disclaimer texts, formatting margins, and handling page breaks.

---

## 🛠️ Required Environment Variables

Configure a `.env` file in the `backend/` directory (refer to `backend/.env.example`):

```env
# Application Settings
ENV=development
PORT=8000

# LLM Providers Configuration
LLM_PROVIDER=groq
GROQ_API_KEY="your_groq_api_key_here"

# Model Selections (Groq Active Catalog)
GROQ_MODEL=openai/gpt-oss-120b
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct

# CORS Setting
ALLOWED_ORIGINS=*
```

*Note: If no `GROQ_API_KEY` is set, CuraHealth runs in local simulation mode, providing detailed, structured mock profiles with a simulated data badge.*

---

## 🚀 Local Run Instructions

### 1. Launching the Backend API
Navigate to the `backend/` directory:
```bash
cd backend
python -m venv venv

# Windows Powershell:
.\venv\Scripts\Activate.ps1
# Mac / Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m app.main
```
The FastAPI swagger documentation will be available at `http://localhost:8000/docs`.

### 2. Running Unit Tests
Validate the emergency safety filters:
```bash
python -m unittest tests/test_emergency_detector.py
```

### 3. Launching the Frontend App
Navigate to the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
The web client will mount at `http://localhost:5173`. In local dev, Vite automatically proxy-routes requests to the FastAPI backend port.

---

## ☁️ Google Cloud Run Deployment Steps

CuraHealth is fully containerized. To deploy the FastAPI service to Google Cloud Run:

### 1. Build and Tag the Docker Image
Ensure you have the Google Cloud CLI installed. Execute from the root directory:
```bash
# Set your GCP Project ID
export PROJECT_ID="your-gcp-project-id"

# Build the Docker image locally from the project root directory
docker build -t gcr.io/$PROJECT_ID/CuraHealth-backend -f backend/Dockerfile .
```

### 2. Push Image to Google Container Registry
```bash
gcloud auth configure-docker
docker push gcr.io/$PROJECT_ID/CuraHealth-backend
```

### 3. Deploy to Cloud Run
Deploy the container, setting the Groq API configuration parameters:
```bash
gcloud run deploy CuraHealth-backend \
  --image gcr.io/$PROJECT_ID/CuraHealth-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="LLM_PROVIDER=groq,GROQ_MODEL=openai/gpt-oss-120b,GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct" \
  --update-secrets="GROQ_API_KEY=GROQ_API_KEY:latest"
```

---

## ⚖️ Clinical Disclaimer
CuraHealth AI is a clinical mock intake tool meant for health information lookup and patient simulation. Under no circumstances should the assessments provided replace professional medical diagnoses, emergency care guidance, or prescriptions.
