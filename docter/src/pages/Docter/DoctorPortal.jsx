import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DoctorSidebar from './DoctorSidebar';

import DoctorDashboardTab from './tabs/DoctorDashboardTab';
import DoctorScheduleTab from './tabs/DoctorScheduleTab';
import DoctorAppointmentsTab from './tabs/DoctorAppointmentsTab';
import DoctorPatientsTab from './tabs/DoctorPatientsTab';
import DoctorRecordsTab from './tabs/DoctorRecordsTab';
import DoctorAnalyticsTab from './tabs/DoctorAnalyticsTab';
import DoctorSettingsTab from './tabs/DoctorSettingsTab';
import AddSlotModal from './models/AddSlotModal';
import DoctorAvailability from './DoctorAvailability';

const DoctorPortal = ({ userType, userData }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState({
    status: 'available',
    workingDays: [
      { day: 'Monday', active: true, start: '09:00', end: '17:00' },
      { day: 'Tuesday', active: true, start: '09:00', end: '17:00' },
      { day: 'Wednesday', active: true, start: '09:00', end: '17:00' },
      { day: 'Thursday', active: true, start: '09:00', end: '17:00' },
      { day: 'Friday', active: true, start: '09:00', end: '17:00' },
      { day: 'Saturday', active: false, start: '10:00', end: '14:00' },
      { day: 'Sunday', active: false, start: '10:00', end: '14:00' }
    ],
    breakTime: {
      enabled: true,
      start: '13:00',
      end: '14:00'
    },
    consultationTypes: [
      { type: 'video', enabled: true, duration: 30, price: 120 },
      { type: 'clinic', enabled: true, duration: 30, price: 140 }
    ],
    slotDuration: 30,
    bufferTime: 15,
    maxDailyAppointments: 12,
    autoConfirm: true,
    advanceBookingDays: 30,
    unavailableDates: ['2024-12-25', '2024-12-31']
  });
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [newSlotData, setNewSlotData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    type: 'Video Consultation',
    duration: '30'
  });
  
  const location = useLocation();

  // URL hash handling
  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.substring(1);
      const validTabs = ['dashboard', 'schedule', 'appointments', 'patients', 
                        'availability', 'records', 'analytics', 'settings'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    }
  }, [location.hash]);

  // Initial appointments data
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    setAppointments([
      {
        id: 1,
        patientName: 'John Smith',
        patientId: 'PAT001',
        date: today,
        time: '09:00 AM',
        duration: '30 mins',
        type: 'New Patient',
        consultationType: 'Video Consultation',
        symptoms: 'Fever, cough, sore throat',
        status: 'confirmed',
        notes: 'High fever for 2 days',
        contact: '+1 (555) 123-4567',
        email: 'john.smith@email.com',
        meetingLink: 'https://meet.healthai.com/johnsmith',
        priority: 'high'
      },
      {
        id: 2,
        patientName: 'Emma Wilson',
        patientId: 'PAT002',
        date: today,
        time: '10:30 AM',
        duration: '30 mins',
        type: 'Follow-up',
        consultationType: 'Clinic Visit',
        symptoms: 'Blood pressure check',
        status: 'pending',
        notes: 'Monthly checkup',
        contact: '+1 (555) 234-5678',
        email: 'emma.wilson@email.com',
        priority: 'medium'
      },
      {
        id: 3,
        patientName: 'Michael Chen',
        patientId: 'PAT003',
        date: today,
        time: '02:00 PM',
        duration: '45 mins',
        type: 'Consultation',
        consultationType: 'Video Consultation',
        symptoms: 'Skin rash, itching',
        status: 'confirmed',
        notes: 'Allergy suspected',
        contact: '+1 (555) 345-6789',
        email: 'michael.chen@email.com',
        meetingLink: 'https://meet.healthai.com/michaelchen',
        priority: 'medium'
      },
      {
        id: 4,
        patientName: 'Sarah Johnson',
        patientId: 'PAT004',
        date: today,
        time: '04:15 PM',
        duration: '30 mins',
        type: 'Follow-up',
        consultationType: 'Video Consultation',
        symptoms: 'Anxiety follow-up',
        status: 'pending',
        notes: 'Medication review',
        contact: '+1 (555) 456-7890',
        email: 'sarah.johnson@email.com',
        priority: 'low'
      }
    ]);

    // Set default date for new slot
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNewSlotData(prev => ({
      ...prev,
      date: tomorrow.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '09:30'
    }));
  }, []);

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.history.pushState(null, '', `/doctor-portal#${tabId}`);
  };

  // Handle appointment actions
  const handleAppointmentAction = (appointmentId, action) => {
    const updatedAppointments = appointments.map(app => {
      if (app.id === appointmentId) {
        switch (action) {
          case 'confirm':
            return { ...app, status: 'confirmed' };
          case 'cancel':
            return { ...app, status: 'cancelled' };
          case 'complete':
            return { ...app, status: 'completed' };
          default:
            return app;
        }
      }
      return app;
    });
    
    setAppointments(updatedAppointments);
    
    // ✅ localStorage update
    const confirmedAppointments = updatedAppointments.filter(app => 
      app.status === 'confirmed' || app.status === 'pending'
    );
    
    const patientAppointments = confirmedAppointments.map(app => ({
      id: `APT-${app.id}`,
      doctorName: userData?.name || 'Dr. Sarah Johnson',
      doctorSpecialty: 'General Physician',
      date: app.date,
      time: app.time,
      type: app.consultationType,
      status: app.status === 'confirmed' ? 'confirmed' : 'pending',
      symptoms: app.symptoms,
      location: 'Main Clinic',
      image: 'https://randomuser.me/api/portraits/women/32.jpg',
      meetingLink: app.meetingLink || '',
      notes: app.notes || ''
    }));
    
    localStorage.setItem('appointments', JSON.stringify(patientAppointments));
    
    alert(`Appointment ${action}ed successfully! Patient will see it in their appointments.`);
  };

  // Handle new slot data changes
  const handleSlotDataChange = (field, value) => {
    setNewSlotData(prev => ({ ...prev, [field]: value }));
  };

  // Save new time slot
  const handleSaveSlot = () => {
    if (!newSlotData.date || !newSlotData.startTime || !newSlotData.endTime) {
      alert('Please fill all required fields');
      return;
    }
    
    alert(`Time slot added: ${newSlotData.date} from ${newSlotData.startTime} to ${newSlotData.endTime} (${newSlotData.type})`);
    setShowAddSlotModal(false);
    
    // Reset form
    setNewSlotData({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '09:30',
      type: 'Video Consultation',
      duration: '30'
    });
  };

  // Render active tab component
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DoctorDashboardTab 
            appointments={appointments}
            onAppointmentAction={handleAppointmentAction}
            onAddSlot={() => setShowAddSlotModal(true)}
            userData={userData}
          />
        );
      case 'schedule':
        return (
          <DoctorScheduleTab 
            newSlotData={newSlotData}
            onSlotDataChange={handleSlotDataChange}
            onSaveSlot={handleSaveSlot}
          />
        );
      case 'appointments':
        return (
          <DoctorAppointmentsTab 
            appointments={appointments}
            onAppointmentAction={handleAppointmentAction}
          />
        );
      case 'patients':
        return <DoctorPatientsTab />;
      case 'availability':
        return (
          <DoctorAvailability 
            userType={userType} 
            userData={userData} 
            availability={availability}
            setAvailability={setAvailability}
          />
        );
      case 'records':
        return <DoctorRecordsTab />;
      case 'analytics':
        return <DoctorAnalyticsTab />;
      case 'settings':
        return <DoctorSettingsTab userData={userData} />;
      default:
        return (
          <DoctorDashboardTab 
            appointments={appointments}
            onAppointmentAction={handleAppointmentAction}
            onAddSlot={() => setShowAddSlotModal(true)}
            userData={userData}
          />
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
     
      
      <div className="grid lg:grid-cols-4 gap-8">
        <DoctorSidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          onAddSlot={() => setShowAddSlotModal(true)}
          onAddPrescription={() => alert('Add prescription feature')}
          onGenerateReport={() => alert('Generate report feature')}
          availability={availability}
        />
        
        <div className="lg:col-span-3 space-y-8">
          {renderActiveTab()}
        </div>
      </div>

      {showAddSlotModal && (
        <AddSlotModal 
          newSlotData={newSlotData}
          onClose={() => setShowAddSlotModal(false)}
          onSlotDataChange={handleSlotDataChange}
          onSaveSlot={handleSaveSlot}
        />
      )}
    </div>
  );
};

export default DoctorPortal;