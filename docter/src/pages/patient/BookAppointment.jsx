import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Video, MapPin, Check, 
  ChevronLeft, Star, ShieldCheck, Stethoscope, 
  CreditCard, Info, ArrowRight
} from 'lucide-react';

const doctorsData = [
  {
    id: 1,
    name: "Dr. Kasun Perera",
    specialization: "Cardiologist (Heart)",
    experience: 15,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.9,
    reviews: 240,
    consultationFee: 2500,
    location: "Asiri Surgical, Colombo",
    availability: {
      status: 'available',
      workingDays: [
        { day: 'Monday', active: true, start: '09:00', end: '17:00' },
        { day: 'Tuesday', active: false, start: '09:00', end: '17:00' },
        { day: 'Wednesday', active: true, start: '09:00', end: '17:00' },
        { day: 'Thursday', active: false, start: '09:00', end: '17:00' },
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
        { type: 'video', enabled: true, duration: 30, price: 2500 },
        { type: 'clinic', enabled: true, duration: 30, price: 2500 }
      ],
      slotDuration: 30,
      bufferTime: 15,
      maxDailyAppointments: 12,
      autoConfirm: true,
      advanceBookingDays: 30,
      unavailableDates: ['2024-12-25', '2024-12-31']
    }
  },
  {
    id: 2,
    name: "Dr. Fathima Riaz",
    specialization: "Dermatologist (Skin)",
    experience: 8,
    image: "https://randomuser.me/api/portraits/women/63.jpg",
    rating: 4.7,
    reviews: 180,
    consultationFee: 1800,
    location: "Kandy General Hospital",
    availability: {
      status: 'available',
      workingDays: [
        { day: 'Monday', active: false, start: '09:00', end: '17:00' },
        { day: 'Tuesday', active: true, start: '09:00', end: '17:00' },
        { day: 'Wednesday', active: false, start: '09:00', end: '17:00' },
        { day: 'Thursday', active: true, start: '09:00', end: '17:00' },
        { day: 'Friday', active: false, start: '09:00', end: '17:00' },
        { day: 'Saturday', active: true, start: '10:00', end: '14:00' },
        { day: 'Sunday', active: false, start: '10:00', end: '14:00' }
      ],
      breakTime: {
        enabled: true,
        start: '13:00',
        end: '14:00'
      },
      consultationTypes: [
        { type: 'video', enabled: true, duration: 30, price: 1800 },
        { type: 'clinic', enabled: true, duration: 30, price: 1800 }
      ],
      slotDuration: 30,
      bufferTime: 10,
      maxDailyAppointments: 15,
      autoConfirm: true,
      advanceBookingDays: 14,
      unavailableDates: ['2024-12-25']
    }
  },
  {
    id: 3,
    name: "Dr. Aravinda De Silva",
    specialization: "Neurologist",
    experience: 20,
    image: "https://randomuser.me/api/portraits/men/85.jpg",
    rating: 5.0,
    reviews: 412,
    consultationFee: 3000,
    location: "Nawaloka Hospital",
    availability: {
      status: 'available',
      workingDays: [
        { day: 'Monday', active: true, start: '09:00', end: '17:00' },
        { day: 'Tuesday', active: true, start: '09:00', end: '17:00' },
        { day: 'Wednesday', active: false, start: '09:00', end: '17:00' },
        { day: 'Thursday', active: false, start: '09:00', end: '17:00' },
        { day: 'Friday', active: true, start: '09:00', end: '17:00' },
        { day: 'Saturday', active: false, start: '10:00', end: '14:00' },
        { day: 'Sunday', active: false, start: '10:00', end: '14:00' }
      ],
      breakTime: {
        enabled: true,
        start: '12:30',
        end: '13:30'
      },
      consultationTypes: [
        { type: 'video', enabled: true, duration: 45, price: 3000 },
        { type: 'clinic', enabled: true, duration: 45, price: 3000 }
      ],
      slotDuration: 45,
      bufferTime: 15,
      maxDailyAppointments: 8,
      autoConfirm: false,
      advanceBookingDays: 60,
      unavailableDates: ['2024-12-25', '2024-12-31', '2025-01-01']
    }
  }
];

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [bookingType, setBookingType] = useState('video');
  const [loading, setLoading] = useState(true);

  // Generate time slots based on doctor's availability
  const generateTimeSlots = (doctorData, selectedDate) => {
    if (!doctorData || !selectedDate) return [];
    
    const slots = [];
    const selectedDay = new Date(selectedDate);
    const dayName = selectedDay.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if doctor works on this day
    const workingDay = doctorData.availability.workingDays.find(d => 
      d.day.toLowerCase() === dayName.toLowerCase()
    );
    
    if (!workingDay || !workingDay.active) return [];
    
    // Check if date is in unavailable dates
    if (doctorData.availability.unavailableDates.includes(selectedDate)) {
      return [];
    }
    
    const slotDuration = doctorData.availability.slotDuration;
    const bufferTime = doctorData.availability.bufferTime;
    const startTime = workingDay.start;
    const endTime = workingDay.end;
    const breakStart = doctorData.availability.breakTime.enabled ? doctorData.availability.breakTime.start : null;
    const breakEnd = doctorData.availability.breakTime.enabled ? doctorData.availability.breakTime.end : null;
    
    // Convert time strings to minutes
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const breakStartMinutes = breakStart ? timeToMinutes(breakStart) : null;
    const breakEndMinutes = breakEnd ? timeToMinutes(breakEnd) : null;
    
    // Generate slots
    let currentMinutes = startMinutes;
    
    while (currentMinutes + slotDuration <= endMinutes) {
      // Check if slot falls during break time
      const isDuringBreak = breakStartMinutes && breakEndMinutes && 
        currentMinutes >= breakStartMinutes && 
        currentMinutes + slotDuration <= breakEndMinutes;
      
      if (!isDuringBreak) {
        const slotStart = new Date(selectedDay);
        slotStart.setHours(Math.floor(currentMinutes / 60));
        slotStart.setMinutes(currentMinutes % 60);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotStart.getMinutes() + slotDuration);
        
        const timeStr = slotStart.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        const slotType = bookingType;
        const isTypeEnabled = doctorData.availability.consultationTypes.find(
          ct => ct.type === bookingType
        )?.enabled;
        
        slots.push({
          id: `${selectedDate}-${currentMinutes}`,
          date: selectedDate,
          time: timeStr,
          displayTime: timeStr,
          startTime: slotStart,
          endTime: slotEnd,
          type: slotType,
          available: isTypeEnabled || true,
          price: doctorData.consultationFee
        });
      }
      
      currentMinutes += slotDuration + bufferTime;
    }
    
    // Limit to max daily appointments
    return slots.slice(0, doctorData.availability.maxDailyAppointments);
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const foundDoctor = doctorsData.find(d => d.id === parseInt(doctorId));
      if (foundDoctor) {
        setDoctor(foundDoctor);
        
        // Check if selected consultation type is enabled
        const consultationType = foundDoctor.availability.consultationTypes.find(
          ct => ct.type === bookingType
        );
        
        if (!consultationType || !consultationType.enabled) {
          // If current type is disabled, switch to available type
          const availableType = foundDoctor.availability.consultationTypes.find(ct => ct.enabled);
          if (availableType) {
            setBookingType(availableType.type);
          }
        }
        
        // Set initial date (today or next available working day)
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        setSelectedDate(todayStr);
        
        // Generate slots for today
        const slots = generateTimeSlots(foundDoctor, todayStr);
        setAvailableSlots(slots);
      } else {
        alert("Doctor not found!");
        navigate('/doctors');
      }
      setLoading(false);
    }, 600);
  }, [doctorId, navigate]);

  // Update slots when date or booking type changes
  useEffect(() => {
    if (doctor && selectedDate) {
      const slots = generateTimeSlots(doctor, selectedDate);
      setAvailableSlots(slots);
      setSelectedSlot(null); // Reset selected slot when date changes
    }
  }, [selectedDate, bookingType, doctor]);

  const handleBooking = () => {
    if (!selectedSlot) return alert('Please select a time slot');
    if (!symptoms.trim()) return alert('Please describe your symptoms');
    
    // Create appointment data
    const newAppointment = {
      id: `APT-${Date.now()}`,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialization,
      date: selectedSlot.date,
      time: selectedSlot.displayTime,
      type: bookingType === 'video' ? 'Video Consultation' : 'Clinic Visit',
      status: doctor.availability.autoConfirm ? 'confirmed' : 'pending',
      symptoms: symptoms,
      consultationFee: doctor.consultationFee,
      location: bookingType === 'video' ? 'Online' : doctor.location,
      image: doctor.image,
      doctorId: doctor.id,
      slotId: selectedSlot.id,
      duration: doctor.availability.slotDuration
    };

    // Save to localStorage
    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    localStorage.setItem('appointments', JSON.stringify([newAppointment, ...existingAppointments]));
    
    alert(`Appointment ${doctor.availability.autoConfirm ? 'confirmed' : 'requested'}!`);
    navigate('/appointments');
  };

  const getAvailableDates = () => {
    if (!doctor) return [];
    
    const dates = [];
    const today = new Date();
    const advanceDays = doctor.availability.advanceBookingDays;
    
    for (let i = 0; i < advanceDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if doctor works on this day
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const workingDay = doctor.availability.workingDays.find(d => 
        d.day.toLowerCase() === dayName.toLowerCase()
      );
      
      // Check if date is unavailable
      const isUnavailable = doctor.availability.unavailableDates.includes(dateStr);
      
      const isWorkingDay = workingDay && workingDay.active && !isUnavailable;
      
      dates.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        num: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0,
        isWorkingDay: isWorkingDay,
        isUnavailable: isUnavailable
      });
    }
    return dates;
  };

  const filteredSlots = availableSlots;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-emerald-50">Loading...</div>;

  return (
    <div className="min-h-screen bg-emerald-50/50 pb-20 font-sans text-slate-800">
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-20 px-4 py-4 border-b border-emerald-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="text-slate-600" size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-800">Book Appointment</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-white sticky top-24">
            <div className="flex flex-col items-center text-center">
              <img src={doctor.image} alt={doctor.name} className="w-28 h-28 rounded-full object-cover border-4 border-emerald-50 shadow-md mb-4" />
              <h2 className="text-xl font-bold text-slate-900">{doctor.name}</h2>
              <p className="text-sm text-emerald-600 font-medium mt-1">{doctor.specialization}</p>
              
              {/* Availability Status */}
              <div className="mt-2 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  doctor.availability.status === 'available' ? 'bg-green-500' :
                  doctor.availability.status === 'busy' ? 'bg-yellow-500' :
                  doctor.availability.status === 'away' ? 'bg-orange-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs font-medium capitalize text-gray-600">
                  {doctor.availability.status}
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3 text-center">Consultation Type</p>
              <div className="grid grid-cols-2 gap-3">
                {doctor.availability.consultationTypes.map((type) => (
                  <button 
                    key={type.type}
                    onClick={() => setBookingType(type.type)}
                    disabled={!type.enabled}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 ${
                      bookingType === type.type 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-slate-100 text-slate-500'
                    } ${!type.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {type.type === 'video' ? <Video size={20} /> : <MapPin size={20} />}
                    <span className="text-xs font-bold capitalize">{type.type}</span>
                    {!type.enabled && (
                      <span className="text-[10px] text-red-500">Not Available</span>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Slot Duration Info */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Duration: {doctor.availability.slotDuration} minutes • Buffer: {doctor.availability.bufferTime} minutes
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="text-emerald-600" size={20} /> Select Date
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {getAvailableDates().map((item) => (
                <button 
                  key={item.date} 
                  onClick={() => setSelectedDate(item.date)}
                  disabled={!item.isWorkingDay || item.isUnavailable}
                  className={`flex-shrink-0 w-[72px] h-[88px] rounded-2xl flex flex-col items-center justify-center transition-all ${
                    selectedDate === item.date 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : item.isWorkingDay 
                        ? 'bg-white border border-slate-100 text-slate-600 hover:border-emerald-300'
                        : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xs font-medium">{item.day}</span>
                  <span className="text-xl font-bold my-1">{item.num}</span>
                  <span className="text-[10px] font-medium">{item.month}</span>
                  {item.isToday && (
                    <span className="text-[8px] text-emerald-500 font-bold mt-1">TODAY</span>
                  )}
                  {item.isUnavailable && (
                    <span className="text-[8px] text-red-500 font-bold mt-1">UNAVAILABLE</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="text-emerald-600" size={20} /> Available Slots
            </h3>
            
            {filteredSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {!selectedDate 
                    ? 'Please select a date'
                    : `No available slots for ${new Date(selectedDate).toLocaleDateString()}. 
                       Try selecting a different date or consultation type.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {filteredSlots.map((slot) => (
                  <button 
                    key={slot.id} 
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3 px-2 rounded-xl text-sm font-semibold border flex flex-col items-center ${
                      selectedSlot?.id === slot.id 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                    } ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!slot.available}
                  >
                    {slot.displayTime}
                    <span className="text-[10px] mt-1 opacity-75">
                      {slot.type === 'video' ? 'Video' : 'Clinic'}
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Doctor's Working Hours */}
            {doctor && selectedDate && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Working hours:</span>{' '}
                  {(() => {
                    const selectedDay = new Date(selectedDate);
                    const dayName = selectedDay.toLocaleDateString('en-US', { weekday: 'long' });
                    const workingDay = doctor.availability.workingDays.find(d => 
                      d.day.toLowerCase() === dayName.toLowerCase()
                    );
                    return workingDay && workingDay.active 
                      ? `${workingDay.start} - ${workingDay.end} ${
                          doctor.availability.breakTime.enabled 
                            ? `(Break: ${doctor.availability.breakTime.start} - ${doctor.availability.breakTime.end})`
                            : ''
                        }`
                      : 'Not working today';
                  })()}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Stethoscope className="text-emerald-600" size={20} /> Symptoms
            </h3>
            <textarea 
              value={symptoms} 
              onChange={(e) => setSymptoms(e.target.value)} 
              placeholder="Describe your symptoms, concerns, or reason for consultation..." 
              rows="3" 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-lg z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Consultation Fee</p>
            <p className="text-2xl font-black text-slate-800">
              LKR {selectedSlot ? selectedSlot.price : doctor?.consultationFee}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {doctor?.availability.slotDuration} minutes • {doctor?.availability.autoConfirm ? 'Auto-confirm' : 'Manual approval'}
            </p>
          </div>
          <button 
            onClick={handleBooking} 
            disabled={!selectedSlot || !symptoms.trim()}
            className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            {doctor?.availability.autoConfirm ? 'Confirm Booking' : 'Request Appointment'}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;