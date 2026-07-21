const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    return '';
  }
  return '';
};

const BASE_URL = getBaseUrl();

async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { ...options.headers };
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error ${response.status}: `;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage += errorJson.detail || response.statusText;
      } catch {
        errorMessage += errorText || response.statusText;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error(`Request to ${endpoint} failed:`, error);
    throw error;
  }
}

export const api = {
  checkHealth: () => {
    return apiRequest('/health', { method: 'GET' });
  },

  sendChatMessage: (message, history = []) => {
    return apiRequest('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  },

  startSymptomCheck: (symptom) => {
    return apiRequest('/api/symptom-check/start', {
      method: 'POST',
      body: JSON.stringify({ symptom }),
    });
  },

  followUpSymptomCheck: (symptom, history = []) => {
    return apiRequest('/api/symptom-check/follow-up', {
      method: 'POST',
      body: JSON.stringify({ symptom, history }),
    });
  },

  lookupMedication: (medicationName) => {
    return apiRequest('/api/medication/lookup', {
      method: 'POST',
      body: JSON.stringify({ medication_name: medicationName }),
    });
  },

  getHealthTips: (category) => {
    const cat = encodeURIComponent(category);
    return apiRequest(`/api/health-tips?category=${cat}`, {
      method: 'GET',
    });
  },

  analyzeImage: (file, category) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category); // "medication_packaging" or "skin_condition"

    return apiRequest('/api/image-analysis', {
      method: 'POST',
      body: formData,
    });
  },
};
