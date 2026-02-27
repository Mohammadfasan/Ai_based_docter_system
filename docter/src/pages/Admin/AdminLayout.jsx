// src/pages/Admin/AdminLayout.jsx
import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children, userType, userData, darkMode }) => {
  // Check if user is authenticated and is admin
  if (!userType || userType !== 'admin') {
    return null; // or redirect
  }

  return (
    <AdminSidebar>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {children}
      </div>
    </AdminSidebar>
  );
};

export default AdminLayout;