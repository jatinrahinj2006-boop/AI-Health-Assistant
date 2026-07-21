from fastapi import APIRouter, HTTPException
from typing import Optional
from app.models import (
    SymptomCheckerStartRequest, 
    SymptomCheckerFollowUpRequest, 
    SymptomCheckerQuestionsResponse, 
    FollowUpQuestion,
    StructuredHealthResponse,
    SymptomQA
)
from app.services.emergency_detector import detect_emergency
from app.services.ai_service import generate_structured_response, generate_mock_health_response
from app.config import GROQ_API_KEY

router = APIRouter(prefix="/api/symptom-check", tags=["Symptom Checker"])

SYSTEM_SYMPTOM_START_PROMPT = """You are an expert clinical intake coordinator.
Your task is to analyze the patient's primary symptom and ask the FIRST targeted follow-up question regarding location, severity, duration, onset, or accompanying symptoms.
You must output a JSON object strictly matching this schema:
{
  "done": false,
  "next_question": {
    "question_text": "Targeted follow-up question regarding location, severity, duration, or onset...",
    "options": ["Option 1", "Option 2", "Option 3"]
  },
  "assessment": null
}

Under no circumstances should you make an assessment or set "done" to true. Your sole focus is to generate the first high-quality, relevant clarification question to gather more information. Keep the question clear and concise.
"""

SYSTEM_SYMPTOM_PROCESS_PROMPT = """You are an expert clinical intake coordinator.
Your task is to analyze the patient's primary symptom and Q&A history to decide if you have enough information to form a safe, educational health assessment.
You must output a JSON object strictly matching this schema:
{
  "done": false,
  "next_question": {
    "question_text": "Targeted follow-up question regarding location, severity, duration, or onset...",
    "options": ["Option 1", "Option 2", "Option 3"]
  },
  "assessment": null
}

If you have collected sufficient details (typically after 2 to 4 questions have been answered), set "done" to true, "next_question" to null, and compile the final structured assessment card:
{
  "done": true,
  "next_question": null,
  "assessment": {
    "summary": "Intake assessment summary...",
    "possible_causes": ["Cause 1", "Cause 2"],
    "self_care": ["Care step 1", ...],
    "warning_signs": ["Red flag 1", ...],
    "when_to_see_doctor": "Instructions on seeing a doctor...",
    "disclaimer": "This is educational information...",
    "is_emergency": false,
    "emergency_message": null
  }
}

CRITICAL RULE: If the history contains fewer than 2 answered questions, you MUST continue asking questions. Set "done" to false, "next_question" to a new relevant follow-up question, and "assessment" to null.
If you suspect a medical emergency, set done=true, next_question=null, is_emergency=true, and provide emergency_message instructions immediately. Keep questions clear and concise.
"""

# Preset mock questions list for local simulation mode
MOCK_QUESTIONS = [
    FollowUpQuestion(
        question_text="How long have you been experiencing this symptom?",
        options=["Less than 24 hours", "1 to 3 days", "4 to 7 days", "More than a week"]
    ),
    FollowUpQuestion(
        question_text="How would you rate the severity of the discomfort?",
        options=["Mild (annoying but manageable)", "Moderate (interferes with some activities)", "Severe (highly disruptive)"]
    ),
    FollowUpQuestion(
        question_text="Are you experiencing any other accompanying symptoms?",
        options=["None of the above", "Fever or chills", "Nausea or stomach upset", "Dizziness or headache"]
    )
]

@router.post("/start", response_model=SymptomCheckerQuestionsResponse)
async def symptom_check_start(payload: SymptomCheckerStartRequest):
    """
    Starts a symptom check session. Evaluates immediate safety keywords.
    If clear, outputs the first adaptive follow-up question.
    """
    # 1. Check local emergency
    is_emergency, message = detect_emergency(payload.symptom)
    if is_emergency:
        return SymptomCheckerQuestionsResponse(
            done=True,
            next_question=None,
            assessment=StructuredHealthResponse(
                summary="EMERGENCY CONDITION DETECTED",
                possible_causes=["Critical Emergency Indicators Found"],
                self_care=["Seek immediate medical care. Do not self-treat."],
                warning_signs=["Urgent safety red flag."],
                when_to_see_doctor="Dial emergency services immediately.",
                disclaimer="SAFETY INTERCEPT WARNING BANNER",
                is_emergency=True,
                emergency_message=message
            )
        )

    # 2. Mock mode if API key is missing
    if not GROQ_API_KEY:
        return SymptomCheckerQuestionsResponse(
            done=False,
            next_question=MOCK_QUESTIONS[0],
            assessment=None,
            source="mock"
        )

    try:
        messages = [{"role": "user", "content": f"The patient reports this symptom: '{payload.symptom}'. Ask the first relevant clarification question."}]
        
        language_map = {"en": "English", "hi": "Hindi", "mr": "Marathi"}
        lang_name = language_map.get(payload.language, "English")
        lang_instruction = f"\n\nCRITICAL: You MUST write your entire response (all questions, options, and assessment fields) in {lang_name}."

        result = await generate_structured_response(
            messages=messages,
            schema_class=SymptomCheckerQuestionsResponse,
            system_instruction=SYSTEM_SYMPTOM_START_PROMPT + lang_instruction
        )
        
        # Enforce that start NEVER returns done=True (unless it is a medical emergency)
        if result.done or result.assessment is not None:
            is_llm_emergency = (
                result.assessment is not None and 
                getattr(result.assessment, 'is_emergency', False)
            )
            if not is_llm_emergency:
                result.done = False
                result.assessment = None
                if not result.next_question:
                    result.next_question = MOCK_QUESTIONS[0]
                
        return result
    except Exception as e:
        # Fallback to mock questions on LLM failure
        return SymptomCheckerQuestionsResponse(
            done=False,
            next_question=MOCK_QUESTIONS[0],
            assessment=None,
            source="mock"
        )

@router.post("/follow-up", response_model=SymptomCheckerQuestionsResponse)
async def symptom_check_follow_up(payload: SymptomCheckerFollowUpRequest):
    """
    Processes the session's cumulative Q&A history to determine next question or return final assessment.
    """
    # 1. Run emergency scan on last answer
    if payload.history:
        last_answer = payload.history[-1].answer
        is_emergency, message = detect_emergency(last_answer)
        if is_emergency:
            return SymptomCheckerQuestionsResponse(
                done=True,
                next_question=None,
                assessment=StructuredHealthResponse(
                    summary="EMERGENCY DECLARED BY PATIENT ANSWER",
                    possible_causes=["Critical emergency indicators identified in conversation"],
                    self_care=["Seek professional help immediately."],
                    warning_signs=["Potential life-threatening signs reported."],
                    when_to_see_doctor="Dial emergency services immediately.",
                    disclaimer="SAFETY INTERCEPT WARNING BANNER",
                    is_emergency=True,
                    emergency_message=message
                )
            )

    # 2. Mock mode if API key is missing
    if not GROQ_API_KEY:
        current_len = len(payload.history)
        if current_len < len(MOCK_QUESTIONS):
            return SymptomCheckerQuestionsResponse(
                done=False,
                next_question=MOCK_QUESTIONS[current_len],
                assessment=None,
                source="mock"
            )
        else:
            # Assessment ready!
            assessment = generate_mock_health_response(payload.symptom)
            return SymptomCheckerQuestionsResponse(
                done=True,
                next_question=None,
                assessment=assessment,
                source="mock"
            )

    try:
        # Compile patient history context
        history_lines = [f"Primary Symptom: {payload.symptom}"]
        for qa in payload.history:
            history_lines.append(f"Q: {qa.question}\nA: {qa.answer}")
        patient_history = "\n\n".join(history_lines)

        messages = [{"role": "user", "content": f"Review this patient intake context:\n\n{patient_history}\n\nDetermine if we are ready to assess or if another question is needed."}]

        language_map = {"en": "English", "hi": "Hindi", "mr": "Marathi"}
        lang_name = language_map.get(payload.language, "English")
        lang_instruction = f"\n\nCRITICAL: You MUST write your entire response (all questions, options, and assessment fields) in {lang_name}."

        result = await generate_structured_response(
            messages=messages,
            schema_class=SymptomCheckerQuestionsResponse,
            system_instruction=SYSTEM_SYMPTOM_PROCESS_PROMPT + lang_instruction
        )
        
        # Enforce minimum of 2 follow-up questions before allowing done=True (unless it is a medical emergency)
        if len(payload.history) < 2:
            if result.done or result.assessment is not None:
                is_llm_emergency = (
                    result.assessment is not None and 
                    getattr(result.assessment, 'is_emergency', False)
                )
                if not is_llm_emergency:
                    result.done = False
                    result.assessment = None
                    if not result.next_question:
                        result.next_question = MOCK_QUESTIONS[min(len(payload.history), len(MOCK_QUESTIONS)-1)]
                    
        return result
    except Exception as e:
        # Fall back to mock assessment on LLM failure
        assessment = generate_mock_health_response(payload.symptom)
        return SymptomCheckerQuestionsResponse(
            done=True,
            next_question=None,
            assessment=assessment,
            source="mock"
        )
