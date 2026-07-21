from fastapi import APIRouter, Query, HTTPException
from app.models import HealthTipsResponse
from app.services.ai_service import generate_structured_response, generate_mock_tips
from app.config import GROQ_API_KEY

router = APIRouter(prefix="/api/health-tips", tags=["Health Tips"])

SYSTEM_TIPS_PROMPT = """You are a preventative clinical health and wellness expert.
Your job is to generate exactly 3 health and wellness tips for the requested category.
Output a JSON object matching this schema:
{
  "tips": [
    {
      "title": "Short title of the tip",
      "content": "A paragraph explanation of the tip (1-2 sentences)",
      "category": "The category requested"
    },
    ...
  ]
}
Ensure categories are mapped exactly as requested. Keep tips clinical, safe, and highly actionable.
"""

@router.get("", response_model=HealthTipsResponse)
async def health_tips_endpoint(
    category: str = Query("General", description="Wellness category tag"),
    language: str = Query("en", description="Language translation code (en, hi, mr)")
):
    """
    Returns 3 preventative daily wellness tips for the selected category.
    """
    if not GROQ_API_KEY:
        tips_list = generate_mock_tips(category, language)
        return HealthTipsResponse(tips=tips_list, source="mock")

    try:
        messages = [{"role": "user", "content": f"Generate health tips for category: '{category}'."}]
        
        lang_instruction = ""
        if language == "hi":
            lang_instruction = "\nYou MUST write the title and content in Hindi (हिन्दी)."
        elif language == "mr":
            lang_instruction = "\nYou MUST write the title and content in Marathi (मराठी)."

        tips_data = await generate_structured_response(
            messages=messages,
            schema_class=HealthTipsResponse,
            system_instruction=SYSTEM_TIPS_PROMPT + lang_instruction
        )
        return tips_data
    except Exception as e:
        # Fallback
        tips_list = generate_mock_tips(category, language)
        return HealthTipsResponse(tips=tips_list, source="mock")
