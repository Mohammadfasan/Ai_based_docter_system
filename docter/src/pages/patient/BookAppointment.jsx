import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Video, Hospital, ArrowLeft, 
  MapPin, Stethoscope, DollarSign, AlertCircle,
  Clock as ClockIcon
} from 'lucide-react';
import { doctorScheduleService } from '../../services/doctorScheduleService';
import { doctorAPI } from '../../services/api';
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
      
      const doctorResponse = await doctorAPI.getDoctorById(doctorId);
      console.log('📥 Doctor response:', doctorResponse);
      
      let doctorData = null;
      
      if (doctorResponse.success) {
        if (doctorResponse.data?.doctor) {
          doctorData = doctorResponse.data.doctor;
        } else if (doctorResponse.data?.data) {
          doctorData = doctorResponse.data.data;
        } else if (doctorResponse.data) {
          doctorData = doctorResponse.data;
        } else if (doctorResponse.doctor) {
          doctorData = doctorResponse.doctor;
        }
        
        if (doctorData) {
          console.log('✅ Doctor found:', doctorData);
          
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
      
      await refreshSlots();
      
    } catch (error) {
      console.error('❌ Error loading doctor data:', error);
      setBookingError(error.response?.data?.message || error.message || 'Failed to load doctor schedule.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Refresh slots from MongoDB ONLY (no localStorage)
  const refreshSlots = async () => {
    setRefreshingSlots(true);
    try {
      console.log('🔄 Refreshing available slots from MongoDB...');
      
      const slotsResponse = await doctorScheduleService.getAvailableSlots(doctorId);
      console.log('📥 Slots response:', slotsResponse);
      
      let slots = [];
      if (slotsResponse.success) {
        slots = slotsResponse.data || [];
      } else if (Array.isArray(slotsResponse)) {
        slots = slotsResponse;
      } else if (slotsResponse.data && Array.isArray(slotsResponse.data)) {
        slots = slotsResponse.data;
      }
      
      // Filter for available slots only
      const today = new Date().toISOString().split('T')[0];
      const available = slots.filter(slot => 
        slot.date >= today && 
        slot.status === 'available'
      );
      
      available.sort((a, b) => a.date.localeCompare(b.date));
      
      console.log('✅ Available slots from MongoDB:', available);
      setAvailableSlots(available);
      
      if (available.length > 0 && !selectedDate) {
        setSelectedDate(available[0].date);
      }
      
      // Clear selected slot if it's no longer available
      if (selectedSlot) {
        const stillAvailable = available.find(s => 
          s.date === selectedSlot.date && 
          s.time === selectedSlot.time &&
          s.status === 'available'
        );
        if (!stillAvailable) {
          console.log('⚠️ Previously selected slot is no longer available');
          setSelectedSlot(null);
        }
      }
      
    } catch (error) {
      console.error('Error refreshing slots:', error);
      setBookingError('Failed to load available slots');
    } finally {
      setRefreshingSlots(false);
    }
  };

  // ✅ Book appointment via MongoDB ONLY
  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Please login again to book an appointment');
      navigate('/login');
      return;
    }

    setIsBooking(true);
    setBookingError('');

    const patientId = currentUser.userId || currentUser._id;
    const patientName = currentUser.name || 'Patient';
    const patientEmail = currentUser.email || '';

    // Create appointment object
    const appointmentData = {
      patientId,
      patientName,
      patientEmail,
      doctorId,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      date: selectedSlot.date,
      time: selectedSlot.time,
      type: selectedSlot.type === 'video' ? 'Video Consultation' : 'Clinic Visit',
      location: selectedSlot.location || doctor.hospital || '',
      videoLink: selectedSlot.videoLink || '',
      fee: selectedSlot.fee || doctor.fees,
      symptoms: symptoms.trim() || 'General consultation',
      status: 'pending',
      slotId: String(selectedSlot.id)
    };

    console.log('📝 Creating appointment in MongoDB:', appointmentData);

    try {
      // ✅ Save appointment to MongoDB
      const response = await axios.post(`${API_URL}/appointments`, appointmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('✅ Appointment saved to MongoDB:', response.data.data);
        
        // ✅ Update slot status in MongoDB
        try {
          await doctorScheduleService.updateSlotStatus(
            doctorId,
            selectedSlot.id,
            'booked',
            { patientId, patientName, patientEmail }
          );
          console.log('✅ Slot marked as booked in MongoDB');
        } catch (slotError) {
          console.warn('⚠️ Slot status update failed:', slotError.message);
        }
        
        setBooking(response.data.data);
        setBookingSuccess(true);
        await refreshSlots();
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('❌ Booking failed:', error);
      
      if (error.response?.status === 400) {
        setBookingError(error.response.data.message || 'This time slot is no longer available');
      } else {
        setBookingError('Failed to book appointment. Please try again.');
      }
      
      await refreshSlots();
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
      {/* Header - unchanged */}
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

      <div className="max-w-4xl mx-auto px-6 mt-12">
        {/* Doctor Info Card - unchanged */}
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
                <span className="flex items-center gap-2"><Stethoscope size={16} />{doctor.experience}</span>
                <span className="flex items-center gap-2"><DollarSign size={16} />{doctor.feesDisplay || `LKR ${doctor.fees}`}</span>
                <span className="flex items-center gap-2"><MapPin size={16} />{doctor.location}</span>
                <span className="flex items-center gap-2"><Hospital size={16} />{doctor.hospital}</span>
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
                  <h4 className="font-black text-amber-800 text-lg mb-2">Appointment Request Sent!</h4>
                  <p className="text-amber-700 text-sm mb-2">
                    Your appointment request with Dr. {doctor.name} has been submitted.
                  </p>
                  <p className="text-amber-600 text-xs mb-4 flex items-center gap-1">
                    <AlertCircle size={14} />
                    Waiting for doctor's confirmation. You'll be notified once confirmed.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/appointments')}
                      className="px-6 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition flex items-center gap-2"
                    >
                      <Calendar size={16} />
                      View My Appointments
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
                  {/* Date Selection */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-600 mb-3">Select Date</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {availableDates.map(date => {
                        const dateSlots = availableSlots.filter(s => s.date === date);
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
                            <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              selectedDate === date ? 'bg-white text-teal-600' : 'bg-teal-500 text-white'
                            }`}>
                              {dateSlots.length}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div className="mb-8">
                      <label className="block text-sm font-bold text-slate-600 mb-3">Select Time Slot</label>
                      {slotsForSelectedDate.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {slotsForSelectedDate.map(slot => (
                            <button
                              key={slot.id}
                              onClick={() => handleSlotSelect(slot)}
                              className={`p-4 rounded-xl text-center transition-all ${
                                selectedSlot?.id === slot.id
                                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <div className="text-sm font-black">{slot.time}</div>
                              <div className="text-xs mt-1 flex items-center justify-center gap-1">
                                {slot.type === 'video' ? <Video size={12} /> : <Hospital size={12} />}
                                {slot.type === 'video' ? 'Video' : 'Clinic'}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 bg-amber-50 rounded-2xl text-center">
                          <p className="text-amber-600 text-sm">No available slots for this date.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected Slot Details */}
                  {selectedSlot && (
                    <div className="mb-8 p-4 bg-teal-50 rounded-2xl border border-teal-200">
                      <h4 className="font-bold text-teal-800 mb-2">Selected Appointment Details</h4>
                      <div className="space-y-2 text-sm text-teal-700">
                        <p className="flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(selectedSlot.date).toLocaleDateString('en-US', { 
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                          })}
                        </p>
                        <p className="flex items-center gap-2"><Clock size={14} />{selectedSlot.time}</p>
                        <p className="flex items-center gap-2">
                          {selectedSlot.type === 'video' ? <Video size={14} /> : <Hospital size={14} />}
                          {selectedSlot.type === 'video' ? 'Video Consultation' : 'Clinic Visit'}
                        </p>
                        <p className="flex items-center gap-2 mt-2 pt-2 border-t border-teal-200">
                          <DollarSign size={14} />
                          Fee: LKR {selectedSlot.fee || doctor.fees}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Symptoms Input */}
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

                  {/* Fee Summary */}
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl mb-6">
                    <span className="text-slate-600 font-bold">Consultation Fee</span>
                    <span className="text-2xl font-black text-teal-600">LKR {doctor.fees}</span>
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={handleBookAppointment}
                    disabled={!selectedSlot || isBooking}
                    className={`w-full py-4 rounded-2xl font-black text-white transition-all ${
                      selectedSlot && !isBooking
                        ? 'bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/30'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    {isBooking ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        Submitting Request...
                      </span>
                    ) : (
                      'Request Appointment'
                    )}
                  </button>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={32} className="text-amber-500" />
                  </div>
                  <p className="text-slate-600 font-medium mb-2">No Available Slots</p>
                  <p className="text-slate-400 text-sm">Please check back later.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;