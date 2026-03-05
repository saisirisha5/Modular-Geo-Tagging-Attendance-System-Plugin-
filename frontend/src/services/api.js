// services/api.js

import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

/* ==========================
   AXIOS INSTANCE
========================== */

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

/* ==========================
   REQUEST INTERCEPTOR
   Attach JWT automatically
========================== */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* ==========================
   RESPONSE INTERCEPTOR
   Handle expired sessions
========================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response) {

      // Handle expired login
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      // Convert backend message into JS Error
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "Something went wrong";

      return Promise.reject(new Error(message));
    }

    return Promise.reject(new Error(error.message));
  }
);
/* ==========================
   API SERVICE CLASS
========================== */

class ApiService {

  /* ---------- AUTH ---------- */

  async login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  }

  async signup(name, email, password, role, mobileNumber, address) {
    const res = await api.post("/auth/signup", {
      name,
      email,
      password,
      role,
      mobileNumber,
      address
    });

    return res.data;
  }

  /* ---------- SESSION ---------- */

  setUserSession(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }

  getUserSession() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    return token && user ? { token, user: JSON.parse(user) } : null;
  }

  clearUserSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  isAuthenticated() {
    return !!localStorage.getItem("token");
  }

  getUserRole() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).role : null;
  }

  /* ---------- ADMIN ---------- */

  async getWorkers() {
    const res = await api.get("/admin/workers");
    return res.data;
  }

  async getAssignments() {
    const res = await api.get("/admin/assignments");
    return res.data;
  }

  async createAssignment(data) {
    const res = await api.post("/admin/assign", data);
    return res.data;
  }

  async updateAssignment(id, data) {
    const res = await api.put(`/admin/assignments/${id}`, data);
    return res.data;
  }

  async deleteAssignment(id) {
    const res = await api.delete(`/admin/assignments/${id}`);
    return res.data;
  }

  /* ---------- WORKER ---------- */

  async getAssignmentsForWorker() {
    const res = await api.get("/worker/assignments");
    return res.data;
  }

  async getTodayAssignments() {
    const res = await api.get("/worker/assignments/today");
    return res.data;
  }

  async getUpcomingAssignments() {
    const res = await api.get("/worker/assignments/upcoming");
    return res.data;
  }

  async getAttendanceStatus() {
    const res = await api.get("/worker/attendance/status");
    return res.data;
  }

  async startAttendance(assignmentId, lat, lng) {
    const res = await api.post("/worker/attendance/start", {
      assignment_id: assignmentId,
      latitude: lat,
      longitude: lng
    });

    return res.data;
  }

  async endAttendance(assignmentId, lat, lng) {
    const res = await api.post("/worker/attendance/end", {
      assignment_id: assignmentId,
      latitude: lat,
      longitude: lng
    });

    return res.data;
  }
}

/* ==========================
   EXPORT
========================== */

const apiService = new ApiService();
export default apiService;