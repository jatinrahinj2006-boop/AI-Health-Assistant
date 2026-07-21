import unittest
import sys
import os

# Adjust path to import app package correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.routers.nearby_specialists import calculate_distance, SPECIALTY_MAPPING
from app.services.places_limiter import get_places_usage

class TestNearbySpecialists(unittest.TestCase):
    def test_distance_calculation(self):
        # Coordinates for two points in Mumbai:
        # Gateway of India (18.9220, 72.8347)
        # Marine Drive (18.9430, 72.8230)
        dist = calculate_distance(18.9220, 72.8347, 18.9430, 72.8230)
        self.assertGreater(dist, 0.0)
        self.assertLess(dist, 5.0)  # less than 5km

    def test_specialty_mapping(self):
        self.assertIn("Heart Doctor", SPECIALTY_MAPPING)
        self.assertEqual(SPECIALTY_MAPPING["Heart Doctor"], "cardiologist")
        self.assertEqual(SPECIALTY_MAPPING["Skin Doctor"], "dermatologist")
        self.assertEqual(SPECIALTY_MAPPING["Brain Surgeon"], "neurosurgeon")

    def test_places_usage_default(self):
        usage = get_places_usage()
        self.assertIn("month", usage)
        self.assertIn("count", usage)

if __name__ == '__main__':
    unittest.main()
