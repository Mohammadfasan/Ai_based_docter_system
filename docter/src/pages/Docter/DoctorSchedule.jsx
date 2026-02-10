import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FaCalendar, FaClock, FaUserMd, FaVideo, FaPhone, 
  FaMapMarkerAlt, FaCalendarPlus, FaTimes, FaEdit,
  FaTrash, FaCheck, FaBan, FaCalendarCheck, FaFilter,
  FaSort, FaCopy, FaDownload, FaSyncAlt, FaExclamationTriangle,
  FaCalendarDay, FaCalendarWeek, FaChevronLeft,
  FaChevronRight, FaExpand, FaCompress, FaBell, FaListUl,
  FaThLarge, FaArrowUp, FaArrowDown, FaRegClock, FaUserClock,
  FaPrint, FaShareAlt, FaLock, FaUnlock, FaArchive,
  FaEllipsisH, FaSearch, FaCheckSquare, FaSquare, FaCalendarAlt,
  FaUsers, FaUser, FaUserPlus, FaComment, FaFileMedical
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DoctorSchedule = ({ userType, userData }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  const [newSlot, setNewSlot] = useState({
    date: '',
    time: '',
    type: 'video',
    duration: 30,
    notes: ''
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [viewType, setViewType] = useState('list');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    timeRange: 'all'
  });
  const [sortBy, setSortBy] = useState('time');
  const [sortOrder, setSortOrder] = useState('asc');
  const [conflicts, setConflicts] = useState([]);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [recurringOptions, setRecurringOptions] = useState({
    frequency: 'weekly',
    daysOfWeek: [],
    occurrences: 4,
    endDate: ''
  });

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      // Load doctor's time slots
      const savedSlots = localStorage.getItem('doctor_time_slots');
      if (savedSlots) {
        setTimeSlots(JSON.parse(savedSlots));
      } else {
        // Default time slots
        const defaultSlots = [
          { id: 1, date: new Date().toISOString().split('T')[0], time: '09:00', type: 'video', duration: 30, status: 'available', patientName: null, patientId: null, notes: '' },
          { id: 2, date: new Date().toISOString().split('T')[0], time: '10:30', type: 'clinic', duration: 45, status: 'booked', patientName: 'John Smith', patientId: 'PAT101', notes: 'Follow-up visit' },
          { id: 3, date: new Date().toISOString().split('T')[0], time: '14:00', type: 'video', duration: 30, status: 'available', patientName: null, patientId: null, notes: '' },
        ];
        setTimeSlots(defaultSlots);
        localStorage.setItem('doctor_time_slots', JSON.stringify(defaultSlots));
      }

      // Load appointments
      const savedAppointments = localStorage.getItem('appointments');
      if (savedAppointments) {
        const allAppointments = JSON.parse(savedAppointments);
        // Filter only confirmed appointments for this doctor
        const doctorAppointments = allAppointments.filter(app => 
          app.status === 'confirmed' || app.status === 'pending'
        );
        setAppointments(doctorAppointments);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Save time slots when they change
  useEffect(() => {
    localStorage.setItem('doctor_time_slots', JSON.stringify(timeSlots));
  }, [timeSlots]);

  // Generate next 14 days
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const slotsCount = timeSlots.filter(slot => slot.date === dateString && slot.status !== 'unavailable').length;
      const bookedCount = timeSlots.filter(slot => slot.date === dateString && slot.status === 'booked').length;
      
      dates.push({
        date: dateString,
        display: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        slotsCount,
        bookedCount,
        hasConflict: conflicts.some(conflict => conflict.date === dateString)
      });
    }
    
    return dates;
  };

  // Detect slot conflicts
  const detectConflicts = useCallback((slots) => {
    const conflicts = [];
    const slotsByDate = {};
    
    // Group slots by date
    slots.forEach(slot => {
      if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
      slotsByDate[slot.date].push(slot);
    });
    
    // Check each date for conflicts
    Object.keys(slotsByDate).forEach(date => {
      const daySlots = slotsByDate[date]
        .filter(slot => slot.status !== 'unavailable')
        .sort((a, b) => a.time.localeCompare(b.time));
      
      for (let i = 1; i < daySlots.length; i++) {
        const prevSlot = daySlots[i-1];
        const currSlot = daySlots[i];
        
        const addMinutes = (time, minutes) => {
          const [hours, mins] = time.split(':').map(Number);
          const date = new Date();
          date.setHours(hours, mins + minutes, 0, 0);
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        };
        
        const prevEnd = addMinutes(prevSlot.time, prevSlot.duration);
        
        if (prevEnd > currSlot.time) {
          conflicts.push({
            date,
            slot1: prevSlot,
            slot2: currSlot,
            overlapMinutes: Math.abs(new Date(`2000-01-01T${prevEnd}`) - new Date(`2000-01-01T${currSlot.time}`)) / 60000
          });
        }
      }
    });
    
    return conflicts;
  }, []);

  // Update conflicts when slots change
  useEffect(() => {
    setConflicts(detectConflicts(timeSlots));
  }, [timeSlots, detectConflicts]);

  // Filter and sort slots for selected date
  const filteredSlots = useMemo(() => {
    let filtered = timeSlots.filter(slot => slot.date === selectedDate);
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(slot => slot.status === filters.status);
    }
    
    if (filters.type !== 'all') {
      filtered = filtered.filter(slot => slot.type === filters.type);
    }
    
    if (filters.timeRange !== 'all') {
      filtered = filtered.filter(slot => {
        const hour = parseInt(slot.time.split(':')[0]);
        if (filters.timeRange === 'morning') return hour < 12;
        if (filters.timeRange === 'afternoon') return hour >= 12 && hour < 17;
        if (filters.timeRange === 'evening') return hour >= 17;
        return true;
      });
    }
    
    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0;
      if (sortBy === 'time') compareValue = a.time.localeCompare(b.time);
      if (sortBy === 'duration') compareValue = a.duration - b.duration;
      if (sortBy === 'type') compareValue = a.type.localeCompare(b.type);
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
    
    return filtered;
  }, [timeSlots, selectedDate, filters, sortBy, sortOrder]);

  // Filter today's appointments
  const todaysAppointments = useMemo(() => {
    return appointments.filter(app => app.date === selectedDate && app.status === 'confirmed');
  }, [appointments, selectedDate]);

  // Validate time slot
  const validateTimeSlot = (slot) => {
    const slotTime = new Date(`${slot.date}T${slot.time}`);
    const slotEnd = new Date(slotTime.getTime() + slot.duration * 60000);
    const now = new Date();
    
    // Check if slot is in past
    if (slotTime < now) {
      return { isValid: false, message: 'Cannot add slots in the past' };
    }
    
    // Check for overlapping slots
    const existingSlots = timeSlots.filter(s => 
      s.date === slot.date && 
      s.status !== 'unavailable' &&
      s.id !== slot.id
    );
    
    for (const existingSlot of existingSlots) {
      const existingTime = new Date(`${existingSlot.date}T${existingSlot.time}`);
      const existingEnd = new Date(existingTime.getTime() + existingSlot.duration * 60000);
      
      if (
        (slotTime >= existingTime && slotTime < existingEnd) ||
        (slotEnd > existingTime && slotEnd <= existingEnd) ||
        (slotTime <= existingTime && slotEnd >= existingEnd)
      ) {
        return { 
          isValid: false, 
          message: `Overlaps with existing slot at ${existingSlot.time}` 
        };
      }
    }
    
    return { isValid: true, message: 'Slot is valid' };
  };

  // Add time slot
  const handleAddSlot = () => {
    const validation = validateTimeSlot(newSlot);
    if (!validation.isValid) {
      alert(`Error: ${validation.message}`);
      return;
    }
    
    const slot = {
      id: Date.now(),
      ...newSlot,
      status: 'available',
      patientName: null,
      patientId: null
    };
    
    setTimeSlots([...timeSlots, slot]);
    setNewSlot({ date: '', time: '', type: 'video', duration: 30, notes: '' });
    setShowAddModal(false);
  };

  // Add multiple recurring slots
  const handleAddRecurringSlots = () => {
    const daysMap = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
      'Friday': 5, 'Saturday': 6, 'Sunday': 0
    };
    
    const slots = [];
    let currentDate = new Date(newSlot.date);
    
    for (let i = 0; i < recurringOptions.occurrences; i++) {
      if (recurringOptions.frequency === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (recurringOptions.frequency === 'weekly') {
        // Find next day that matches selected days
        let daysToAdd = 1;
        while (true) {
          const nextDate = new Date(currentDate);
          nextDate.setDate(currentDate.getDate() + daysToAdd);
          const dayName = nextDate.toLocaleDateString('en-US', { weekday: 'long' });
          
          if (recurringOptions.daysOfWeek.includes(daysMap[dayName])) {
            currentDate = nextDate;
            break;
          }
          daysToAdd++;
        }
      }
      
      if (recurringOptions.endDate && new Date(currentDate) > new Date(recurringOptions.endDate)) {
        break;
      }
      
      const slot = {
        id: Date.now() + i,
        date: currentDate.toISOString().split('T')[0],
        time: newSlot.time,
        type: newSlot.type,
        duration: newSlot.duration,
        notes: newSlot.notes,
        status: 'available',
        patientName: null,
        patientId: null
      };
      
      const validation = validateTimeSlot(slot);
      if (validation.isValid) {
        slots.push(slot);
      }
    }
    
    setTimeSlots([...timeSlots, ...slots]);
    setShowRecurringModal(false);
    setRecurringOptions({
      frequency: 'weekly',
      daysOfWeek: [],
      occurrences: 4,
      endDate: ''
    });
  };

  // Delete slot
  const handleDeleteSlot = (id) => {
    const slot = timeSlots.find(s => s.id === id);
    if (slot?.status === 'booked') {
      if (!window.confirm('This slot is booked! Deleting will cancel the appointment. Continue?')) {
        return;
      }
      
      // Remove appointment from localStorage
      const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const updatedAppointments = savedAppointments.filter(app => 
        !(app.date === slot.date && app.time === slot.time && app.doctorName === userData?.name)
      );
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      setAppointments(updatedAppointments);
    }
    
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    setSelectedSlots(selectedSlots.filter(slotId => slotId !== id));
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedSlots.length === 0) return;
    
    const bookedSlots = timeSlots.filter(slot => 
      selectedSlots.includes(slot.id) && slot.status === 'booked'
    );
    
    if (bookedSlots.length > 0) {
      if (!window.confirm(`${bookedSlots.length} selected slots are booked! Deleting will cancel these appointments. Continue?`)) {
        return;
      }
      
      // Remove appointments from localStorage
      const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const updatedAppointments = savedAppointments.filter(app => 
        !bookedSlots.some(slot => 
          app.date === slot.date && app.time === slot.time && app.doctorName === userData?.name
        )
      );
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      setAppointments(updatedAppointments);
    }
    
    setTimeSlots(timeSlots.filter(slot => !selectedSlots.includes(slot.id)));
    setSelectedSlots([]);
  };

  // Toggle slot selection
  const handleToggleSlotSelection = (id) => {
    setSelectedSlots(prev => 
      prev.includes(id) 
        ? prev.filter(slotId => slotId !== id)
        : [...prev, id]
    );
  };

  // Toggle all slots selection
  const handleToggleAllSlots = () => {
    if (selectedSlots.length === filteredSlots.length) {
      setSelectedSlots([]);
    } else {
      setSelectedSlots(filteredSlots.map(slot => slot.id));
    }
  };

  // Toggle slot status
  const handleToggleStatus = (id) => {
    setTimeSlots(timeSlots.map(slot => {
      if (slot.id === id) {
        const newStatus = slot.status === 'available' ? 'unavailable' : 'available';
        
        // If making a booked slot unavailable
        if (slot.status === 'booked' && newStatus === 'unavailable') {
          if (!window.confirm('This slot is booked! Making it unavailable will cancel the appointment. Continue?')) {
            return slot;
          }
          
          // Remove appointment
          const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
          const updatedAppointments = savedAppointments.filter(app => 
            !(app.date === slot.date && app.time === slot.time && app.doctorName === userData?.name)
          );
          localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
          setAppointments(updatedAppointments);
        }
        
        return { 
          ...slot, 
          status: newStatus,
          patientName: newStatus !== 'booked' ? null : slot.patientName,
          patientId: newStatus !== 'booked' ? null : slot.patientId
        };
      }
      return slot;
    }));
  };

  // Bulk status change
  const handleBulkStatusChange = (status) => {
    const slotsToUpdate = timeSlots.filter(slot => selectedSlots.includes(slot.id));
    const bookedSlots = slotsToUpdate.filter(slot => slot.status === 'booked');
    
    if (bookedSlots.length > 0 && status !== 'booked') {
      if (!window.confirm(`${bookedSlots.length} selected slots are booked! Changing status will cancel these appointments. Continue?`)) {
        return;
      }
      
      // Remove appointments
      const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const updatedAppointments = savedAppointments.filter(app => 
        !bookedSlots.some(slot => 
          app.date === slot.date && app.time === slot.time && app.doctorName === userData?.name
        )
      );
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      setAppointments(updatedAppointments);
    }
    
    setTimeSlots(timeSlots.map(slot => 
      selectedSlots.includes(slot.id) ? { 
        ...slot, 
        status,
        patientName: status !== 'booked' ? null : slot.patientName,
        patientId: status !== 'booked' ? null : slot.patientId
      } : slot
    ));
    setSelectedSlots([]);
  };

  // Edit slot
  const handleEditSlot = (slot) => {
    setNewSlot({
      date: slot.date,
      time: slot.time,
      type: slot.type,
      duration: slot.duration,
      notes: slot.notes || ''
    });
    setShowAddModal(true);
    // Remove the old slot
    setTimeSlots(timeSlots.filter(s => s.id !== slot.id));
  };

  // Export schedule
  const handleExportSchedule = () => {
    const data = filteredSlots.map(slot => ({
      Date: slot.date,
      Time: slot.time,
      Duration: `${slot.duration} mins`,
      Type: slot.type === 'video' ? 'Video Consultation' : 'Clinic Visit',
      Status: slot.status.charAt(0).toUpperCase() + slot.status.slice(1),
      Patient: slot.patientName || 'N/A',
      PatientID: slot.patientId || 'N/A',
      Notes: slot.notes || ''
    }));
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${selectedDate}.csv`;
    a.click();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border border-green-200';
      case 'booked': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'unavailable': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    return type === 'video' 
      ? 'bg-purple-100 text-purple-800 border border-purple-200' 
      : 'bg-teal-100 text-teal-800 border border-teal-200';
  };

  // Get time range color
  const getTimeRangeColor = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'bg-yellow-50 border-yellow-100';
    if (hour < 17) return 'bg-orange-50 border-orange-100';
    return 'bg-indigo-50 border-indigo-100';
  };

  // Calculate stats
  const stats = useMemo(() => {
    const available = timeSlots.filter(s => s.status === 'available').length;
    const booked = timeSlots.filter(s => s.status === 'booked').length;
    const video = timeSlots.filter(s => s.type === 'video').length;
    const clinic = timeSlots.filter(s => s.type === 'clinic').length;
    const totalHours = timeSlots.reduce((sum, slot) => sum + slot.duration, 0) / 60;
    
    return { available, booked, video, clinic, totalHours };
  }, [timeSlots]);

  // Navigate dates
  const navigateDate = (direction) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + direction);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Day view time slots
  const dayHours = Array.from({ length: 12 }, (_, i) => i + 8);

  // Handle booking management
  const handleManageBooking = (slot) => {
    if (!slot.patientName) return;
    
    // In a real app, this would open a detailed view
    alert(`Patient: ${slot.patientName}\nAppointment: ${slot.time}\nNotes: ${slot.notes || 'None'}`);
  };

  // Generate meeting link
  const generateMeetingLink = () => {
    return `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}`;
  };

  // Approve appointment from slot
  const handleApproveAppointment = (slot) => {
    if (!window.confirm(`Approve appointment with ${slot.patientName} at ${slot.time}?`)) return;
    
    // Generate meeting link for video consultations
    const meetingLink = slot.type === 'video' ? generateMeetingLink() : '';
    
    // Update appointment in localStorage
    const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = savedAppointments.map(app => {
      if (app.date === slot.date && app.time === slot.time && app.doctorName === userData?.name) {
        return {
          ...app,
          status: 'confirmed',
          meetingLink,
          notes: 'Appointment confirmed by doctor'
        };
      }
      return app;
    });
    
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments);
    
    // Update slot status
    setTimeSlots(timeSlots.map(s => 
      s.id === slot.id ? { ...s, status: 'booked' } : s
    ));
    
    alert('Appointment approved!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
            <p className="text-gray-600">Manage your availability and appointments</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <FaCalendarPlus />
              <span>Add Slot</span>
            </button>
            <button
              onClick={() => setShowRecurringModal(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50"
            >
              <FaSyncAlt />
              <span>Recurring</span>
            </button>
            <button
              onClick={handleExportSchedule}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <FaDownload />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-600">Available Slots</div>
          <div className="text-2xl font-bold text-gray-900">{stats.available}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-600">Booked Appointments</div>
          <div className="text-2xl font-bold text-blue-600">{stats.booked}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-600">Total Appointments</div>
          <div className="text-2xl font-bold text-purple-600">{appointments.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-600">Today's Appointments</div>
          <div className="text-2xl font-bold text-teal-600">{todaysAppointments.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-600">Total Hours</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}</div>
        </div>
      </div>

      {/* Conflict Alert */}
      {conflicts.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <FaExclamationTriangle className="text-red-600" />
            <div>
              <div className="font-bold text-red-800">Schedule Conflicts Detected</div>
              <div className="text-sm text-red-700">
                {conflicts.length} overlapping time slot{conflicts.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Calendar & Controls */}
        <div className="lg:col-span-2">
          {/* Date Navigation */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center space-x-4">
                <h3 className="text-xl font-bold text-gray-900">Select Date</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateDate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <FaChevronLeft />
                  </button>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                  <button
                    onClick={() => navigateDate(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewType('list')}
                  className={`p-2 rounded-lg ${viewType === 'list' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <FaListUl />
                </button>
                <button
                  onClick={() => setViewType('day')}
                  className={`p-2 rounded-lg ${viewType === 'day' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <FaCalendarDay />
                </button>
                <button
                  onClick={() => setViewType('week')}
                  className={`p-2 rounded-lg ${viewType === 'week' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <FaCalendarWeek />
                </button>
              </div>
            </div>
            
            {/* Date Picker */}
            <div className="mb-6">
              <DatePicker
                selected={new Date(selectedDate)}
                onChange={(date) => setSelectedDate(date.toISOString().split('T')[0])}
                inline
                minDate={new Date()}
                maxDate={new Date(new Date().setDate(new Date().getDate() + 30))}
                className="w-full border-none"
              />
            </div>
            
            {/* Quick Date Selection */}
            <div className="flex overflow-x-auto pb-4 space-x-3">
              {getAvailableDates().map((dateInfo) => (
                <button
                  key={dateInfo.date}
                  onClick={() => setSelectedDate(dateInfo.date)}
                  className={`flex-shrink-0 p-3 rounded-xl border-2 flex flex-col items-center min-w-28 transition-all ${
                    selectedDate === dateInfo.date
                      ? 'border-teal-500 bg-teal-50'
                      : dateInfo.hasConflict
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`text-lg font-bold ${selectedDate === dateInfo.date ? 'text-teal-900' : 'text-gray-900'}`}>
                    {new Date(dateInfo.date).getDate()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {dateInfo.display.split(' ')[0]}
                  </div>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      dateInfo.bookedCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {dateInfo.bookedCount} booked
                    </span>
                    {dateInfo.hasConflict && (
                      <FaExclamationTriangle className="text-red-500 text-xs" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters & Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {filteredSlots.length > 0 && (
                    <button
                      onClick={handleToggleAllSlots}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      {selectedSlots.length === filteredSlots.length ? 
                        <FaCheckSquare className="text-teal-600" /> : 
                        <FaSquare className="text-gray-400" />}
                    </button>
                  )}
                  <span className="text-sm text-gray-600">
                    {selectedSlots.length > 0 ? `${selectedSlots.length} selected` : 'Select slots'}
                  </span>
                </div>
                
                {selectedSlots.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkStatusChange('available')}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-lg hover:bg-green-200"
                    >
                      Make Available
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('unavailable')}
                      className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-lg hover:bg-red-200"
                    >
                      Make Unavailable
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                    >
                      Delete Selected
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Filters */}
                <div className="flex items-center space-x-2">
                  <FaFilter className="text-gray-500" />
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                  
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="video">Video</option>
                    <option value="clinic">Clinic</option>
                  </select>
                  
                  <select
                    value={filters.timeRange}
                    onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Day</option>
                    <option value="morning">Morning (8AM-12PM)</option>
                    <option value="afternoon">Afternoon (12PM-5PM)</option>
                    <option value="evening">Evening (5PM-8PM)</option>
                  </select>
                </div>
                
                {/* Sort */}
                <div className="flex items-center space-x-2">
                  <FaSort className="text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="time">Sort by Time</option>
                    <option value="duration">Sort by Duration</option>
                    <option value="type">Sort by Type</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    {sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Time Slots List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {viewType === 'list' ? 'Time Slots' : 'Day View'}
              </h3>
              <span className="text-gray-600">{filteredSlots.length} slots</span>
            </div>
            
            {filteredSlots.length === 0 ? (
              <div className="text-center py-12">
                <FaClock className="text-4xl text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">No time slots</h4>
                <p className="text-gray-600 mb-4">Add time slots for this date</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Add Time Slot
                </button>
              </div>
            ) : viewType === 'list' ? (
              <div className="space-y-3">
                {filteredSlots.map((slot) => {
                  const isSelected = selectedSlots.includes(slot.id);
                  const isConflict = conflicts.some(c => 
                    c.slot1.id === slot.id || c.slot2.id === slot.id
                  );
                  
                  return (
                    <div 
                      key={slot.id} 
                      className={`flex items-center justify-between p-4 border rounded-xl transition-all ${
                        isSelected ? 'ring-2 ring-teal-500 ring-offset-2' : ''
                      } ${isConflict ? 'border-red-300 bg-red-50' : getTimeRangeColor(slot.time)}`}
                    >
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleToggleSlotSelection(slot.id)}
                          className="flex-shrink-0"
                        >
                          {isSelected ? 
                            <FaCheckSquare className="text-teal-600" /> : 
                            <FaSquare className="text-gray-400" />}
                        </button>
                        
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">{slot.time}</div>
                          <div className="text-sm text-gray-600">{slot.duration} min</div>
                        </div>
                        
                        <div className="flex flex-col">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${getTypeColor(slot.type)}`}>
                            {slot.type === 'video' ? 'Video Consultation' : 'Clinic Visit'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(slot.status)}`}>
                            {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                            {slot.patientName && ` • ${slot.patientName}`}
                          </span>
                          {slot.notes && (
                            <div className="text-xs text-gray-600 mt-1">{slot.notes}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isConflict && (
                          <div className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                            Conflict
                          </div>
                        )}
                        
                        {slot.status === 'booked' && (
                          <>
                            <button
                              onClick={() => handleManageBooking(slot)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="View Booking"
                            >
                              <FaUser />
                            </button>
                            <button
                              onClick={() => handleApproveAppointment(slot)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Approve Appointment"
                            >
                              <FaCheck />
                            </button>
                          </>
                        )}
                        
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditSlot(slot)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(slot.id)}
                            className={`p-2 rounded-lg ${
                              slot.status === 'available' 
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={slot.status === 'available' ? 'Make Unavailable' : 'Make Available'}
                          >
                            {slot.status === 'available' ? <FaBan /> : <FaCheck />}
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {dayHours.map(hour => {
                  const hourSlots = filteredSlots.filter(slot => {
                    const slotHour = parseInt(slot.time.split(':')[0]);
                    return slotHour === hour;
                  });
                  
                  const timeLabel = `${hour}:00`;
                  
                  return (
                    <div key={hour} className="flex items-start">
                      <div className="w-20 text-right pr-4 pt-3">
                        <div className="font-medium text-gray-900">{timeLabel}</div>
                      </div>
                      <div className="flex-1 border-t border-gray-200 pt-3">
                        <div className="grid grid-cols-4 gap-2">
                          {Array.from({ length: 4 }, (_, i) => {
                            const quarter = i * 15;
                            const time = `${hour.toString().padStart(2, '0')}:${quarter.toString().padStart(2, '0')}`;
                            const slot = filteredSlots.find(s => s.time === time);
                            
                            return (
                              <div 
                                key={i} 
                                className="h-12 border border-gray-200 rounded-lg p-2 relative hover:bg-gray-50"
                              >
                                {slot ? (
                                  <div className={`absolute inset-0 rounded-lg p-2 ${getStatusColor(slot.status)}`}>
                                    <div className="text-xs font-medium truncate">
                                      {slot.type === 'video' ? 'V' : 'C'}
                                    </div>
                                    <div className="text-xs truncate">
                                      {slot.duration}m
                                    </div>
                                    {slot.patientName && (
                                      <div className="text-xs truncate text-gray-600">
                                        {slot.patientName.split(' ')[0]}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setNewSlot({
                                        ...newSlot,
                                        date: selectedDate,
                                        time,
                                        duration: 30
                                      });
                                      setShowAddModal(true);
                                    }}
                                    className="w-full h-full text-gray-400 hover:text-teal-600"
                                  >
                                    +
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Appointments & Stats */}
        <div className="space-y-6">
          {/* Today's Appointments */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Today's Appointments</h3>
            
            <div className="space-y-3">
              {todaysAppointments.length > 0 ? (
                todaysAppointments.map(appointment => (
                  <div key={appointment.id} className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{appointment.doctorName}</div>
                        <div className="text-sm text-gray-600">{appointment.time}</div>
                      </div>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Confirmed
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      {appointment.type === 'Video Consultation' ? (
                        <FaVideo className="mr-2" />
                      ) : (
                        <FaMapMarkerAlt className="mr-2" />
                      )}
                      {appointment.type}
                    </div>
                    {appointment.symptoms && (
                      <div className="text-xs text-gray-500 mt-1">{appointment.symptoms}</div>
                    )}
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          if (appointment.type === 'Video Consultation' && appointment.meetingLink) {
                            window.open(appointment.meetingLink, '_blank');
                          }
                        }}
                        className={`text-xs px-3 py-1 rounded ${appointment.type === 'Video Consultation' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {appointment.type === 'Video Consultation' ? 'Join Call' : 'View Details'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <FaRegClock className="text-2xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600">No appointments today</p>
                </div>
              )}
            </div>
            
            <button className="w-full mt-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50">
              View All Appointments
            </button>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Pending Approvals</h3>
            
            <div className="space-y-3">
              {appointments
                .filter(app => app.status === 'pending')
                .slice(0, 3)
                .map(app => (
                  <div key={app.id} className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{app.doctorName}</div>
                        <div className="text-sm text-gray-600">{app.time}</div>
                      </div>
                      <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                        Pending
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      Symptoms: {app.symptoms?.substring(0, 30)}...
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          // Approve logic here
                          const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
                          const updated = savedAppointments.map(a => 
                            a.id === app.id ? {...a, status: 'confirmed'} : a
                          );
                          localStorage.setItem('appointments', JSON.stringify(updated));
                          setAppointments(updated);
                          
                          // Also update time slot
                          setTimeSlots(timeSlots.map(slot => {
                            if (slot.date === app.date && slot.time === app.time) {
                              return {...slot, status: 'booked', patientName: 'Patient'};
                            }
                            return slot;
                          }));
                        }}
                        className="flex-1 text-xs bg-green-600 text-white py-1 rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          // Reject logic here
                          const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
                          const updated = savedAppointments.map(a => 
                            a.id === app.id ? {...a, status: 'cancelled'} : a
                          );
                          localStorage.setItem('appointments', JSON.stringify(updated));
                          setAppointments(updated);
                        }}
                        className="flex-1 text-xs bg-red-600 text-white py-1 rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              
              {appointments.filter(app => app.status === 'pending').length === 0 && (
                <div className="text-center py-2">
                  <FaCheck className="text-2xl text-green-300 mx-auto mb-2" />
                  <p className="text-gray-600">No pending approvals</p>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Stats */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-6">Schedule Overview</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Available Slots</span>
                <span className="font-bold">{stats.available}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Booked Slots</span>
                <span className="font-bold">{stats.booked}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Total Appointments</span>
                <span className="font-bold">{appointments.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Video Consultations</span>
                <span className="font-bold">{stats.video}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/30">
              <div className="text-sm">
                <div className="font-medium mb-1">Next Available Slot</div>
                <div className="flex items-center space-x-2">
                  <FaRegClock />
                  <span>Tomorrow, 9:00 AM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => setShowRecurringModal(true)}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-3"
              >
                <FaSyncAlt className="text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Set Recurring Slots</div>
                  <div className="text-sm text-gray-600">Set up repeating time slots</div>
                </div>
              </button>
              
              <button 
                onClick={handleExportSchedule}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-3"
              >
                <FaDownload className="text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Export Schedule</div>
                  <div className="text-sm text-gray-600">Download schedule as CSV</div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-3">
                <FaPrint className="text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">Print Schedule</div>
                  <div className="text-sm text-gray-600">Print daily/weekly schedule</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Time Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Time Slot</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newSlot.date}
                    onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={newSlot.time}
                    onChange={(e) => setNewSlot({...newSlot, time: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    step="900"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setNewSlot({...newSlot, type: 'video'})}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center ${
                        newSlot.type === 'video' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <FaVideo className={`text-xl mb-2 ${newSlot.type === 'video' ? 'text-purple-600' : 'text-gray-400'}`} />
                      <span>Video</span>
                    </button>
                    <button
                      onClick={() => setNewSlot({...newSlot, type: 'clinic'})}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center ${
                        newSlot.type === 'clinic' 
                          ? 'border-teal-500 bg-teal-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <FaUserMd className={`text-xl mb-2 ${newSlot.type === 'clinic' ? 'text-teal-600' : 'text-gray-400'}`} />
                      <span>Clinic</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 45, 60].map(duration => (
                      <button
                        key={duration}
                        onClick={() => setNewSlot({...newSlot, duration})}
                        className={`py-2 rounded-lg ${
                          newSlot.duration === duration
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {duration}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newSlot.notes}
                    onChange={(e) => setNewSlot({...newSlot, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows="3"
                    placeholder="Add any notes about this time slot..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSlot}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Add Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Slots Modal */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Recurring Slots</h3>
                <button
                  onClick={() => setShowRecurringModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={recurringOptions.frequency}
                    onChange={(e) => setRecurringOptions({...recurringOptions, frequency: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                
                {recurringOptions.frequency === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Days of Week
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            const days = [...recurringOptions.daysOfWeek];
                            const dayIndex = index + 1;
                            if (days.includes(dayIndex)) {
                              setRecurringOptions({
                                ...recurringOptions,
                                daysOfWeek: days.filter(d => d !== dayIndex)
                              });
                            } else {
                              setRecurringOptions({
                                ...recurringOptions,
                                daysOfWeek: [...days, dayIndex]
                              });
                            }
                          }}
                          className={`py-2 rounded-lg ${
                            recurringOptions.daysOfWeek.includes(index + 1)
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Occurrences
                  </label>
                  <input
                    type="number"
                    value={recurringOptions.occurrences}
                    onChange={(e) => setRecurringOptions({...recurringOptions, occurrences: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    min="1"
                    max="52"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={recurringOptions.endDate}
                    onChange={(e) => setRecurringOptions({...recurringOptions, endDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowRecurringModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRecurringSlots}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Add Recurring Slots
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;