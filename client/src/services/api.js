const API_BASE = '/api/v1';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('pathfinder_access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        // Token expired or invalid
        localStorage.removeItem('pathfinder_access_token');
        localStorage.removeItem('pathfinder_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),

  // User & Profile
  getProfile: () => apiRequest('/users/profile'),
  updateProfile: (payload) => apiRequest('/users/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  deleteMyData: () => apiRequest('/users/me', { method: 'DELETE' }),
  exportMyData: () => apiRequest('/users/me/export'),

  // Assessment
  getQuestions: () => apiRequest('/assessments/questions'),
  submitAssessment: (payload) => apiRequest('/assessments', { method: 'POST', body: JSON.stringify(payload) }),
  getLatestAssessment: (studentId) => apiRequest(studentId ? `/assessments/student/${studentId}` : '/assessments/latest'),

  // Recommendations
  generateRecommendations: () => apiRequest('/recommendations/generate', { method: 'POST' }),
  getLatestRecommendation: (studentId) => apiRequest(studentId ? `/recommendations/student/${studentId}` : '/recommendations/latest'),

  // Roadmap
  generateRoadmap: (careerId) => apiRequest('/roadmaps/generate', { method: 'POST', body: JSON.stringify({ careerId }) }),
  getRoadmap: (careerId, studentId) => {
    let url = studentId ? `/roadmaps/student/${studentId}` : '/roadmaps/current';
    if (careerId) url += `?careerId=${careerId}`;
    return apiRequest(url);
  },
  toggleMilestone: (milestoneId) => apiRequest(`/roadmaps/milestones/${milestoneId}`, { method: 'PATCH' }),

  // AI Career Coach
  askCoach: (question) => apiRequest('/coach/chat', { method: 'POST', body: JSON.stringify({ question }) }),

  // Counselor
  getCounselorKPIs: () => apiRequest('/counselor/kpis'),
  getCounselorAnalytics: () => apiRequest('/counselor/analytics'),
  getCounselorStudents: () => apiRequest('/counselor/students'),
  getStudentBrief: (studentId) => apiRequest(`/counselor/students/${studentId}/brief`),
  submitCounselorReview: (payload) => apiRequest('/counselor/reviews', { method: 'POST', body: JSON.stringify(payload) }),

  // Admin
  getAILogs: () => apiRequest('/admin/ai-logs'),
  getUsers: () => apiRequest('/admin/users')
};
