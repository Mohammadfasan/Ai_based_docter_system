import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Video, Hospital, ArrowLeft, 
  MapPin, ShieldCheck, Stethoscope, 
  DollarSign, HeartPulse, ChevronRight
} from 'lucide-react';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [symptoms, setSymptoms] = useState('');

  useEffect(() => {
    if (!doctorId) return;
    loadDoctorAndSlots();
  }, [doctorId]);

  const loadDoctorAndSlots = () => {
    setLoading(true);
    const doctors = JSON.parse(localStorage.getItem('healthai_doctors') || '[]');
    const foundDoctor = doctors.find(d => d.id === doctorId || d.userId === doctorId);
    if (foundDoctor) setDoctor(foundDoctor);
    
    // Doctor schedule-la irunthu slots-ah edukkirom
    const specificKey = `doctor_slots_${doctorId}`;
    let doctorSlots = JSON.parse(localStorage.getItem(specificKey) || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    const available = doctorSlots
      .filter(slot => slot.status === 'available' && slot.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));

    setAvailableSlots(available);
    if (available.length > 0) setSelectedDate(available[0].date);
    setLoading(false);
  };

  const handleBookAppointment = () => {
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser?.userId) {
      alert('Please login again');
      return;
    }

    const appointment = {
      id: `APT${Date.now()}`,
      patientId: currentUser.userId,
      patientName: currentUser.name || 'Patient',
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      date: selectedSlot.date,
      time: selectedSlot.time,
      type: selectedSlot.type === 'video' ? 'Video Consultation' : 'Clinic Visit',
      
      // INTHA RENDU FIELDS-UM DOCTOR SCHEDULE-LA IRUNTHU VARUM
      location: selectedSlot.location || '', 
      videoLink: selectedSlot.videoLink || '',
      
      fee: doctor?.fee || 2500,
      symptoms: symptoms || 'General consultation',
      status: 'pending',
      bookedAt: new Date().toISOString(),
      slotId: selectedSlot.id
    };

    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    // Slot status-ah 'booked' nu mathuroam
    const storageKey = `doctor_slots_${doctor.id}`;
    const doctorSlots = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedSlots = doctorSlots.map(s => s.id === selectedSlot.id ? { ...s, status: 'booked' } : s);
    localStorage.setItem(storageKey, JSON.stringify(updatedSlots));

    alert(`✅ Appointment Booked! Mode: ${appointment.type}`);
    navigate('/appointments');
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Loading...</div>;

  const availableDates = [...new Set(availableSlots.map(s => s.date))];

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-['Plus_Jakarta_Sans'] pb-20">
      {/* Header Section */}
      <section className="bg-[#0f172a] pt-12 pb-40 px-6 lg:px-20 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <button onClick={() => navigate('/doctors')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 transition-all">
            <ArrowLeft size={18} /> BACK
          </button>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <img src={doctor?.image || 'https://via.placeholder.com/150'} alt={doctor?.name} className="w-32 h-32 md:w-44 md:h-44 rounded-[2.8rem] object-cover border-4 border-teal-500" />
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-3">{doctor?.name}</h1>
              <p className="text-teal-400 font-bold flex items-center justify-center lg:justify-start gap-2">
                <Stethoscope size={18} /> {doctor?.specialization}
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 lg:px-20 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Slots Selection */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[3rem] p-8 shadow-xl">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3"><Calendar /> Available Dates</h2>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {availableDates.map(date => (
                  <button 
                    key={date} 
                    onClick={() => setSelectedDate(date)}
                    className={`min-w-[90px] p-6 rounded-3xl border-2 transition-all ${selectedDate === date ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-100'}`}
                  >
                    <span className="block text-xs uppercase font-bold">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="text-xl font-black">{new Date(date).getDate()}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="bg-white rounded-[3rem] p-8 shadow-xl">
                <h2 className="text-xl font-black mb-6 flex items-center gap-3"><Clock /> Pick Time</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableSlots.filter(s => s.date === selectedDate).map(slot => (
                    <button 
                      key={slot.id} 
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-5 rounded-2xl border-2 transition-all ${selectedSlot?.id === slot.id ? 'border-teal-500 bg-[#0f172a] text-white' : 'border-slate-50 bg-slate-50'}`}
                    >
                      <div className="font-black text-lg">{slot.time}</div>
                      <div className="text-[10px] uppercase font-bold opacity-70">{slot.type}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-[#0f172a] rounded-[3rem] p-8 text-white sticky top-10 shadow-2xl shadow-teal-900/40">
              <h2 className="text-2xl font-black mb-8">Appointment Details</h2>
              
              {selectedSlot ? (
                <div className="space-y-6">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Timing</p>
                    <p className="font-bold">{new Date(selectedSlot.date).toDateString()} at {selectedSlot.time}</p>
                  </div>

                  {/* LOCATION OR LINK DISPLAY */}
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-teal-400 font-bold uppercase mb-1">
                      {selectedSlot.type === 'video' ? 'Meeting Link' : 'Clinic Location'}
                    </p>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {selectedSlot.type === 'video' ? <Video size={16}/> : <Hospital size={16}/>}
                      {selectedSlot.type === 'video' ? (selectedSlot.videoLink || 'Will be shared') : (selectedSlot.location || 'Hospital Address')}
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Consultation Fee</p>
                    <p className="text-xl font-black text-white">LKR {doctor?.fee || '2,500'}</p>
                  </div>

                  <textarea
                    placeholder="Enter symptoms..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-teal-500"
                    rows="3"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  />

                  <button 
                    onClick={handleBookAppointment}
                    className="w-full py-5 bg-teal-500 hover:bg-teal-400 text-[#0f172a] rounded-2xl font-black transition-all flex items-center justify-center gap-2"
                  >
                    CONFIRM BOOKING <ChevronRight size={20}/>
                  </button>
                </div>
              ) : (
                <div className="text-center py-10 opacity-50">
                  <HeartPulse className="mx-auto mb-4" size={40}/>
                  <p>Select a slot to continue</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookAppointment;