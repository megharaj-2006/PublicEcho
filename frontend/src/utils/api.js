const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get auth headers containing JWT token
function getAuthHeaders() {
  const token = localStorage.getItem('publicecho_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Handler for parsing fetch responses
async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API request failed.');
  }
  return data;
}

export const api = {
  // 1. Authentication APIs
  async registerCitizen(name, email, password, phone) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone })
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('publicecho_token', data.token);
      localStorage.setItem('publicecho_user', JSON.stringify(data.user));
    }
    return data;
  },

  async loginCitizen(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('publicecho_token', data.token);
      localStorage.setItem('publicecho_user', JSON.stringify(data.user));
    }
    return data;
  },

  async loginOfficial(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/official/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('publicecho_token', data.token);
      localStorage.setItem('publicecho_user', JSON.stringify(data.user));
    }
    return data;
  },

  async loginGoogle(email, name) {
    const res = await fetch(`${API_BASE_URL}/auth/google/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('publicecho_token', data.token);
      localStorage.setItem('publicecho_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  logout() {
    localStorage.removeItem('publicecho_token');
    localStorage.removeItem('publicecho_user');
  },

  // 2. Grievance Management APIs
  async getPopularGrievances(lat, lng) {
    let url = `${API_BASE_URL}/grievances/public/popular`;
    if (lat && lng) {
      url += `?lat=${lat}&lng=${lng}`;
    }
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async toggleUpvote(id) {
    const res = await fetch(`${API_BASE_URL}/grievances/${id}/upvote`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async checkDuplicateGrievances(latitude, longitude, department_id) {
    const res = await fetch(`${API_BASE_URL}/grievances/check-duplicates?latitude=${latitude}&longitude=${longitude}&department_id=${department_id}`);
    return handleResponse(res);
  },

  async getDepartments() {
    const res = await fetch(`${API_BASE_URL}/grievances/departments`);
    return handleResponse(res);
  },

  async getWards() {
    const res = await fetch(`${API_BASE_URL}/grievances/wards`);
    return handleResponse(res);
  },

  async acceptComplaint(id) {
    const res = await fetch(`${API_BASE_URL}/grievances/${id}/accept`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async rejectComplaint(id) {
    const res = await fetch(`${API_BASE_URL}/grievances/${id}/reject`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async postComplaintUpdate(id, message) {
    const res = await fetch(`${API_BASE_URL}/grievances/${id}/update`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ update_message: message })
    });
    return handleResponse(res);
  },

  async resolveComplaint(id, solution_image_url, solution_description) {
    const res = await fetch(`${API_BASE_URL}/grievances/${id}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ solution_image_url, solution_description })
    });
    return handleResponse(res);
  },

  async getLeaderboard() {
    const res = await fetch(`${API_BASE_URL}/grievances/leaderboard`);
    return handleResponse(res);
  },

  async createGrievance(title, description, category_id, ward_id, latitude, longitude, address, image_url) {
    const res = await fetch(`${API_BASE_URL}/grievances`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, description, category_id, ward_id, latitude, longitude, address, image_url })
    });
    return handleResponse(res);
  },

  async getCitizenGrievances() {
    const res = await fetch(`${API_BASE_URL}/grievances/citizen`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getOfficialGrievances() {
    const res = await fetch(`${API_BASE_URL}/grievances/official`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getTimeline(id) {
    const res = await fetch(`${API_BASE_URL}/grievances/${id}/timeline`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async updateStatus(id, status, notes) {
    const res = await fetch(`${API_BASE_URL}/grievances/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes })
    });
    return handleResponse(res);
  },

  async escalateGrievance(id) {
    const res = await fetch(`${API_BASE_URL}/grievances/${id}/escalate`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async submitFeedback(grievance_id, rating_speed, rating_quality, rating_communication, comment) {
    const res = await fetch(`${API_BASE_URL}/grievances/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ grievance_id, rating_speed, rating_quality, rating_communication, comment })
    });
    return handleResponse(res);
  },

  // 3. New Official & Admin Upgrades APIs
  async registerOfficial(name, email, password, jurisdiction_id, department_id, designation, office_address, office_id_proof, photo_proof) {
    const res = await fetch(`${API_BASE_URL}/auth/official/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, jurisdiction_id, department_id, designation, office_address, office_id_proof, photo_proof })
    });
    return handleResponse(res);
  },

  async verifyOTP(email, code) {
    const res = await fetch(`${API_BASE_URL}/auth/official/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('publicecho_token', data.token);
      localStorage.setItem('publicecho_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getPendingOfficials() {
    const res = await fetch(`${API_BASE_URL}/auth/admin/pending`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async approveOfficial(id) {
    const res = await fetch(`${API_BASE_URL}/auth/admin/approve/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async rejectOfficial(id) {
    const res = await fetch(`${API_BASE_URL}/auth/admin/reject/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};
