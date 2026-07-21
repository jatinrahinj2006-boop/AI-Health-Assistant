from pydantic import BaseModel, Field
from typing import List, Optional

# --- Phase 1: Models and Schemas ---

class StructuredHealthResponse(BaseModel):
    summary: str = Field(..., description="A brief clinical summary of symptoms, duration, and user details")
    possible_causes: List[str] = Field(..., description="List of potential causes or conditions linked to these symptoms")
    self_care: List[str] = Field(..., description="Actionable, evidence-based self-care and home-care recommendations")
    warning_signs: List[str] = Field(..., description="Warning signs or red flags indicating worsening condition")
    when_to_see_doctor: str = Field(..., description="Guidelines on when and how urgently to consult a physician")
    disclaimer: str = Field(..., description="Standard clinical disclaimer stating this is not a diagnosis")
    is_emergency: bool = Field(..., description="Set to True if symptoms represent a critical medical emergency")
    emergency_message: Optional[str] = Field(None, description="Immediate warnings or actions to take if is_emergency is True")
    source: str = Field("live", description="'live' or 'mock' data source indicator")

class ChatQA(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text content")

class ChatRequest(BaseModel):
    message: str = Field(..., description="The current user message")
    history: List[ChatQA] = Field(default=[], description="Recent conversation history context")

class ChatResponse(BaseModel):
    chat_reply: str = Field(..., description="Conversational health guidance response")
    assessment: Optional[StructuredHealthResponse] = Field(None, description="Accompanying structured card if symptoms are discussed")
    source: str = Field("live", description="'live' or 'mock' data source indicator")

class SymptomCheckerStartRequest(BaseModel):
    symptom: str = Field(..., description="The user's initial free-text symptom description")

class SymptomQA(BaseModel):
    question: str = Field(..., description="Intake follow-up question text")
    answer: str = Field(..., description="Patient's response to the question")

class SymptomCheckerFollowUpRequest(BaseModel):
    symptom: str = Field(..., description="The patient's initial primary symptom")
    history: List[SymptomQA] = Field(default=[], description="Questions and answers recorded so far in this session")

class FollowUpQuestion(BaseModel):
    question_text: str = Field(..., description="The text of the follow-up question")
    options: List[str] = Field(default=[], description="A list of multiple choice options if applicable")

class SymptomCheckerQuestionsResponse(BaseModel):
    done: bool = Field(..., description="Set to True if clinical assessment is ready; False if more details are needed")
    next_question: Optional[FollowUpQuestion] = Field(None, description="The next follow-up question to present if done is False")
    assessment: Optional[StructuredHealthResponse] = Field(None, description="The final health assessment if done is True")
    source: str = Field("live", description="'live' or 'mock' data source indicator")

class MedicationRequest(BaseModel):
    medication_name: str = Field(..., description="Name of the medicine/drug to lookup")

class MedicationInfo(BaseModel):
    name: str = Field(..., description="Generic and brand name of the drug")
    uses: List[str] = Field(..., description="Indicated clinical uses")
    typical_dosage: str = Field(..., description="Recommended administration guidelines and dosage")
    common_side_effects: List[str] = Field(..., description="Frequent or mild side effects")
    serious_side_effects: List[str] = Field(..., description="Severe side effects requiring immediate clinical reporting")
    interaction_warnings: List[str] = Field(..., description="Major known drug-drug or food-drug interaction warnings")
    disclaimer: str = Field(..., description="Specific pharmacological disclaimer")
    source: str = Field("live", description="'live' or 'mock' data source indicator")

class HealthTip(BaseModel):
    title: str = Field(..., description="Wellness title")
    content: str = Field(..., description="Brief actionable tip content")
    category: str = Field(..., description="Wellness category (e.g. Fitness, Sleep, Nutrition)")

class HealthTipsResponse(BaseModel):
    tips: List[HealthTip] = Field(..., description="A list of daily wellness tips")
    source: str = Field("live", description="'live' or 'mock' data source indicator")

# Visual response matches the standard structured health format
class ImageAnalysisResponse(StructuredHealthResponse):
    pass
