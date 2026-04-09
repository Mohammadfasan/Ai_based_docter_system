// BookAppointment.jsx - Using ONLY MongoDB (no localStorage)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Video, Hospital, ArrowLeft, 
  MapPin, Stethoscope, DollarSign, AlertCircle,
  Clock as ClockIcon
} from 'lucide-react';
import { doctorScheduleService } from '../../services/doctorScheduleService';
import { doctorAPI } from '../../services/api';
import { appointmentAPI } from '../../services/appointmentAPI';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [symptoms, setSymptoms] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [booking, setBooking] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [refreshingSlots, setRefreshingSlots] = useState(false);

  useEffect(() => {
    if (!doctorId) {
      navigate('/doctors');
      return;
    }
    loadDoctorAndSlots();
  }, [doctorId]);

  const loadDoctorAndSlots = async () => {
    setLoading(true);
    setBookingError('');
    
    try {
      console.log('🔍 Loading doctor with ID:', doctorId);
      
      // Load doctor details from API
      const doctorResponse = await doctorAPI.getDoctorById(doctorId);
      
      let doctorData = null;
      
      if (doctorResponse.success) {
        if (doctorResponse.data && doctorResponse.data.doctor) {
          doctorData = doctorResponse.data.doctor;
        } else if (doctorResponse.data && doctorResponse.data.data) {
          doctorData = doctorResponse.data.data;
        } else if (doctorResponse.data) {
          doctorData = doctorResponse.data;
        } else if (doctorResponse.doctor) {
          doctorData = doctorResponse.doctor;
        }
        
        if (doctorData) {
          let feeAmount = 2500;
          if (doctorData.fees) {
            const feeStr = doctorData.fees.toString();
            const match = feeStr.match(/\d+/);
            if (match) feeAmount = parseInt(match[0]);
          }
          
          setDoctor({
            id: doctorData._id || doctorData.doctorId || doctorId,
            name: doctorData.name || 'Doctor',
            specialization: doctorData.specialization || 'General Physician',
            email: doctorData.email || '',
            phone: doctorData.phone || '',
            fees: feeAmount,
            feesDisplay: doctorData.fees || `LKR ${feeAmount}`,
            experience: doctorData.experience || '10+ years',
            location: doctorData.location || 'Colombo',
            hospital: doctorData.hospital || 'General Hospital',
            qualifications: doctorData.qualifications || '',
            rating: doctorData.rating || 4.5,
            image: doctorData.image || '',
            languages: doctorData.languages || ['English', 'Sinhala'],
            isVideoAvailable: doctorData.isVideoAvailable !== false,
            status: doctorData.status || 'active'
          });
        } else {
          throw new Error('Doctor data not found in response');
        }
      } else {
        throw new Error(doctorResponse.message || 'Doctor not found');
      }
      
      // Load available slots from API
      await refreshSlots();
      
    } catch (error) {
      console.error('❌ Error loading doctor data:', error);
      setBookingError(error.response?.data?.message || error.message || 'Failed to load doctor schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshSlots = async () => {
    setRefreshingSlots(true);
    try {
      console.log('🔄 Refreshing available slots from MongoDB...');
      
      // Get slots from API only (no localStorage)
      const slotsResponse = await doctorScheduleService.getAvailableSlots(doctorId);
      
      let slots = [];
      if (slotsResponse.success) {
        slots = slotsResponse.data || [];
      } else if (Array.isArray(slotsResponse)) {
        slots = slotsResponse;
      } else if (slotsResponse.data && Array.isArray(slotsResponse.data)) {
        slots = slotsResponse.data;
      }
      
      // Filter for future slots only and available status
      const today = new Date().toISOString().split('T')[0];
      const available = slots.filter(slot => 
        slot.date >= today && slot.status === 'available'
      );
      
      // Sort by date
      available.sort((a, b) => a.date.localeCompare(b.date));
      
      console.log('✅ Available slots from MongoDB:', available.length);
      setAvailableSlots(available);
      
      if (available.length > 0 && !selectedDate) {
        setSelectedDate(available[0].date);
      }
      
      // Clear selected slot if it's no longer available
      if (selectedSlot) {
        const stillAvailable = available.find(s => 
          s.date === selectedSlot.date && s.time === selectedSlot.time
        );
        if (!stillAvailable) {
          setSelectedSlot(null);
        }
      }
      
    } catch (error) {
      console.error('Error refreshing slots:', error);
      setBookingError('Failed to load available slots. Please try again.');
    } finally {
      setRefreshingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser?.userId && !currentUser?._id) {
      alert('Please login again to book an appointment');
      navigate('/login');
      return;
    }

    setIsBooking(true);
    setBookingError('');

    const patientId = currentUser.userId || currentUser._id;
    const patientName = currentUser.name || 'Patient';
    const patientEmail = currentUser.email || '';
    const patientPhone = currentUser.phone || currentUser.mobile || currentUser.contactNumber || 'Not provided';

    // Create appointment object matching controller expectations
    const appointmentData = {
      doctorId: doctorId,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      patientName: patientName,
      patientEmail: patientEmail,
      patientPhone: patientPhone,
      date: selectedSlot.date,
      time: selectedSlot.time,
      type: selectedSlot.type === 'video' ? 'video' : 'in-person',
      location: selectedSlot.location || doctor.hospital || '',
      videoLink: selectedSlot.videoLink || '',
      fee: selectedSlot.fee || doctor.fees,
      notes: symptoms.trim() || 'General consultation'
    };

    console.log('📝 Creating appointment in MongoDB with PENDING status:', appointmentData);

    try {
      const response = await appointmentAPI.createAppointment(appointmentData);
      
      if (response.success) {
        console.log('✅ Appointment saved to MongoDB with PENDING status');
        setBooking(response.data);
        setBookingSuccess(true);
        
        // Refresh slots to update availability
        await refreshSlots();
      } else {
        throw new Error(response.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('❌ Booking failed:', error);
      setBookingError(error.response?.data?.message || error.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleSlotSelect = (slot) => {
    if (slot.status !== 'available') {
      setBookingError('This time slot is no longer available.');
      refreshSlots();
      return;
    }
    setSelectedSlot(slot);
    setBookingError('');
  };

  const availableDates = [...new Set(availableSlots.map(s => s.date))];
  const slotsForSelectedDate = availableSlots.filter(slot => slot.date === selectedDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading doctor schedule...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Stethoscope size={40} className="text-red-500" />
          </div>
          <p className="text-slate-600 mb-4 text-lg">Doctor not found</p>
          <p className="text-slate-400 text-sm mb-6">The doctor you're looking for may have been removed or is no longer available.</p>
          <button 
            onClick={() => navigate('/doctors')}
            className="bg-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-600 transition"
          >
            Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      {/* Header */}
      <div className="bg-[#0f172a] pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => navigate('/doctors')}
              className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to Doctors</span>
            </button>
            
            <button 
              onClick={() => navigate('/appointments')}
              className="bg-teal-500/20 hover:bg-teal-500/30 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
            >
              <Calendar size={16} />
              My Appointments
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-black text-white mb-4">Book Appointment</h1>
            <p className="text-slate-400">Schedule your consultation with Dr. {doctor.name}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 mt-12">
        {/* Doctor Info Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-teal-100 flex-shrink-0">
              <img 
                src={doctor.image || `https://ui-avatars.com/api/?name=${doctor.name?.charAt(0)}&background=0D9488&color=fff&size=100`}
                alt={doctor.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${doctor.name?.charAt(0)}&background=0D9488&color=fff&size=100`;
                }}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-slate-800 mb-2">Dr. {doctor.name}</h2>
              <p className="text-teal-600 font-semibold mb-3">{doctor.specialization}</p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <Stethoscope size={16} />
                  {doctor.experience}
                </span>
                <span className="flex items-center gap-2">
                  <DollarSign size={16} />
                  {doctor.feesDisplay || `LKR ${doctor.fees}`}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  {doctor.location}
                </span>
                <span className="flex items-center gap-2">
                  <Hospital size={16} />
                  {doctor.hospital}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Calendar size={20} className="text-teal-500" />
              Select Date & Time
            </h3>
            <button
              onClick={refreshSlots}
              disabled={refreshingSlots}
              className="text-teal-500 text-sm font-medium hover:text-teal-600 flex items-center gap-1"
            >
              <span className={`${refreshingSlots ? 'animate-spin' : ''}`}>🔄</span>
              Refresh
            </button>
          </div>

          {bookingError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-start gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{bookingError}</span>
            </div>
          )}

          {bookingSuccess && (
            <div className="mb-6 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <ClockIcon size={24} className="text-amber-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-black text-amber-800 text-lg mb-2">Appointment Request Sent! ⏳</h4>
                  <p className="text-amber-700 text-sm mb-2">
                    Your appointment request with Dr. {doctor.name} has been submitted for {new Date(selectedSlot?.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })} at {selectedSlot?.time}.
                  </p>
                  <div className="bg-amber-100 p-3 rounded-xl mb-4">
                    <p className="text-amber-800 text-xs flex items-center gap-2">
                      <AlertCircle size={14} />
                      <span className="font-bold">Status: PENDING</span> - Waiting for doctor's confirmation
                    </p>
                  </div>
                  <p className="text-amber-600 text-xs mb-4">
                    You will receive a notification once the doctor confirms your appointment.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/appointments')}
                      className="px-6 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition flex items-center gap-2"
                    >
                      <Calendar size={16} />
                      View My Appointments
                    </button>
                    <button
                      onClick={() => {
                        setBookingSuccess(false);
                        setSelectedSlot(null);
                        setSymptoms('');
                        refreshSlots();
                      }}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition"
                    >
                      Book Another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!bookingSuccess && (
            <>
              {availableDates.length > 0 ? (
                <>
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-600 mb-3">Select Date</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {availableDates.map(date => {
                        const dateSlots = availableSlots.filter(s => s.date === date);
                        const availableCount = dateSlots.filter(s => s.status === 'available').length;
                        
                        return (
                          <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={`p-3 rounded-xl text-center transition-all relative ${
                              selectedDate === date
                                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <div className="text-xs font-bold">
                              {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className="text-sm font-black">
                              {new Date(date).getDate()}
                            </div>
                            {availableCount > 0 && (
                              <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                selectedDate === date 
                                  ? 'bg-white text-teal-600' 
                                  : 'bg-teal-500 text-white'
                              }`}>
                                {availableCount}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="mb-8">
                      <label className="block text-sm font-bold text-slate-600 mb-3">Select Time Slot</label>
                      {slotsForSelectedDate.filter(s => s.status === 'available').length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {slotsForSelectedDate.map(slot => {
                            const available = slot.status === 'available';
                            
                            return (
                              <button
                                key={slot.id}
                                onClick={() => available && handleSlotSelect(slot)}
                                disabled={!available}
                                className={`p-4 rounded-xl text-center transition-all ${
                                  !available
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                    : selectedSlot?.id === slot.id
                                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <div className="text-sm font-black">{slot.time}</div>
                                <div className="text-xs mt-1 flex items-center justify-center gap-1">
                                  {slot.type === 'video' ? <Video size={12} /> : <Hospital size={12} />}
                                  {slot.type === 'video' ? 'Video' : 'Clinic'}
                                </div>
                                {!available && (
                                  <div className="text-[10px] text-red-400 mt-1">Booked</div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 bg-amber-50 rounded-2xl text-center">
                          <p className="text-amber-600 text-sm">No available slots for this date.</p>
                          <p className="text-amber-500 text-xs mt-1">Please select another date.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedSlot && selectedSlot.status === 'available' && (
                    <div className="mb-8 p-4 bg-teal-50 rounded-2xl border border-teal-200">
                      <h4 className="font-bold text-teal-800 mb-2">Selected Appointment Details</h4>
                      <div className="space-y-2 text-sm text-teal-700">
                        <p className="flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(selectedSlot.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock size={14} />
                          {selectedSlot.time}
                        </p>
                        <p className="flex items-center gap-2">
                          {selectedSlot.type === 'video' ? <Video size={14} /> : <Hospital size={14} />}
                          {selectedSlot.type === 'video' ? 'Video Consultation' : 'Clinic Visit'}
                          {selectedSlot.type === 'clinic' && selectedSlot.location && ` at ${selectedSlot.location}`}
                          {selectedSlot.type === 'clinic' && !selectedSlot.location && doctor.hospital && ` at ${doctor.hospital}`}
                        </p>
                        <p className="flex items-center gap-2 mt-2 pt-2 border-t border-teal-200">
                          <DollarSign size={14} />
                          Fee: LKR {selectedSlot.fee || doctor.fees}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-600 mb-3">
                      Symptoms / Reason for Visit
                    </label>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      rows="3"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      placeholder="Please describe your symptoms or reason for consultation..."
                    />
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl mb-6">
                    <span className="text-slate-600 font-bold">Consultation Fee</span>
                    <span className="text-2xl font-black text-teal-600">LKR {doctor.fees}</span>
                  </div>

                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-700">
                        <p className="font-bold mb-1">⏳ Pending Confirmation</p>
                        <p>Your appointment request will be pending until confirmed by the doctor. You'll receive a notification once confirmed.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBookAppointment}
                    disabled={!selectedSlot || isBooking || selectedSlot.status !== 'available'}
                    className={`w-full py-4 rounded-2xl font-black text-white transition-all ${
                      selectedSlot && selectedSlot.status === 'available' && !isBooking
                        ? 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/30'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    {isBooking ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        Submitting Request...
                      </span>
                    ) : (
                      'Request Appointment (Pending Confirmation)'
                    )}
                  </button>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={32} className="text-amber-500" />
                  </div>
                  <p className="text-slate-600 font-medium mb-2">No Available Slots</p>
                  <p className="text-slate-400 text-sm">
                    Dr. {doctor.name} currently has no available appointments. Please check back later.
                  </p>
                  <button
                    onClick={() => navigate('/doctors')}
                    className="mt-6 text-teal-500 font-bold hover:text-teal-600"
                  >
                    ← Back to Doctors
                  </button>
                </div>
              )}
            </>
          )}

          {!bookingSuccess && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => navigate('/appointments')}
                className="text-teal-500 text-sm font-bold hover:text-teal-600 transition flex items-center gap-1"
              >
                <ArrowLeft size={14} />
                View My Appointments
              </button>
              <p className="text-xs text-slate-400">
                By confirming, you agree to our terms and conditions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;