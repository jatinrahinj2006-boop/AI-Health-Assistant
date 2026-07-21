import { useState, useCallback } from 'react';

const SUICIDE_REGEX = /\b(suicid|kill myself|end my life|self harm|want to die|cut myself|hanging myself|overdose|poison myself|take my own life)\b/i;
const CHEST_PAIN_REGEX = /\b(chest pain|heart attack|crushing chest|pain in chest|chest tightness|angina|pressure in chest|pain radiating to arm)\b/i;
const STROKE_REGEX = /\b(face droop|slurred speech|one-sided weakness|numbness on one side|cannot speak|can\'t speak|speech slurred|drooping face|weakness on left side|weakness on right side)\b/i;
const BREATHING_REGEX = /\b(shortness of breath|difficulty breathing|cannot breathe|can\'t breathe|gasping|suffocating|severe asthma|cyanosis|choking)\b/i;
const BLEEDING_REGEX = /\b(severe bleeding|bleeding profusely|gushing blood|arterial bleed|uncontrolled bleed|hemorrhage|haemorrhage)\b/i;
const CONSCIOUSNESS_REGEX = /\b(passed out|loss of consciousness|unconscious|fainted|blacked out|syncope|cannot wake up|unresponsive)\b/i;

export const useEmergencyCheck = () => {
  const [emergency, setEmergency] = useState({
    isEmergency: false,
    isSuicidal: false,
    message: '',
    crisisInfo: '',
  });

  const checkText = useCallback((text) => {
    if (!text) {
      const reset = { isEmergency: false, isSuicidal: false, message: '', crisisInfo: '' };
      setEmergency(reset);
      return reset;
    }

    // 1. Suicidal intent
    if (SUICIDE_REGEX.test(text)) {
      const result = {
        isEmergency: true,
        isSuicidal: true,
        message:
          "It sounds like you are going through an extremely difficult time. Please know that you are not alone, and there is support available. We want you to be safe. Please reach out to someone who can help right now.",
        crisisInfo:
          "National Suicide Prevention Lifeline: Call or text 988 (USA/Canada) or visit 988lifeline.org. In the UK, call 111. In Australia, call 13 11 14. If you are in immediate danger, please contact your local emergency services (e.g., 911, 999) or go to the nearest hospital. Help is free, confidential, and available 24/7.",
      };
      setEmergency(result);
      return result;
    }

    // 2. Physical emergencies
    const reasons = [];
    if (CHEST_PAIN_REGEX.test(text)) reasons.push("signs of a potential cardiac event (chest pain/pressure)");
    if (STROKE_REGEX.test(text)) reasons.push("signs of a potential stroke (face drooping, speech difficulty, or one-sided weakness)");
    if (BREATHING_REGEX.test(text)) reasons.push("severe breathing difficulties");
    if (BLEEDING_REGEX.test(text)) reasons.push("severe or uncontrolled bleeding");
    if (CONSCIOUSNESS_REGEX.test(text)) reasons.push("loss of consciousness or unresponsiveness");

    if (reasons.length > 0) {
      const reasonStr = reasons.join(' and ');
      const result = {
        isEmergency: true,
        isSuicidal: false,
        message: `WARNING: Your entry indicates ${reasonStr}. This could be a life-threatening medical emergency. Please call your local emergency services (e.g., 911, 999) or go to the nearest emergency room immediately. Do NOT wait for further assessment.`,
        crisisInfo: '',
      };
      setEmergency(result);
      return result;
    }

    const clear = { isEmergency: false, isSuicidal: false, message: '', crisisInfo: '' };
    setEmergency(clear);
    return clear;
  }, []);

  const resetEmergency = useCallback(() => {
    setEmergency({
      isEmergency: false,
      isSuicidal: false,
      message: '',
      crisisInfo: '',
    });
  }, []);

  return {
    isEmergency: emergency.isEmergency,
    isSuicidal: emergency.isSuicidal,
    emergencyMessage: emergency.message,
    crisisInfo: emergency.crisisInfo,
    checkText,
    resetEmergency,
  };
};
