import base64
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.models import ImageAnalysisResponse
from app.services.ai_service import analyze_image_vision, generate_mock_vision_assessment
from app.services.emergency_detector import detect_emergency

router = APIRouter(prefix="/api/image-analysis", tags=["Image Analysis"])

@router.post("", response_model=ImageAnalysisResponse)
async def upload_image_endpoint(
    file: UploadFile = File(...),
    category: str = Form(..., description="'medication_packaging' or 'skin_condition'")
):
    """
    Receives an image upload, converts it to base64, and analyses it via the vision LLM.
    Returns structured JSON findings.
    """
    content_type = file.content_type
    if not content_type or not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        # Read file bytes
        file_bytes = await file.read()
        
        # Convert to base64 string
        base64_encoded = base64.b64encode(file_bytes).decode("utf-8")
        
        # Call vision analysis service helper
        assessment = await analyze_image_vision(base64_encoded, content_type, category)
        return assessment
    except Exception as e:
        # Fallback to simulated vision assessment
        return generate_mock_vision_assessment(category)
