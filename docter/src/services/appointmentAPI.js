
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ CRITICAL: Add token to EVERY request BEFORE it's sent
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('currentUser');
    
    console.log('🔐 [API Request]', config.method.toUpperCase(), config.url);
    console.log('   Token:', token ? '✅ Present' : '❌ Missing');
    console.log('   User:', currentUser ? JSON.parse(currentUser).name : 'Not logged in');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('   Authorization header set');
    } else {
      console.warn('   ⚠️ NO TOKEN FOUND - Request may fail');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ✅ Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ [API Response]', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ [API Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized (401) - Clearing auth and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const appointmentAPI = {
  // ✅ Get my appointments (PATIENT ONLY - USES AUTH)
  getMyAppointments: async () => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      console.group('📋 [GET MY APPOINTMENTS]');
      console.log('User:', currentUser.name, `(${currentUser.userId || currentUser._id})`);
      console.log('Token present:', !!token);

      if (!token) {
        console.error('❌ NO TOKEN - User must be logged in');
        console.groupEnd();
        return {
          success: false,
          message: 'Not authenticated. Please login.',
          data: []
        };
      }

      if (!currentUser.userId && !currentUser._id) {
        console.error('❌ NO USER ID - Cannot identify patient');
        console.groupEnd();
        return {
          success: false,
          message: 'User information missing. Please login again.',
          data: []
        };
      }

      // ✅ Call endpoint that filters by authenticated user (req.user)
      const response = await api.get('/appointments/my-appointments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Appointments returned:', response.data?.count || 0);
      console.log('Data:', response.data);
      console.groupEnd();

      return response.data;
    } catch (error) {
      console.error('❌ Error fetching my appointments:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      });
      console.groupEnd();

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch appointments',
        data: [],
        error: error.response?.data
      };
    }
  },

  // Get doctor's appointments
  getDoctorAppointments: async (doctorId) => {
    try {
      console.log('📋 Getting appointments for doctor:', doctorId);
      const response = await api.get(`/appointments/doctor/${doctorId}/appointments`);
      console.log('Doctor appointments:', response.data?.count || 0);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching doctor appointments:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId) => {
    try {
      console.log('📋 Getting appointment:', appointmentId);
      const response = await api.get(`/appointments/${appointmentId}`);
      console.log('Appointment found:', response.data?.data?.appointmentId);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching appointment:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create appointment
  createAppointment: async (appointmentData) => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      console.group('📝 [CREATE APPOINTMENT]');
      console.log('User:', currentUser.name);
      console.log('Doctor:', appointmentData.doctorName);
      console.log('Date:', appointmentData.date, 'Time:', appointmentData.time);

      if (!token) {
        console.error('❌ NO TOKEN');
        console.groupEnd();
        throw new Error('Not authenticated');
      }

      const response = await api.post('/appointments', appointmentData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ Appointment created:', response.data?.data?.appointmentId);
      console.groupEnd();

      return response.data;
    } catch (error) {
      console.error('❌ Error creating appointment:', error.response?.data || error.message);
      console.groupEnd();
      throw error;
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status, cancellationReason = null) => {
    try {
      const token = localStorage.getItem('token');

      console.log(`📝 Updating appointment ${appointmentId} to status: ${status}`);

      const data = { status };
      if (cancellationReason) {
        data.cancellationReason = cancellationReason;
      }

      const response = await api.patch(`/appointments/${appointmentId}/status`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ Status updated:', status);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating appointment status:', error.response?.data || error.message);
      throw error;
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId, reason = '') => {
    try {
      const token = localStorage.getItem('token');

      console.log('❌ Cancelling appointment:', appointmentId);

      const response = await api.patch(
        `/appointments/${appointmentId}/status`,
        {
          status: 'cancelled',
          cancellationReason: reason || 'Cancelled by patient'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('✅ Appointment cancelled');
      return response.data;
    } catch (error) {
      console.error('❌ Error cancelling appointment:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete appointment
  deleteAppointment: async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');

      console.log('🗑️ Deleting appointment:', appointmentId);

      const response = await api.delete(`/appointments/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ Appointment deleted');
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting appointment:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete expired appointments
  deleteExpiredAppointments: async () => {
    try {
      const token = localStorage.getItem('token');

      console.log('🗑️ Deleting expired appointments');

      const response = await api.delete('/appointments/expired', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ Expired appointments deleted:', response.data?.deletedCount);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting expired appointments:', error.response?.data || error.message);
      throw error;
    }
  },

  // Attach medical record to appointment
  attachRecord: async (appointmentId, recordId, recordData = {}) => {
    try {
      const token = localStorage.getItem('token');

      console.log('📎 Attaching record to appointment:', appointmentId);

      const response = await api.post(
        `/appointments/${appointmentId}/attach`,
        {
          recordId,
          recordType: recordData.recordType || 'medical_record',
          recordName: recordData.recordName || 'Medical Record',
          recordUrl: recordData.recordUrl || '',
          uploadedBy: recordData.uploadedBy || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('✅ Record attached');
      return response.data;
    } catch (error) {
      console.error('❌ Error attaching record:', error.response?.data || error.message);
      throw error;
    }
  },

  // Remove attached record from appointment
  removeAttachedRecord: async (appointmentId, recordId) => {
    try {
      const token = localStorage.getItem('token');

      console.log('🗑️ Removing attached record:', recordId);

      const response = await api.delete(`/appointments/${appointmentId}/attach/${recordId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ Record removed');
      return response.data;
    } catch (error) {
      console.error('❌ Error removing record:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get patient stats
  getPatientStats: async () => {
    try {
      const token = localStorage.getItem('token');

      console.log('📊 Getting patient stats');

      const response = await api.get('/appointments/stats/patient', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ Stats retrieved');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching patient stats:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get doctor stats
  getDoctorStats: async (doctorId) => {
    try {
      console.log('📊 Getting doctor stats for:', doctorId);

      const response = await api.get(`/appointments/stats/doctor/${doctorId}`);
      console.log('✅ Doctor stats retrieved');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching doctor stats:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get available slots
  getAvailableSlots: async (doctorId, date = null) => {
    try {
      let url = `/appointments/available-slots/${doctorId}`;
      if (date) {
        url += `?date=${date}`;
      }

      console.log('🎯 Getting available slots for doctor:', doctorId);

      const response = await api.get(url);
      console.log('✅ Slots retrieved:', response.data?.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching available slots:', error.response?.data || error.message);
      throw error;
    }
  },

  // Complete appointment
  completeAppointment: async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');

      console.log('✅ Marking appointment as completed:', appointmentId);

      const response = await api.patch(
        `/appointments/${appointmentId}/status`,
        { status: 'completed' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('✅ Appointment completed');
      return response.data;
    } catch (error) {
      console.error('❌ Error completing appointment:', error.response?.data || error.message);
      throw error;
    }
  },

  // Mark as no-show
  markAsNoShow: async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');

      console.log('⚠️ Marking appointment as no-show:', appointmentId);

      const response = await api.patch(
        `/appointments/${appointmentId}/status`,
        { status: 'no-show' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('✅ Appointment marked as no-show');
      return response.data;
    } catch (error) {
      console.error('❌ Error marking as no-show:', error.response?.data || error.message);
      throw error;
    }
  }
};