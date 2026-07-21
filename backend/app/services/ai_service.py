import json
import httpx
import logging
from typing import List, Dict, Any, Type, Optional
from pydantic import BaseModel
from app import config
from app.models import StructuredHealthResponse, MedicationInfo, HealthTip, HealthTipsResponse

logger = logging.getLogger(__name__)

def get_groq_headers() -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {config.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

async def call_llm_api(
    messages: List[Dict[str, Any]], 
    model: str, 
    json_mode: bool = False,
    temperature: float = 0.2
) -> str:
    """
    Submits a request to Groq's OpenAI-compatible chat completion endpoint.
    """
    if not config.GROQ_API_KEY:
        logger.warning("GROQ_API_KEY is not set. Local mock generation active.")
        raise ValueError("GROQ_API_KEY is missing")

    url = "https://api.groq.com/openai/v1/chat/completions"
    payload: Dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temperature
    }
    
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=35.0) as client:
        try:
            response = await client.post(url, headers=get_groq_headers(), json=payload)
            if response.status_code != 200:
                logger.error(f"Groq API Error ({response.status_code}): {response.text}")
                response.raise_for_status()
            
            result = response.json()
            return result["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"LLM communication error: {str(e)}")
            raise e

async def generate_structured_response(
    messages: List[Dict[str, Any]],
    schema_class: Type[BaseModel],
    system_instruction: str,
    model: Optional[str] = None,
    max_retries: int = 2
) -> BaseModel:
    """
    Calls the LLM with system rules and validates the output against a Pydantic schema.
    Retries once on JSON parse/validation failure.
    """
    selected_model = model or config.GROQ_MODEL
    full_messages = [{"role": "system", "content": system_instruction}] + messages
    
    for attempt in range(max_retries):
        try:
            raw_response = await call_llm_api(
                messages=full_messages, 
                model=selected_model, 
                json_mode=True
            )
            parsed_json = json.loads(raw_response)
            parsed_json["source"] = "live"
            validated_obj = schema_class(**parsed_json)
            return validated_obj
        except Exception as e:
            logger.warning(f"Validation attempt {attempt + 1} failed: {str(e)}")
            if attempt == max_retries - 1:
                logger.error("Structured response validation failed permanently.")
                raise e
            # Append prompt retry instruction
            full_messages[0]["content"] += "\nRETRY WARNING: The previous response failed JSON schema validation. Ensure all required fields are included."

# --- Vision Input Integration ---
async def analyze_image_vision(
    base64_image: str, 
    content_type: str, 
    category: str
) -> StructuredHealthResponse:
    """
    Vision analysis: base64 image + structured schema output wrapper.
    """
    if not config.GROQ_API_KEY:
        logger.info("GROQ_API_KEY is not set. Generating fallback vision analysis.")
        return generate_mock_vision_assessment(category)

    system_instruction = (
        "You are a professional medical vision assistant. Analyze the user's uploaded image.\n"
        "If it is medication packaging, identify active ingredients, warnings, and generic brand name.\n"
        "If it is a skin condition, evaluate features, possible causes, and self-care.\n"
        "You must respond ONLY with a JSON object matching the StructuredHealthResponse schema:\n"
        "{\n"
        "  \"summary\": \"Clinical details seen in image\",\n"
        "  \"possible_causes\": [\"Cause 1\", \"Cause 2\"],\n"
        "  \"self_care\": [\"Self care advice 1\", ...],\n"
        "  \"warning_signs\": [\"Red flags 1\", ...],\n"
        "  \"when_to_see_doctor\": \"Guidelines on seeing doctor\",\n"
        "  \"disclaimer\": \"Mandatory disclaimer that this is a simulated visual analysis and not a final medical diagnosis.\",\n"
        "  \"is_emergency\": false,\n"
        "  \"emergency_message\": null\n"
        "}"
    )

    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text", 
                    "text": f"Evaluate this image in the category: '{category}'."
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{content_type};base64,{base64_image}"
                    }
                }
            ]
        }
    ]

    try:
        response = await generate_structured_response(
            messages=messages,
            schema_class=StructuredHealthResponse,
            system_instruction=system_instruction,
            model=config.GROQ_VISION_MODEL
        )
        return response
    except Exception as e:
        logger.error(f"Groq Vision LLM failed: {str(e)}. Falling back to mock data.")
        return generate_mock_vision_assessment(category)

# --- Fallback Generators ---

def generate_mock_health_response(symptom: str) -> StructuredHealthResponse:
    symptom_lower = symptom.lower()
    if "fever" in symptom_lower or "cough" in symptom_lower:
        return StructuredHealthResponse(
            summary=f"Assessment for report '{symptom}'. Symptoms indicate possible upper respiratory infection.",
            possible_causes=["Common Cold", "Influenza (Flu)", "Acute Bronchitis"],
            self_care=["Rest and sleep", "Stay hydrated with warm broths", "Acetaminophen for fever management"],
            warning_signs=["Fever over 103°F", "Shortness of breath", "Chest pain when breathing"],
            when_to_see_doctor="See a doctor if symptoms persist past 10 days or worsen.",
            disclaimer="Simulated assessment for demonstration purposes only. Consult a doctor.",
            is_emergency=False,
            source="mock",
            suggested_specialty="Lung Doctor"
        )
    return StructuredHealthResponse(
        summary=f"Assessment for report '{symptom}'. Non-specific general complaints identified.",
        possible_causes=["Muscle Strain", "Seasonal Allergies", "Fatigue"],
        self_care=["Gentle stretching", "Adequate hydration", "Rest"],
        warning_signs=["Sudden increase in pain", "Numbness or tingling"],
        when_to_see_doctor="See a clinician if symptoms affect daily routines.",
        disclaimer="Simulated assessment for demonstration purposes only. Consult a doctor.",
        is_emergency=False,
        source="mock",
        suggested_specialty="General Doctor"
    )

def generate_mock_vision_assessment(category: str) -> StructuredHealthResponse:
    if category == "medication_packaging":
        return StructuredHealthResponse(
            summary="Vision simulation: Identified packaging for 'Amoxicillin 500mg capsules', a penicillin-class antibiotic.",
            possible_causes=["Bacterial Infection"],
            self_care=["Complete full course of medication", "Take with food to minimize nausea"],
            warning_signs=["Severe allergic reactions (hives, face swelling)", "Watery/bloody diarrhea"],
            when_to_see_doctor="Report immediately if hives or swelling occurs.",
            disclaimer="Simulated visual analysis. Consult your prescribing clinician.",
            is_emergency=False,
            source="mock",
            suggested_specialty="General Doctor"
        )
    return StructuredHealthResponse(
        summary="Vision simulation: Red localized rash indicating contact dermatitis or a localized reaction.",
        possible_causes=["Contact Dermatitis", "Eczema", "Insect Bite"],
        self_care=["Apply cold compress to relieve itching", "Avoid scratching the area"],
        warning_signs=["Spreading rapidly", "Warm to touch or oozing yellow crusts"],
        when_to_see_doctor="Consult if not resolved in 5 days.",
        disclaimer="Simulated visual analysis. Consult a physician.",
        is_emergency=False,
        source="mock",
        suggested_specialty="Skin Doctor"
    )

def generate_mock_medication(name: str) -> MedicationInfo:
    return MedicationInfo(
        name=name.capitalize(),
        uses=["Temporary fever reduction", "Relief of mild to moderate aches and pain"],
        typical_dosage="1-2 tablets every 4-6 hours as needed. Maximum 4,000mg/day.",
        common_side_effects=["Nausea", "Headache", "Stomach discomfort"],
        serious_side_effects=["Hives/Skin peeling", "Liver toxicity indicators (jaundice)"],
        interaction_warnings=["Avoid excessive alcohol intake", "Do not double-dose with similar ingredients"],
        disclaimer="Simulated profile. Consult a certified pharmacist.",
        source="mock"
    )

def generate_mock_tips(category: str, language: str = "en") -> List[HealthTip]:
    if language == "hi":
        return [
            HealthTip(
                title=f"नियमित {category} दिनचर्या",
                content=f"दैनिक समान समय पर {category} करने से शरीर का प्राकृतिक चक्र बेहतर होता है।",
                category=category
            ),
            HealthTip(
                title=f"हाइड्रेशन और {category}",
                content="सक्रिय अवधियों के दौरान पानी का पर्याप्त सेवन शारीरिक कार्यों को अनुकूलित करता है।",
                category=category
            )
        ]
    elif language == "mr":
        return [
            HealthTip(
                title=f"नियमित {category} वेळापत्रक",
                content=f"दररोज एकाच वेळी {category} केल्याने शरीराचे नैसर्गिक चक्र सुधारते.",
                category=category
            ),
            HealthTip(
                title=f"हायड्रेशन आणि {category}",
                content="सक्रिय कालावधीत पाणी पिण्यामुळे शरीराची कार्यक्षमता वाढते.",
                category=category
            )
        ]
    else:
        return [
            HealthTip(
                title=f"Consistent {category} Schedule",
                content=f"Going to sleep or exercising at identical times daily builds reliable circadian cycles.",
                category=category
            ),
            HealthTip(
                title=f"Hydration & {category}",
                content="Water consumption optimizes cellular functions during active periods.",
                category=category
            )
        ]
