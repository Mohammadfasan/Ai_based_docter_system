import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaStar, FaUserMd, FaHospital, FaSpinner, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FeedbackDoctorSelector = ({ onDoctorSelect, onClose }) => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  const specializations = [
    'all', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'General Physician',
    'Neurologist', 'Orthopedic', 'Dentist', 'ENT Specialist',
    'Ophthalmologist', 'Psychiatrist', 'Gynecologist', 'Oncologist'
  ];

  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      
      if (!token) {
        setError('Please login to view doctors');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/doctors`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Doctors response:', response.data);
      
      if (response.data.success) {
        const doctorsList = response.data.doctors || response.data.data || response.data;
        const doctorsArray = Array.isArray(doctorsList) ? doctorsList : [];
        setDoctors(doctorsArray);
        setFilteredDoctors(doctorsArray);
        
        if (doctorsArray.length === 0) {
          setError('No doctors found in the system.');
        }
      } else {
        setError(response.data.message || 'Failed to load doctors');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      
      if (err.response?.status === 401) {
        setError('Please login to view doctors');
      } else if (err.response?.status === 404) {
        setError('Unable to load doctors. Please check if the server is running.');
      } else {
        setError(err.response?.data?.message || 'Failed to load doctors. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...doctors];
    
    if (searchTerm) {
      filtered = filtered.filter(doctor => 
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.hospital?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialization === selectedSpecialization);
    }
    
    setFilteredDoctors(filtered);
  }, [searchTerm, selectedSpecialization, doctors]);

  const handleDoctorSelect = (doctor) => {
    onDoctorSelect({
      id: doctor._id,
      doctorId: doctor.doctorId,
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      rating: doctor.rating,
      experience: doctor.experience
    });
  };

  // ✅ Close the selector and go back to feedback form
  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <FaSpinner className="text-4xl text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Select a Doctor</h2>
            <button 
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
              aria-label="Close"
            >
              <FaTimes size={20} />
            </button>
          </div>
          <p className="text-teal-100">Choose the doctor you want to provide feedback for</p>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by doctor name, specialization, or hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white"
            >
              {specializations.map(spec => (
                <option key={spec} value={spec}>
                  {spec === 'all' ? 'All Specializations' : spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctors List */}
        <div className="overflow-y-auto max-h-[500px] p-6">
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <p>{error}</p>
              </div>
              <button 
                onClick={fetchDoctors}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {doctors.length === 0 ? 'No doctors available at the moment.' : 'No doctors found matching your criteria'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doctor) => (
                <motion.div
                  key={doctor._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border border-gray-200 rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-all hover:border-teal-300"
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {doctor.name?.charAt(0) || 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg truncate">{doctor.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <FaUserMd className="text-teal-600 text-sm flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate">{doctor.specialization || 'General Physician'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <FaHospital className="text-blue-600 text-sm flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate">{doctor.hospital || 'Multi-speciality Hospital'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <div className="flex items-center">
                          <FaStar className="text-yellow-400 mr-1" />
                          <span className="font-bold text-sm">{doctor.rating || '4.5'}</span>
                        </div>
                        <span className="text-xs text-gray-500">({doctor.reviewCount || 0} reviews)</span>
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          {doctor.experience || '5+ Years'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Select a doctor to share your feedback about your consultation experience
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default FeedbackDoctorSelector;