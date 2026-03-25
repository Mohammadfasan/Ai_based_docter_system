// DoctorsPage.jsx
import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../../services/api';
import Doctors from './Doctors';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const result = await doctorAPI.getAllDoctors();
      
      if (result.success) {
        // Handle different response structures
        const doctorsData = result.data.doctors || result.data || [];
        setDoctors(doctorsData);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl text-teal-600 mx-auto mb-4">↻</div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDoctors}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <Doctors doctorsData={doctors} />;
};

export default DoctorsPage;