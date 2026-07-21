from fastapi import APIRouter, HTTPException
from app.models import MedicationRequest, MedicationInfo
from app.services.ai_service import generate_structured_response, generate_mock_medication
from app.config import GROQ_API_KEY

router = APIRouter(prefix="/api/medication", tags=["Medication"])

SYSTEM_MEDICATION_PROMPT = """You are a professional pharmacological assistant AI.
Your job is to provide factual, verified information on the requested medication generics or brand names.
You must output a JSON object matching this schema:
{
  "name": "Generic and brand name",
  "uses": ["Indication 1", "Indication 2", ...],
  "typical_dosage": "Adult dosage guidance notes",
  "common_side_effects": ["Side effect 1", "Side effect 2", ...],
  "serious_side_effects": ["Severe side effect 1 (requires medical help)", ...],
  "interaction_warnings": ["Major drug/food interaction warning 1", ...],
  "disclaimer": "This information is a summary only and does not contain all details. Consult your doctor or pharmacist."
}
Only write verified, established medical information.
"""

@router.post("/lookup", response_model=MedicationInfo)
async def medication_lookup(payload: MedicationRequest):
    """
    Looks up details, dosage guidelines, side effects, and warnings for a specific drug.
    """
    if not GROQ_API_KEY:
        return generate_mock_medication(payload.medication_name)

    try:
        messages = [{"role": "user", "content": f"Please provide comprehensive facts for this medication: '{payload.medication_name}'."}]
        
        language_map = {"en": "English", "hi": "Hindi", "mr": "Marathi"}
        lang_name = language_map.get(payload.language, "English")
        lang_instruction = f"\n\nCRITICAL: You MUST write your entire response (all uses, side effects, warnings, and disclaimer fields) in {lang_name}."

        medication_data = await generate_structured_response(
            messages=messages,
            schema_class=MedicationInfo,
            system_instruction=SYSTEM_MEDICATION_PROMPT + lang_instruction
        )
        return medication_data
    except Exception as e:
        # Fallback to mock
        return generate_mock_medication(payload.medication_name)
