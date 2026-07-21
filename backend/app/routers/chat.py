from fastapi import APIRouter, HTTPException
from app.models import ChatRequest, ChatResponse, StructuredHealthResponse
from app.services.emergency_detector import detect_emergency
from app.services.ai_service import generate_structured_response, generate_mock_health_response
from app.config import GROQ_API_KEY

router = APIRouter(prefix="/api/chat", tags=["Chat"])

SYSTEM_CHAT_PROMPT = """You are AegisHealth AI, an empathetic and professional clinical assistant.
Your task is to hold a helpful, educational conversation about wellness, drugs, or symptoms.
You must always output a JSON object matching this schema:
{
  "chat_reply": "Friendly response summary here (Markdown formatting supported)",
  "assessment": null
}
If the user describes symptoms or active health complaints they are experiencing, you MUST generate and include a structured clinical assessment in the "assessment" field:
{
  "chat_reply": "I have reviewed your symptoms. Please review the details below.",
  "assessment": {
    "summary": "Clinical overview...",
    "possible_causes": ["Cause 1", ...],
    "self_care": ["Care instruction 1", ...],
    "warning_signs": ["Red flag 1", ...],
    "when_to_see_doctor": "Doctor visit rules...",
    "disclaimer": "This is educational information only...",
    "is_emergency": false,
    "emergency_message": null
  }
}
If no symptoms/illness is described (e.g., standard greetings, simple general questions like 'what is sleep?'), leave "assessment" as null.
Keep all medical references accurate and clinical.
"""

@router.post("", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    """
    General conversational health assistant. Intercepts emergencies locally,
    and returns friendly guidance along with structured assessment cards if symptoms are described.
    """
    # 1. Run local fast emergency filter
    is_emergency, message = detect_emergency(payload.message)
    if is_emergency:
        return ChatResponse(
            chat_reply=message or "Immediate emergency care required.",
            assessment=StructuredHealthResponse(
                summary="EMERGENCY COMPLAINT DETECTED",
                possible_causes=["Critical Condition Indicators Identified"],
                self_care=["Do not attempt self-treatment. Seek help immediately."],
                warning_signs=["Life-threatening emergency symptoms reported."],
                when_to_see_doctor="Contact emergency services immediately.",
                disclaimer="SAFETY INTERCEPT WARNING BANNER",
                is_emergency=True,
                emergency_message=message
            )
        )

    # 2. Mock fallback if API key is missing
    if not GROQ_API_KEY:
        has_symptoms = any(term in payload.message.lower() for term in ["pain", "cough", "fever", "nausea", "headache", "dizzy", "symptom", "hurt"])
        mock_assessment = None
        if has_symptoms:
            mock_assessment = generate_mock_health_response(payload.message)
            reply = "I've structured a clinical summary card of your complaints below. Review the causes and guidelines. (Demo Simulation Mode)"
        else:
            reply = "Hello! I am AegisHealth AI, running in mock simulation mode. If you mention symptoms like 'fever' or 'cough', I will display simulated clinical details!"
        return ChatResponse(chat_reply=reply, assessment=mock_assessment, source="mock")

    try:
        # Limit history context length for API
        formatted_messages = []
        for h in payload.history[-6:]:
            formatted_messages.append({"role": h.role, "content": h.content})
        
        formatted_messages.append({"role": "user", "content": payload.message})

        chat_data = await generate_structured_response(
            messages=formatted_messages,
            schema_class=ChatResponse,
            system_instruction=SYSTEM_CHAT_PROMPT
        )
        return chat_data
    except Exception as e:
        # Fall back to mock on LLM failure
        has_symptoms = any(term in payload.message.lower() for term in ["pain", "cough", "fever", "nausea", "headache", "dizzy", "symptom", "hurt"])
        mock_assessment = None
        if has_symptoms:
            mock_assessment = generate_mock_health_response(payload.message)
            reply = "I've structured a clinical summary card of your complaints below. (LLM call failed, fallback simulation active)"
        else:
            reply = "Hello! AegisHealth AI is currently running in mock simulation mode due to gateway issues."
        return ChatResponse(chat_reply=reply, assessment=mock_assessment, source="mock")
