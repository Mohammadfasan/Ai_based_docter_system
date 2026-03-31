import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests with better error handling
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication error:', error.response?.data?.message);
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const doctorScheduleService = {
  // ============================================
  // LOGGED-IN DOCTOR ROUTES
  // ============================================
  
  // Get logged-in doctor's schedule
  getMySchedule: async () => {
    try {
      const response = await api.get('/doctor-schedule/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching my schedule:', error.response?.data || error.message);
      throw error;
    }
  },

  // Add slot for logged-in doctor
  addMySlot: async (slotData) => {
    try {
      const response = await api.post('/doctor-schedule/me/slots', slotData);
      return response.data;
    } catch (error) {
      console.error('Error adding slot:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete slot for logged-in doctor
  deleteMySlot: async (slotId) => {
    try {
      const response = await api.delete(`/doctor-schedule/me/slots/${slotId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting slot:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get stats for logged-in doctor
  getMyStats: async () => {
    try {
      const response = await api.get('/doctor-schedule/me/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching my stats:', error.response?.data || error.message);
      throw error;
    }
  },

  // ============================================
  // PATIENT ROUTES (view only)
  // ============================================
  
  // Get doctor's full schedule (by ID)
  getDoctorSchedule: async (doctorId) => {
    try {
      const response = await api.get(`/doctor-schedule/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor schedule:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get available slots for patients
  getAvailableSlots: async (doctorId, date = null) => {
    try {
      const url = date 
        ? `/doctor-schedule/${doctorId}/available-slots?date=${date}`
        : `/doctor-schedule/${doctorId}/available-slots`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching available slots:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get schedule statistics by doctor ID
  getScheduleStats: async (doctorId) => {
    try {
      const response = await api.get(`/doctor-schedule/${doctorId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule stats:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get slots by date range
  getSlotsByDateRange: async (doctorId, startDate, endDate) => {
    try {
      const response = await api.get(`/doctor-schedule/${doctorId}/date-range`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching slots by date range:', error.response?.data || error.message);
      throw error;
    }
  },

  // ============================================
  // ADMIN ROUTES (by specific ID)
  // ============================================
  
  // Add a single slot (admin use)
  addSlot: async (doctorId, slotData) => {
    try {
      const response = await api.post(`/doctor-schedule/${doctorId}/slots`, slotData);
      return response.data;
    } catch (error) {
      console.error('Error adding slot:', error.response?.data || error.message);
      throw error;
    }
  },

  // Add multiple slots (admin use)
  addMultipleSlots: async (doctorId, slots) => {
    try {
      const response = await api.post(`/doctor-schedule/${doctorId}/slots/batch`, { slots });
      return response.data;
    } catch (error) {
      console.error('Error adding multiple slots:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a slot (admin use)
  deleteSlot: async (doctorId, slotId) => {
    try {
      const response = await api.delete(`/doctor-schedule/${doctorId}/slots/${slotId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting slot:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update slot status (book/cancel)
  updateSlotStatus: async (doctorId, slotId, status, patientData = {}) => {
    try {
      const response = await api.patch(`/doctor-schedule/${doctorId}/slots/${slotId}/status`, {
        status,
        ...patientData
      });
      return response.data;
    } catch (error) {
      console.error('Error updating slot status:', error.response?.data || error.message);
      throw error;
    }
  }
};