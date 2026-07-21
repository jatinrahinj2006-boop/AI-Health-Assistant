import unittest
import sys
import os

# Adjust path to import app package correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.emergency_detector import detect_emergency

class TestEmergencyKeywords(unittest.TestCase):
    def test_emergency_chest_pain(self):
        is_emergency, message = detect_emergency("I have severe chest pain radiating to my left arm")
        self.assertTrue(is_emergency)
        self.assertIn("chest pain", message)

    def test_emergency_suicidal_intent(self):
        is_emergency, message = detect_emergency("I feel hopeless and want to end my life")
        self.assertTrue(is_emergency)
        self.assertIn("988", message)

    def test_non_emergency_cold_symptoms(self):
        is_emergency, message = detect_emergency("I have a mild runny nose and occasional sneeze")
        self.assertFalse(is_emergency)
        self.assertIsNone(message)

if __name__ == '__main__':
    unittest.main()
