import axios from 'axios';

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if needed
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method.toUpperCase()} request to: ${config.url}`, config.data);
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.data);
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      console.error('❌ API Error:', error.response.data);
      console.error('❌ Status:', error.response.status);
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.log('Unauthorized access - redirect to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response
      console.error('❌ No response from server:', error.request);
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// DOCTOR API SERVICES
// ============================================

const doctorAPI = {
  // GET all doctors (basic)
  getAllDoctors: async () => {
    try {
      const response = await axiosInstance.get('/doctors');
      return {
        success: true,
        data: response.data,
        message: 'Doctors fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctors',
        error: error.response?.data || error.message
      };
    }
  },

  // GET doctors with pagination and search - FIXED
  getPaginatedDoctors: async (page = 1, limit = 10, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });
      
      const response = await axiosInstance.get(`/doctors/paginated?${params}`);
      
      // Check if response.data has the expected structure
      if (response.data && response.data.success) {
        return {
          success: true,
          data: {
            doctors: response.data.doctors || [],
            total: response.data.total || 0,
            page: response.data.page || page,
            limit: response.data.limit || limit,
            totalPages: response.data.totalPages || 1,
            stats: response.data.stats || {
              active: 0,
              videoAvailable: 0,
              avgRating: 0
            }
          },
          message: 'Doctors fetched successfully'
        };
      } else {
        // Handle case where response structure is different
        return {
          success: true,
          data: {
            doctors: response.data.doctors || response.data || [],
            total: response.data.total || (response.data.doctors ? response.data.doctors.length : 0),
            page: page,
            limit: limit,
            totalPages: Math.ceil((response.data.total || 1) / limit) || 1,
            stats: response.data.stats || {
              active: 0,
              videoAvailable: 0,
              avgRating: 0
            }
          },
          message: 'Doctors fetched successfully'
        };
      }
    } catch (error) {
      console.error('Error fetching paginated doctors:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctors',
        error: error.response?.data || error.message
      };
    }
  },

  // GET single doctor by ID
  getDoctorById: async (id) => {
    try {
      const response = await axiosInstance.get(`/doctors/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Doctor fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch doctor',
        error: error.response?.data || error.message
      };
    }
  },

  // CREATE new doctor - FIXED
  createDoctor: async (doctorData) => {
    try {
      console.log('📤 Sending doctor data to server:', doctorData);
      
      const response = await axiosInstance.post('/doctors', doctorData);
      
      console.log('📥 Server response:', response.data);
      
      // Handle different response structures
      if (response.data) {
        // If response already has success property
        if (response.data.success) {
          return {
            success: true,
            data: response.data,
            message: response.data.message || 'Doctor created successfully',
            doctorId: response.data.doctorId || response.data.doctor?.doctorId,
            doctor: response.data.doctor || response.data
          };
        } else {
          // If response doesn't have success property but has data
          return {
            success: true,
            data: response.data,
            message: 'Doctor created successfully',
            doctorId: response.data.doctorId || response.data.doctor?.doctorId,
            doctor: response.data.doctor || response.data
          };
        }
      }
      
      throw new Error('Invalid response from server');
      
    } catch (error) {
      console.error('❌ Create doctor error:', error.response?.data || error.message);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data.message || 'Validation error',
          error: error.response.data,
          field: getErrorField(error.response.data.message)
        };
      }
      
      if (error.code === 'ERR_NETWORK') {
        return {
          success: false,
          message: 'Cannot connect to server. Please check if server is running.',
          error: error.message
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create doctor',
        error: error.response?.data || error.message,
        field: getErrorField(error.response?.data?.message)
      };
    }
  },

  // UPDATE doctor
  updateDoctor: async (id, doctorData) => {
    try {
      const response = await axiosInstance.put(`/doctors/${id}`, doctorData);
      return {
        success: true,
        data: response.data,
        message: 'Doctor updated successfully',
        doctor: response.data.doctor
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update doctor',
        error: error.response?.data || error.message,
        field: getErrorField(error.response?.data?.message)
      };
    }
  },

  // DELETE doctor
  deleteDoctor: async (id) => {
    try {
      const response = await axiosInstance.delete(`/doctors/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Doctor deleted successfully',
        doctorId: response.data.doctorId
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete doctor',
        error: error.response?.data || error.message
      };
    }
  },

  // UPLOAD doctor image
  uploadImage: async (imageFile, onUploadProgress) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await axiosInstance.post('/doctors/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        },
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data,
          message: 'Image uploaded successfully',
          imageUrl: response.data.imageUrl
        };
      }
      
      return {
        success: false,
        message: 'Failed to upload image',
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload image',
        error: error.response?.data || error.message
      };
    }
  },

  // SEARCH doctors
  searchDoctors: async (query) => {
    try {
      const response = await axiosInstance.get(`/doctors/search?q=${encodeURIComponent(query)}`);
      return {
        success: true,
        data: response.data,
        message: 'Search completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search doctors',
        error: error.response?.data || error.message
      };
    }
  },

  // CHECK email exists
  checkEmail: async (email, excludeId = null) => {
    try {
      const response = await axiosInstance.post('/doctors/check-email', { 
        email, 
        excludeId 
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          exists: response.data.exists,
          data: response.data,
          message: response.data.message
        };
      }
      
      return {
        success: true,
        exists: false,
        message: 'Email is available'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check email',
        error: error.response?.data || error.message
      };
    }
  },

  // GET doctors stats
  getStats: async () => {
    try {
      const response = await axiosInstance.get('/doctors/paginated?page=1&limit=1');
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: {
            total: response.data.total || 0,
            active: response.data.stats?.active || 0,
            avgRating: response.data.stats?.avgRating || 0,
            videoAvailable: response.data.stats?.videoAvailable || 0
          },
          message: 'Stats fetched successfully'
        };
      }
      
      // Fallback to getAllDoctors if paginated endpoint doesn't return stats
      const allDoctors = await doctorAPI.getAllDoctors();
      if (allDoctors.success && allDoctors.data) {
        const doctors = allDoctors.data.doctors || allDoctors.data || [];
        const activeCount = doctors.filter(d => d.status === 'active').length;
        const videoCount = doctors.filter(d => d.isVideoAvailable).length;
        const avgRating = doctors.reduce((sum, d) => sum + (d.rating || 0), 0) / (doctors.length || 1);
        
        return {
          success: true,
          data: {
            total: doctors.length,
            active: activeCount,
            avgRating: avgRating.toFixed(1),
            videoAvailable: videoCount
          },
          message: 'Stats fetched successfully'
        };
      }
      
      throw new Error('Failed to fetch stats');
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch stats',
        error: error.response?.data || error.message
      };
    }
  }
};

// ============================================
// AUTH API SERVICES
// ============================================

const authAPI = {
  // LOGIN
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      
      // Save token if returned
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Login successful',
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        error: error.response?.data || error.message
      };
    }
  },

  // REGISTER
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      
      // Save token if returned
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Registration successful',
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        error: error.response?.data || error.message,
        field: getErrorField(error.response?.data?.message)
      };
    }
  },

  // LOGOUT
  logout: async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const response = await axiosInstance.post('/auth/logout');
      return {
        success: true,
        data: response.data,
        message: 'Logout successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Logout failed',
        error: error.response?.data || error.message
      };
    }
  },

  // VERIFY TOKEN
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'No token found'
        };
      }
      
      const response = await axiosInstance.get('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data,
        message: 'Token verified',
        user: response.data.user
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Token verification failed',
        error: error.response?.data || error.message
      };
    }
  },

  // GET CURRENT USER
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // CHECK IF LOGGED IN
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  }
};

// ============================================
// PATIENT API SERVICES
// ============================================

const patientAPI = {
  // GET all patients
  getAllPatients: async () => {
    try {
      const response = await axiosInstance.get('/patients');
      return {
        success: true,
        data: response.data,
        message: 'Patients fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch patients',
        error: error.response?.data || error.message
      };
    }
  },

  // GET patient by ID
  getPatientById: async (id) => {
    try {
      const response = await axiosInstance.get(`/patients/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Patient fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch patient',
        error: error.response?.data || error.message
      };
    }
  },

  // CREATE patient
  createPatient: async (patientData) => {
    try {
      const response = await axiosInstance.post('/patients', patientData);
      return {
        success: true,
        data: response.data,
        message: 'Patient created successfully',
        patient: response.data.patient
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create patient',
        error: error.response?.data || error.message,
        field: getErrorField(error.response?.data?.message)
      };
    }
  },

  // UPDATE patient
  updatePatient: async (id, patientData) => {
    try {
      const response = await axiosInstance.put(`/patients/${id}`, patientData);
      return {
        success: true,
        data: response.data,
        message: 'Patient updated successfully',
        patient: response.data.patient
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update patient',
        error: error.response?.data || error.message,
        field: getErrorField(error.response?.data?.message)
      };
    }
  },

  // DELETE patient
  deletePatient: async (id) => {
    try {
      const response = await axiosInstance.delete(`/patients/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Patient deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete patient',
        error: error.response?.data || error.message
      };
    }
  }
};

// ============================================
// APPOINTMENT API SERVICES
// ============================================

const appointmentAPI = {
  // GET all appointments
  getAllAppointments: async () => {
    try {
      const response = await axiosInstance.get('/appointments');
      return {
        success: true,
        data: response.data,
        message: 'Appointments fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch appointments',
        error: error.response?.data || error.message
      };
    }
  },

  // GET appointment by ID
  getAppointmentById: async (id) => {
    try {
      const response = await axiosInstance.get(`/appointments/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Appointment fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch appointment',
        error: error.response?.data || error.message
      };
    }
  },

  // GET appointments by doctor
  getAppointmentsByDoctor: async (doctorId) => {
    try {
      const response = await axiosInstance.get(`/appointments/doctor/${doctorId}`);
      return {
        success: true,
        data: response.data,
        message: 'Appointments fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch appointments',
        error: error.response?.data || error.message
      };
    }
  },

  // GET appointments by patient
  getAppointmentsByPatient: async (patientId) => {
    try {
      const response = await axiosInstance.get(`/appointments/patient/${patientId}`);
      return {
        success: true,
        data: response.data,
        message: 'Appointments fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch appointments',
        error: error.response?.data || error.message
      };
    }
  },

  // CREATE appointment
  createAppointment: async (appointmentData) => {
    try {
      const response = await axiosInstance.post('/appointments', appointmentData);
      return {
        success: true,
        data: response.data,
        message: 'Appointment created successfully',
        appointment: response.data.appointment
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create appointment',
        error: error.response?.data || error.message
      };
    }
  },

  // UPDATE appointment
  updateAppointment: async (id, appointmentData) => {
    try {
      const response = await axiosInstance.put(`/appointments/${id}`, appointmentData);
      return {
        success: true,
        data: response.data,
        message: 'Appointment updated successfully',
        appointment: response.data.appointment
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update appointment',
        error: error.response?.data || error.message
      };
    }
  },

  // CANCEL appointment
  cancelAppointment: async (id) => {
    try {
      const response = await axiosInstance.patch(`/appointments/${id}/cancel`);
      return {
        success: true,
        data: response.data,
        message: 'Appointment cancelled successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel appointment',
        error: error.response?.data || error.message
      };
    }
  },

  // DELETE appointment
  deleteAppointment: async (id) => {
    try {
      const response = await axiosInstance.delete(`/appointments/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Appointment deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete appointment',
        error: error.response?.data || error.message
      };
    }
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get field name from error message
const getErrorField = (message) => {
  if (!message) return null;
  
  const lowercaseMsg = message.toLowerCase();
  
  if (lowercaseMsg.includes('email')) return 'email';
  if (lowercaseMsg.includes('license')) return 'license';
  if (lowercaseMsg.includes('phone')) return 'phone';
  if (lowercaseMsg.includes('name')) return 'name';
  if (lowercaseMsg.includes('specialization')) return 'specialization';
  if (lowercaseMsg.includes('hospital')) return 'hospital';
  if (lowercaseMsg.includes('location')) return 'location';
  if (lowercaseMsg.includes('fees')) return 'fees';
  if (lowercaseMsg.includes('password')) return 'password';
  if (lowercaseMsg.includes('qualifications')) return 'qualifications';
  if (lowercaseMsg.includes('experience')) return 'experience';
  
  return null;
};

// Format doctor data for API
export const formatDoctorData = (doctorData) => {
  console.log('📦 Formatting doctor data:', doctorData);
  
  // Ensure all required fields are present and properly formatted
  const formatted = {
    name: doctorData.name?.trim() || '',
    email: doctorData.email?.toLowerCase().trim() || '',
    password: doctorData.password || 'doctor123',
    phone: doctorData.phone?.trim() || '',
    specialization: doctorData.specialization || '',
    qualifications: doctorData.qualifications?.trim() || '',
    experience: doctorData.experience?.trim() || '',
    license: doctorData.license?.trim() || '',
    hospital: doctorData.hospital?.trim() || '',
    location: doctorData.location || 'Colombo',
    fees: doctorData.fees?.trim() || '',
    consultationTime: doctorData.consultationTime || '30 mins',
    availability: doctorData.availability || 'Mon-Fri: 9AM-6PM',
    languages: Array.isArray(doctorData.languages) ? doctorData.languages : ['English', 'Sinhala'],
    isVideoAvailable: doctorData.isVideoAvailable !== undefined ? doctorData.isVideoAvailable : true,
    isVerified: doctorData.isVerified !== undefined ? doctorData.isVerified : true,
    rating: parseFloat(doctorData.rating) || 4.5,
    reviewCount: parseInt(doctorData.reviewCount) || 0,
    status: doctorData.status || 'active',
    image: doctorData.image || '',
    aiSummary: doctorData.aiSummary || '',
    nextAvailable: doctorData.nextAvailable || 'Today',
    distance: doctorData.distance || '2.5 km',
    avatarColor: doctorData.avatarColor || 'from-teal-500 to-teal-600'
  };
  
  // Remove undefined fields
  Object.keys(formatted).forEach(key => {
    if (formatted[key] === undefined || formatted[key] === null) {
      delete formatted[key];
    }
  });
  
  console.log('📦 Formatted data ready for API:', formatted);
  
  return formatted;
};

// Format patient data for API
export const formatPatientData = (patientData) => {
  return {
    name: patientData.name?.trim(),
    email: patientData.email?.toLowerCase().trim(),
    phone: patientData.phone?.trim(),
    age: parseInt(patientData.age) || 0,
    gender: patientData.gender,
    bloodGroup: patientData.bloodGroup,
    address: patientData.address?.trim(),
    emergencyContact: patientData.emergencyContact?.trim(),
    medicalHistory: patientData.medicalHistory || '',
    allergies: patientData.allergies || [],
    status: patientData.status || 'active'
  };
};

// Format appointment data for API
export const formatAppointmentData = (appointmentData) => {
  return {
    doctorId: appointmentData.doctorId,
    patientId: appointmentData.patientId,
    date: appointmentData.date,
    time: appointmentData.time,
    type: appointmentData.type || 'in-person',
    status: appointmentData.status || 'scheduled',
    notes: appointmentData.notes || '',
    fee: appointmentData.fee || 0
  };
};

// Validate doctor form
export const validateDoctorForm = (data) => {
  const errors = {};
  
  // Required fields validation
  if (!data.name?.trim()) errors.name = 'Name is required';
  if (!data.email?.trim()) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Email is invalid';
  
  if (!data.phone?.trim()) errors.phone = 'Phone number is required';
  if (!data.specialization) errors.specialization = 'Specialization is required';
  if (!data.qualifications?.trim()) errors.qualifications = 'Qualifications are required';
  if (!data.experience?.trim()) errors.experience = 'Experience is required';
  if (!data.license?.trim()) errors.license = 'License number is required';
  if (!data.hospital?.trim()) errors.hospital = 'Hospital name is required';
  if (!data.location) errors.location = 'Location is required';
  if (!data.fees?.trim()) errors.fees = 'Consultation fee is required';
  
  // Validate fees format
  if (data.fees?.trim() && !/^[0-9,]+$/.test(data.fees.replace('LKR', '').trim())) {
    errors.fees = 'Please enter a valid fee amount';
  }
  
  // Validate phone number
  if (data.phone?.trim() && !/^[0-9+\-\s]+$/.test(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate patient form
export const validatePatientForm = (data) => {
  const errors = {};
  
  if (!data.name?.trim()) errors.name = 'Name is required';
  if (!data.email?.trim()) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Email is invalid';
  
  if (!data.phone?.trim()) errors.phone = 'Phone number is required';
  if (!data.age) errors.age = 'Age is required';
  if (!data.gender) errors.gender = 'Gender is required';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate appointment form
export const validateAppointmentForm = (data) => {
  const errors = {};
  
  if (!data.doctorId) errors.doctorId = 'Doctor is required';
  if (!data.patientId) errors.patientId = 'Patient is required';
  if (!data.date) errors.date = 'Date is required';
  if (!data.time) errors.time = 'Time is required';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ============================================
// EXPORT ALL APIS
// ============================================

export {
  doctorAPI,
  authAPI,
  patientAPI,
  appointmentAPI,
  axiosInstance as default
};