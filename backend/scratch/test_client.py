import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

response = client.post("/api/nearby-specialists", json={
    "specialty": "Heart Doctor"
})

print("Status Code:", response.status_code)
print("Response JSON:", response.json())
