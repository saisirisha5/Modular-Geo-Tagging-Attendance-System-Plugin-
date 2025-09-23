// services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await axios({
        url,
        method: options.method || 'GET',
        headers: { ...defaultHeaders, ...options.headers },
        data: options.data || null,
      });
      return response.data;
    } catch (error) {
      console.error('API Request failed:', error);
      if (error.response) {
        throw new Error(
          error.response.data.message ||
          `HTTP error! status: ${error.response.status}`
        );
      }
      throw new Error(error.message);
    }
  }

  // -------------------------
  // Authentication methods
  // -------------------------
  async login(email, password) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      data: { email, password },
    });
  }

  async signup(name, email, password, role) {
    return this.makeRequest('/auth/signup', {
      method: 'POST',
      data: { name, email, password, role },
    });
  }

  // -------------------------
  // Session helpers
  // -------------------------
  setUserSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUserSession() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user ? { token, user: JSON.parse(user) } : null;
  }

  clearUserSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  getUserRole() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).role : null;
  }

  // -------------------------
// Admin methods
// -------------------------

  async getWorkers() {
    return this.makeRequest('/admin/workers');
  }

  async getAssignments() {
    return this.makeRequest('/admin/assignments');
  }

  async createAssignment(data) {
    return this.makeRequest('/admin/assign', {
      method: 'POST',
      data,
    });
  }

  async deleteAssignment(id) {
    return this.makeRequest(`/admin/assignments/${id}`, {
      method: 'DELETE',
    });
  }

}



const apiService = new ApiService();
export default apiService;
