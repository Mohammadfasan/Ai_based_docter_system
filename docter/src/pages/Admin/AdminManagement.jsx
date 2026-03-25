import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { 
  FaUserMd, FaSearch, FaEdit, FaTrash, FaEye
} from 'react-icons/fa';
import { doctorAPI } from '../../services/api';
import AddDoctorModal from './AddDoctorModal';
import EditDoctorModal from './EditDoctorModal.jsx';

const AdminManagement = () => {
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const itemsPerPage = 10;

  // Specializations List
  const specializations = [
    'Cardiologist', 'Dermatologist', 'Pediatrician', 'General Physician',
    'Neurologist', 'Orthopedic', 'Dentist', 'ENT Specialist',
    'Ophthalmologist', 'Psychiatrist', 'Gynecologist', 'Oncologist'
  ];

  // Languages List
  const languageOptions = ['English', 'Sinhala', 'Tamil', 'Arabic', 'Hindi'];

  // Locations List
  const locations = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo',
    'Batticaloa', 'Kurunegala', 'Ratnapura', 'Badulla', 'Matara'
  ];

  // Doctors Data
  const [doctors, setDoctors] = useState([]);

  // Action States
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // ✅ Show notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  }, []);

  // ✅ Load doctors
  const loadDoctors = useCallback(async (page, search) => {
    try {
      setLoading(true);
      
      const result = await doctorAPI.getPaginatedDoctors(page, itemsPerPage, search);
      
      if (result.success) {
        setDoctors(result.data.doctors || []);
        setTotalPages(result.data.totalPages || 1);
        setTotalDoctors(result.data.total || 0);
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      showNotification('Failed to load doctors', 'error');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [itemsPerPage, showNotification]);

  // ✅ Refresh data
  const handleRefresh = useCallback(() => {
    loadDoctors(currentPage, searchTerm);
  }, [currentPage, searchTerm, loadDoctors]);

  // ✅ Handle page change
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [totalPages]);

  // ✅ Handle delete doctor
  const handleDeleteDoctor = useCallback(async (id, doctorName) => {
    if (!window.confirm(`Are you sure you want to delete Dr. ${doctorName}?`)) return;

    setDeleteLoading(id);

    try {
      const result = await doctorAPI.deleteDoctor(id);

      if (result.success) {
        showNotification(`✅ Dr. ${doctorName} deleted successfully!`, 'success');
        
        // If current page becomes empty, go to previous page
        if (doctors.length === 1 && currentPage > 1) {
          setCurrentPage(prevPage => prevPage - 1);
        } else {
          loadDoctors(currentPage, searchTerm);
        }
      } else {
        showNotification(`❌ ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      showNotification('❌ Failed to delete doctor', 'error');
    } finally {
      setDeleteLoading(null);
    }
  }, [doctors.length, currentPage, searchTerm, loadDoctors, showNotification]);

  // ✅ Handle edit doctor
  const handleEditDoctor = useCallback((doctor) => {
    setSelectedDoctor(doctor);
    setShowEditModal(true);
  }, []);

  // ✅ Handle view doctor
  const handleViewDoctor = useCallback((doctor) => {
    window.open(`/doctors/${doctor._id || doctor.id}`, '_blank');
  }, []);

  // ✅ Handle modal success
  const handleModalSuccess = useCallback(() => {
    setCurrentPage(1);
    setTimeout(() => {
      loadDoctors(1, searchTerm);
    }, 500);
  }, [searchTerm, loadDoctors]);

  // ✅ Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchDebounce);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchDebounce]);

  // ✅ Load on mount
  useEffect(() => {
    loadDoctors(1, '');
  }, [loadDoctors]);

  // ✅ Load when dependencies change
  useEffect(() => {
    if (!initialLoad) {
      loadDoctors(currentPage, searchTerm);
    }
  }, [currentPage, searchTerm, loadDoctors, initialLoad]);

  // ✅ Get status color
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      busy: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.inactive;
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // ✅ Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-6">
        <div className="h-10 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Initial loading state
  if (initialLoad) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 
          notification.type === 'error' ? 'bg-red-500' : 
          'bg-blue-500'
        } text-white animate-slide-in`}>
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600">
            Complete Doctor Management System
            <span className="ml-2 text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
              {totalDoctors} doctors
            </span>
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
          title="Refresh"
        >
          <span>↻</span>
        </button>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6">
          {/* Header with Search and Add Button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">👨‍⚕️ Doctors Management</h2>
              <p className="text-sm text-gray-500 mt-1">
                Page {currentPage} of {totalPages} | Showing {doctors.length} doctors
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 md:min-w-[300px]">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchDebounce}
                  onChange={(e) => setSearchDebounce(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Add Doctor Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
              >
                + Add Doctor
              </button>
            </div>
          </div>

          {/* Table Content */}
          {loading && !initialLoad ? (
            <div className="text-center py-12">
              <div className="animate-spin text-4xl text-teal-600 mx-auto mb-4">↻</div>
              <p className="text-gray-600">Loading doctors...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Doctor</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Specialization</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Experience</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Rating</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Fees</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Hospital</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Created</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.length > 0 ? (
                      doctors.map(doctor => (
                        <tr key={doctor._id || doctor.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div className="flex items-center space-x-3">
                              <img 
                                loading="lazy"
                                src={doctor.image || `https://ui-avatars.com/api/?name=${doctor.name?.charAt(0)}&background=0D9488&color=fff`}
                                alt={doctor.name} 
                                className="w-10 h-10 rounded-full object-cover border-2 border-teal-100"
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${doctor.name?.charAt(0)}&background=0D9488&color=fff`;
                                }}
                              />
                              <div>
                                <div className="font-medium text-gray-900">{doctor.name}</div>
                                <div className="text-xs text-gray-500">{doctor.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="text-gray-900 font-medium">{doctor.specialization}</div>
                            <div className="text-xs text-gray-500">{doctor.qualifications}</div>
                          </td>
                          <td className="py-3 px-2 text-gray-900">{doctor.experience}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center">
                              <span className="font-medium">{doctor.rating}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 font-medium text-teal-700">{doctor.fees}</td>
                          <td className="py-3 px-2">
                            <div>
                              {doctor.hospital}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doctor.status)}`}>
                              {doctor.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-xs text-gray-500">
                            {formatDate(doctor.createdAt)}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditDoctor(doctor)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Doctor"
                              >
                                <FaEdit size={14} />
                              </button>
                              <button
                                onClick={() => handleViewDoctor(doctor)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="View in Patient Portal"
                              >
                                <FaEye size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteDoctor(doctor._id || doctor.id, doctor.name)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors relative"
                                title="Delete Doctor"
                                disabled={deleteLoading === (doctor._id || doctor.id)}
                              >
                                {deleteLoading === (doctor._id || doctor.id) ? (
                                  <span className="animate-spin">↻</span>
                                ) : (
                                  <FaTrash size={14} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-12">
                          <FaUserMd className="text-5xl text-gray-300 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-gray-700">No Doctors Found</h3>
                          <p className="text-gray-500 mt-2">
                            {searchTerm ? 'Try a different search term' : 'Click "Add Doctor" to get started.'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalDoctors)} of {totalDoctors} doctors
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className={`px-3 py-1 border rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-teal-600 text-white border-teal-600'
                              : 'hover:bg-gray-50'
                          } disabled:opacity-50`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Doctor Modal */}
      <AddDoctorModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
        }}
        onSuccess={handleModalSuccess}
        showNotification={showNotification}
      />

      {/* Edit Doctor Modal */}
      <EditDoctorModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDoctor(null);
        }}
        onSuccess={handleModalSuccess}
        showNotification={showNotification}
        doctorData={selectedDoctor}
      />

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminManagement;