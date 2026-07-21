import re
from typing import Tuple, Optional

# Compiled regular expressions for fast scanning
SUICIDE_REGEX = re.compile(
    r"\b(suicid|kill myself|end my life|self harm|want to die|cut myself|hanging myself|overdose|poison myself|take my own life)\b", 
    re.IGNORECASE
)

CHEST_PAIN_REGEX = re.compile(
    r"\b(chest pain|heart attack|crushing chest|pain in chest|chest tightness|angina|pressure in chest|pain radiating to arm)\b",
    re.IGNORECASE
)

STROKE_REGEX = re.compile(
    r"\b(face droop|slurred speech|one-sided weakness|numbness on one side|cannot speak|can\'t speak|speech slurred|drooping face|weakness on left side|weakness on right side)\b",
    re.IGNORECASE
)

BREATHING_REGEX = re.compile(
    r"\b(shortness of breath|difficulty breathing|cannot breathe|can\'t breathe|gasping|suffocating|severe asthma|cyanosis|choking)\b",
    re.IGNORECASE
)

BLEEDING_REGEX = re.compile(
    r"\b(severe bleeding|bleeding profusely|gushing blood|arterial bleed|uncontrolled bleed|hemorrhage|haemorrhage)\b",
    re.IGNORECASE
)

CONSCIOUSNESS_REGEX = re.compile(
    r"\b(passed out|loss of consciousness|unconscious|fainted|blacked out|syncope|cannot wake up|unresponsive)\b",
    re.IGNORECASE
)

def detect_emergency(text: str) -> Tuple[bool, Optional[str]]:
    """
    Performs rapid, keyword-based screening on user-provided text.
    Returns:
        (is_emergency: bool, emergency_message: Optional[str])
    """
    if not text:
        return False, None

    # 1. Check for Suicidal Ideation / Self-harm Intent
    if SUICIDE_REGEX.search(text):
        return True, (
            "SAFETY WARNING: It sounds like you may be going through a difficult time. Please know you are not alone. "
            "Help is available 24/7. National Suicide Prevention Lifeline: Call or text 988 (USA/Canada). "
            "In the UK, call 111. In Australia, call 13 11 14. If you are in immediate danger, "
            "please contact local emergency services (e.g. 911) or proceed to the nearest emergency room. "
            "Please reach out to someone who can support you."
        )

    # 2. Check physical emergency indicators
    reasons = []
    if CHEST_PAIN_REGEX.search(text):
        reasons.append("chest pain or potential cardiac event symptoms")
    if STROKE_REGEX.search(text):
        reasons.append("stroke indicators (facial droop, slurred speech, or weakness)")
    if BREATHING_REGEX.search(text):
        reasons.append("severe respiratory distress or shortness of breath")
    if BLEEDING_REGEX.search(text):
        reasons.append("severe, uncontrolled bleeding")
    if CONSCIOUSNESS_REGEX.search(text):
        reasons.append("loss of consciousness or unresponsiveness")

    if reasons:
        reason_str = " and ".join(reasons)
        return True, (
            f"WARNING: Your symptom description indicates {reason_str}. "
            "This could be a life-threatening medical emergency. "
            "Please call local emergency services (e.g., 911, 999, 112) or go to the nearest emergency room immediately. "
            "Do NOT delay or wait for further assessment."
        )

    return False, None

if __name__ == "__main__":
    print("Running local verification tests for emergency_detector.py...")
    
    # Test 1: Suicidal Intent
    is_em, msg = detect_emergency("I feel completely hopeless and want to end my life.")
    assert is_em is True, "Failed suicide check"
    assert "988" in msg, "Failed to include crisis hotline info"
    print("PASS: Test 1: Suicidal Intent detected.")

    # Test 2: Chest Pain
    is_em, msg = detect_emergency("I have a crushing chest pain that spreads to my neck")
    assert is_em is True, "Failed chest pain check"
    assert "cardiac" in msg, "Failed to include cardiorespiratory warning"
    print("PASS: Test 2: Chest Pain detected.")

    # Test 3: Standard cold
    is_em, msg = detect_emergency("I have a mild runny nose and minor cough")
    assert is_em is False, "Failed normal check"
    assert msg is None, "Message should be None"
    print("PASS: Test 3: Non-emergency query passed clean.")
    
    print("All tests completed successfully!")
