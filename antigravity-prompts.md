# AI Health Information Assistant — Prompt Set for Antigravity

Feed these prompts **one phase at a time**, in order. Let each phase finish
and review the output before pasting the next — a single giant prompt for
a project this size will produce shallow, half-wired code. Each phase
prompt assumes the previous phase's files already exist in the repo.

Repo/submission constraints to keep in mind throughout: public GitHub
repo, single branch, under 10MB, deployable to Cloud Run.

---

## PHASE 0 — Project brief (paste this first, as context-setting, before Phase 1)

```
You are acting as a senior product designer, senior full-stack engineer,
and AI solutions architect. We are building a production-quality "AI
Health Information Assistant" web app for a hackathon submission that
will be deployed to Google Cloud Run from a public GitHub repo (single
branch, repo under 10MB).

This must NOT feel like a simple chatbot demo. It should feel like a
polished digital health platform: a dashboard-driven product with a
guided symptom checker, structured AI answers, emergency detection, and
genuine product design (glassmorphism, medical-themed color palette,
smooth Framer Motion animation, responsive layout, dark mode).

Tech stack:
- Frontend: React (Vite), Tailwind CSS, Framer Motion
- Backend: FastAPI (Python 3.11+)
- LLM: call the Anthropic API server-side only (never expose the API key
  to the frontend); read the key from an environment variable
  ANTHROPIC_API_KEY. Support swapping providers later via an
  LLM_PROVIDER env var.
- All AI health answers must be returned as structured JSON (not free
  text) with fields: summary, possible_causes, self_care, warning_signs,
  when_to_see_doctor, disclaimer, is_emergency, emergency_message.

Core product surfaces:
1. Dashboard — cards for Health Categories, Symptom Checker, Medication
   Information, Preventive Care, Health Tips, AI Chat, plus Recent
   Conversations and Bookmarks.
2. Guided Symptom Checker — starts with one free-text symptom, then asks
   2-5 adaptive follow-up questions (multiple choice where possible)
   before generating a structured assessment.
3. AI Chat — general health Q&A, structured response cards, not raw
   paragraphs.
4. Medication Information lookup — uses, typical dosage notes, common
   and serious side effects, interaction warnings, disclaimer.
5. Preventive Care and Health Tips — AI-generated daily tips by category.
6. Image upload — for medicine packaging or visible skin conditions,
   analyzed via a vision-capable LLM call, returned in the same
   structured format. Must include a strong disclaimer that this is not
   a diagnosis.

Safety requirements (non-negotiable):
- Every AI response includes a visible disclaimer that this is not a
  substitute for professional medical advice.
- Run fast keyword-based emergency detection BEFORE calling the LLM, for
  terms indicating chest pain, stroke symptoms (face drooping, slurred
  speech, one-sided weakness), severe breathing difficulty, severe
  bleeding, loss of consciousness, and suicidal/self-harm intent. If
  detected, immediately show a high-priority emergency banner directing
  the user to call local emergency services, WITHOUT waiting on the LLM
  call. Also have the LLM itself flag is_emergency=true if it detects
  something the keyword filter missed.
- For suicidal ideation specifically, the emergency banner must include
  crisis line information and calm, non-judgmental language, and must
  never be dismissible without acknowledgment.

Do not write any code yet in this message. First, respond with:
1. The full project folder structure (backend/ and frontend/, every file
   you intend to create).
2. A one-paragraph explanation of the data flow for a symptom-checker
   session end to end.
Wait for my confirmation before generating code.
```

---

## PHASE 1 — Backend foundation

```
Now implement the FastAPI backend from the structure you proposed.

Build, in this order:
1. app/config.py — Settings loaded from env vars (LLM_PROVIDER,
   ANTHROPIC_API_KEY, ANTHROPIC_MODEL, ALLOWED_ORIGINS, ENV).
2. app/models.py — Pydantic schemas for: StructuredHealthResponse,
   ChatRequest/ChatResponse, SymptomCheckerStartRequest,
   SymptomCheckerFollowUpRequest, FollowUpQuestion,
   SymptomCheckerQuestionsResponse, MedicationRequest/MedicationInfo,
   HealthTip/HealthTipsResponse, ImageAnalysisResponse.
3. app/services/emergency_detector.py — a fast keyword/regex pre-filter
   function `detect_emergency(text: str) -> tuple[bool, str | None]`
   covering the categories listed in the brief. Include a unit-test-style
   `if __name__ == "__main__":` block with example inputs.
4. app/services/ai_service.py — a wrapper around the Anthropic API that:
   - takes a system prompt + user content
   - forces JSON-only structured output matching StructuredHealthResponse
     (use a strict system prompt instructing JSON-only output, then
     parse and validate with Pydantic; retry once on parse failure)
   - has a separate method for vision input (base64 image + prompt)
5. app/routers/chat.py, symptom_checker.py, medication.py,
   health_tips.py, image_analysis.py — wire up REST endpoints using the
   above. Symptom checker should maintain follow-up question logic via
   an LLM call that returns either the next question or a final
   assessment (use a `done: bool` flag in the response).
6. main.py — create the FastAPI app, mount CORS from settings, include
   all routers, add a /health endpoint.
7. requirements.txt and Dockerfile (multi-stage, slim base image, runs
   on the PORT env var for Cloud Run compatibility) and .env.example.

Write clean, modular, documented code — docstrings on every service
function, type hints throughout. After generating, show me the full
directory tree and a curl example for each endpoint.
```

---

## PHASE 2 — Frontend foundation & design system

```
Now scaffold the frontend: Vite + React + Tailwind + Framer Motion.

1. Set up Tailwind with a custom medical-themed palette (deep teal/blue
   primary, soft mint accent, clean neutral grays, a reserved red/amber
   for emergency states) and a glassmorphism utility class (backdrop
   blur, translucent background, subtle border) usable across cards.
2. src/context/ThemeContext.jsx — dark mode with localStorage
   persistence and a toggle hook.
3. src/utils/api.js — typed fetch wrapper for all backend endpoints from
   Phase 1, with loading/error handling helpers.
4. src/components/Sidebar.jsx — navigation between Dashboard, Symptom
   Checker, AI Chat, Medication Info, Preventive Care, Health Tips,
   Bookmarks, Settings. Collapsible on mobile.
5. src/components/EmergencyBanner.jsx — full-width, high-contrast,
   non-dismissible-until-acknowledged banner component that any page can
   trigger, with a prop for the emergency_message text and a "Call
   Emergency Services" affordance.
6. src/components/DisclaimerFooter.jsx — reusable disclaimer strip.
7. src/App.jsx — routing shell (React Router) wiring the above together,
   with Framer Motion page-transition animations.

Do not build the individual feature pages yet — just the shell, nav, and
design system. Show me the running shell structure before continuing.
```

---

## PHASE 3 — Core features

```
Now build the feature pages, each as its own component under
src/components/, using the api.js client from Phase 2:

1. Dashboard.jsx — grid of animated glassmorphic cards linking to each
   feature, a "today's AI health tip" card, and a Recent Conversations /
   Bookmarks list (store these in localStorage, keyed by conversation
   id, with title + timestamp + snippet).
2. SymptomChecker.jsx — multi-step guided flow: initial symptom input →
   render follow-up questions one at a time (radio options if provided,
   free text otherwise) with animated step transitions and a progress
   indicator → final structured result card (possible causes / self-care
   / warning signs / when to see a doctor / disclaimer), with the
   EmergencyBanner triggered immediately if is_emergency is true.
3. AIChat.jsx — chat UI with message bubbles, but AI replies render as
   structured cards (not paragraphs) using the same result-card
   component as the symptom checker. Persist chat history to
   localStorage as a "recent conversation."
4. MedicationInfo.jsx — search input, structured medication result
   display with clear visual separation between common and serious side
   effects.
5. PreventiveCare.jsx and HealthTips.jsx — category browsing + AI tip
   cards, shareable/bookmarkable.
6. Bookmarks.jsx — list of bookmarked results pulled from localStorage.

Reuse a shared `<StructuredResultCard />` component across symptom
checker, chat, and medication info so the visual language stays
consistent. Add skeleton loading states (not spinners) while waiting on
the backend, and empty states for first-time use.
```

---

## PHASE 4 — Advanced features

```
Add the remaining product requirements:

1. Voice input/output — use the Web Speech API (SpeechRecognition for
   input, SpeechSynthesis for reading AI responses aloud) with a
   graceful fallback message on unsupported browsers. Wire into AIChat
   and SymptomChecker as a mic button + "read aloud" toggle.
2. Multilingual support — add a LanguageSelector.jsx component; pass the
   selected language code through to the backend on every AI request
   (already supported by the `language` field in Phase 1 schemas) so
   responses come back in that language; also translate static UI
   strings via a small i18n dictionary (start with English, Hindi,
   Marathi).
3. Image upload — component for uploading a photo (medicine packaging or
   skin condition), preview before submit, calls the image_analysis
   endpoint, renders the same StructuredResultCard, with an extra-strong
   "not a diagnosis" disclaimer specific to image-based results.
4. PDF export — button on any StructuredResultCard to export that result
   (and optionally full conversation) as a clean, branded PDF using
   jspdf or a similar client-side library — include the disclaimer text
   in the exported PDF itself.

Keep every new component modular and documented, matching the existing
design system.
```

---

## PHASE 5 — Polish, safety pass, and deployment

```
Final pass before submission:

1. Do a dedicated safety review: confirm the emergency banner triggers
   correctly for chest pain, stroke symptoms, breathing difficulty,
   severe bleeding, and suicidal/self-harm language, using both the
   keyword pre-filter and LLM flag. Add a small test script
   (backend/tests/test_emergency_detector.py) covering these cases plus
   negative cases (symptoms that should NOT trigger it) so it's not
   over-triggering.
2. Confirm disclaimers appear: in the footer site-wide, on every
   structured result card, and inside every PDF export.
3. Responsive/mobile pass across all pages; confirm dark mode covers
   every component including the emergency banner (which should stay
   high-contrast in both themes).
4. Write the root README.md: project overview, architecture diagram
   (ASCII is fine), setup instructions, environment variables required,
   local run instructions for both backend and frontend, and Cloud Run
   deployment steps (build the Docker image, push, deploy, set
   ANTHROPIC_API_KEY as a Cloud Run secret/env var).
5. Add a root .gitignore (node_modules, __pycache__, .env, dist, build)
   and confirm the repo, once built, is comfortably under 10MB (no
   committed node_modules, no committed build artifacts, no test image
   assets beyond a couple of small samples).
6. Double check the whole app builds and runs with a single documented
   command sequence for both frontend and backend.
```


