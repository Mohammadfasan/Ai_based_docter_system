// services/appointmentAPI.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const appointmentAPI = {
  // Create new appointment
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get my appointments (patient)
  getMyAppointments: async () => {
    try {
      const response = await api.get('/appointments/my-appointments');
      return response.data;
    } catch (error) {
      console.error('Error fetching my appointments:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get doctor's appointments
  getDoctorAppointments: async (doctorId) => {
    try {
      const response = await api.get(`/appointments/doctor/${doctorId}/appointments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor appointments:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId) => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status, cancellationReason = null) => {
    try {
      const data = { status };
      if (cancellationReason) {
        data.cancellationReason = cancellationReason;
      }
      const response = await api.patch(`/appointments/${appointmentId}/status`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating appointment status:', error.response?.data || error.message);
      throw error;
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId, reason = '') => {
    try {
      const response = await api.patch(`/appointments/${appointmentId}/status`, { 
        status: 'cancelled',
        cancellationReason: reason || 'Cancelled by patient'
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling appointment:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete appointment
  deleteAppointment: async (appointmentId) => {
    try {
      const response = await api.delete(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting appointment:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete expired appointments
  deleteExpiredAppointments: async () => {
    try {
      const response = await api.delete('/appointments/expired');
      return response.data;
    } catch (error) {
      console.error('Error deleting expired appointments:', error.response?.data || error.message);
      throw error;
    }
  },

  // Attach medical record to appointment
  attachRecord: async (appointmentId, recordId, recordData = {}) => {
    try {
      const response = await api.post(`/appointments/${appointmentId}/attach`, {
        recordId,
        recordType: recordData.recordType || 'medical_record',
        recordName: recordData.recordName || 'Medical Record',
        recordUrl: recordData.recordUrl || '',
        uploadedBy: recordData.uploadedBy || null
      });
      return response.data;
    } catch (error) {
      console.error('Error attaching record:', error.response?.data || error.message);
      throw error;
    }
  },

  // Remove attached record from appointment
  removeAttachedRecord: async (appointmentId, recordId) => {
    try {
      const response = await api.delete(`/appointments/${appointmentId}/attach/${recordId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing record:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get patient stats
  getPatientStats: async () => {
    try {
      const response = await api.get('/appointments/stats/patient');
      return response.data;
    } catch (error) {
      console.error('Error fetching patient stats:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get doctor stats
  getDoctorStats: async (doctorId) => {
    try {
      const response = await api.get(`/appointments/stats/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor stats:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get available slots (convenience method)
  getAvailableSlots: async (doctorId, date = null) => {
    try {
      let url = `/appointments/available-slots/${doctorId}`;
      if (date) {
        url += `?date=${date}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching available slots:', error.response?.data || error.message);
      throw error;
    }
  },

  // Complete appointment (mark as completed)
  completeAppointment: async (appointmentId) => {
    try {
      const response = await api.patch(`/appointments/${appointmentId}/status`, { 
        status: 'completed' 
      });
      return response.data;
    } catch (error) {
      console.error('Error completing appointment:', error.response?.data || error.message);
      throw error;
    }
  },

  // Mark as no-show
  markAsNoShow: async (appointmentId) => {
    try {
      const response = await api.patch(`/appointments/${appointmentId}/status`, { 
        status: 'no-show' 
      });
      return response.data;
    } catch (error) {
      console.error('Error marking as no-show:', error.response?.data || error.message);
      throw error;
    }
  }
};