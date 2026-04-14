// src/services/prescriptionService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

// Create axios instance with auth header
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Prescription API calls
export const prescriptionAPI = {
  // Create a new prescription (Doctor only)
  createPrescription: async (prescriptionData) => {
    try {
      const response = await apiClient.post('/prescriptions', prescriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating prescription:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get prescriptions for a patient
  getPatientPrescriptions: async (patientId, filters = {}) => {
    try {
      const { status, search, page, limit } = filters;
      let url = `/prescriptions/patient/${patientId}`;
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get prescriptions for a doctor
  getDoctorPrescriptions: async (doctorId, filters = {}) => {
    try {
      const { status, search, page, limit } = filters;
      let url = `/prescriptions/doctor/${doctorId}`;
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (params.toString()) url += `?${params.toString()}`;
      
      console.log('Fetching doctor prescriptions:', url);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor prescriptions:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get single prescription by ID
  getPrescriptionById: async (prescriptionId) => {
    try {
      const response = await apiClient.get(`/prescriptions/${prescriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching prescription:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Update prescription (Doctor only)
  updatePrescription: async (prescriptionId, updateData) => {
    try {
      const response = await apiClient.put(`/prescriptions/${prescriptionId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating prescription:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Update prescription status
  updatePrescriptionStatus: async (prescriptionId, status) => {
    try {
      const response = await apiClient.patch(`/prescriptions/${prescriptionId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating prescription status:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Delete prescription (Doctor or Admin)
  deletePrescription: async (prescriptionId) => {
    try {
      const response = await apiClient.delete(`/prescriptions/${prescriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting prescription:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get prescription statistics (Admin only)
  getPrescriptionStats: async () => {
    try {
      const response = await apiClient.get('/prescriptions/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching prescription stats:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }
};

export default prescriptionAPI;