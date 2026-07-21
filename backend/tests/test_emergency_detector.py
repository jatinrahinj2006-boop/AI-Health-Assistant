import unittest
import sys
import os

# Adjust path to import app package correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.emergency_detector import detect_emergency

class TestEmergencyDetector(unittest.TestCase):
    
    # === POSITIVE TESTS (EMERGENCY CASES) ===
    
    def test_chest_pain(self):
        is_em, msg = detect_emergency("I am having crushing chest pain radiating down my left arm")
        self.assertTrue(is_em)
        self.assertIn("chest pain", msg)
        
        is_em, msg = detect_emergency("felt a sudden pressure in chest and angina")
        self.assertTrue(is_em)
        self.assertIn("chest pain", msg)

    def test_stroke_symptoms(self):
        is_em, msg = detect_emergency("my grandmother has sudden face droop and slurred speech")
        self.assertTrue(is_em)
        self.assertIn("stroke", msg)
        
        is_em, msg = detect_emergency("I woke up with numbness on one side of my body and cannot speak")
        self.assertTrue(is_em)
        self.assertIn("stroke", msg)

    def test_breathing_difficulty(self):
        is_em, msg = detect_emergency("I can't breathe, gasping for air")
        self.assertTrue(is_em)
        self.assertIn("respiratory", msg)
        
        is_em, msg = detect_emergency("child is choking and suffocating")
        self.assertTrue(is_em)
        self.assertIn("respiratory", msg)

    def test_severe_bleeding(self):
        is_em, msg = detect_emergency("there is gushing blood from a deep cut and severe bleeding")
        self.assertTrue(is_em)
        self.assertIn("bleeding", msg)
        
        is_em, msg = detect_emergency("arterial bleed from a kitchen accident")
        self.assertTrue(is_em)
        self.assertIn("bleeding", msg)

    def test_suicidal_intent(self):
        is_em, msg = detect_emergency("I feel completely hopeless and want to end my life")
        self.assertTrue(is_em)
        self.assertIn("988", msg)
        
        is_em, msg = detect_emergency("thinking about suicide and self harm")
        self.assertTrue(is_em)
        self.assertIn("988", msg)

    # === NEGATIVE TESTS (NON-EMERGENCY CASES) ===
    
    def test_mild_cough(self):
        is_em, msg = detect_emergency("I have had a mild dry cough for 3 days")
        self.assertFalse(is_em)
        self.assertIsNone(msg)

    def test_runny_nose(self):
        is_em, msg = detect_emergency("runny nose and minor scratch on my knee")
        self.assertFalse(is_em)
        self.assertIsNone(msg)

    def test_normal_headache(self):
        is_em, msg = detect_emergency("have a slight headache from studying too long")
        self.assertFalse(is_em)
        self.assertIsNone(msg)

    def test_stubbed_toe(self):
        is_em, msg = detect_emergency("stubbed my toe against the table leg, it hurts when walking")
        self.assertFalse(is_em)
        self.assertIsNone(msg)

    def test_back_pain(self):
        is_em, msg = detect_emergency("lower back soreness from heavy lifting yesterday")
        self.assertFalse(is_em)
        self.assertIsNone(msg)

    def test_informational_chest_pain_article(self):
        is_em, msg = detect_emergency("I read an article about chest pain symptoms online... want to understand what causes them")
        self.assertFalse(is_em)
        self.assertIsNone(msg)

    def test_learning_heart_attack(self):
        is_em, msg = detect_emergency("explain to me what causes a heart attack and its symptoms")
        self.assertFalse(is_em)
        self.assertIsNone(msg)

if __name__ == '__main__':
    unittest.main()
