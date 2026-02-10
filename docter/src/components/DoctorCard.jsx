import React, { useState } from 'react';
import { 
  FaStar, FaCalendarAlt, FaUserMd, FaGraduationCap, 
  FaHospital, FaCheck, FaVideo, FaPhone, FaMapMarkerAlt,
  FaClock, FaHeart, FaRegHeart, FaShareAlt, FaBookmark,
  FaRegBookmark, FaChartLine, FaUserFriends, FaAward,
  FaStethoscope, FaShieldAlt, FaComments, FaCapsules,
  FaArrowRight, FaEye, FaTimes, FaInfoCircle
} from 'react-icons/fa';
import { GiMedicines, GiHeartBeats } from 'react-icons/gi';

const DoctorCard = ({ doctor, onBook, isCompareMode = false, onCompareToggle, onBookmarkToggle }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isInCompare, setIsInCompare] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'from-green-500 to-emerald-600';
    if (confidence >= 80) return 'from-blue-500 to-cyan-600';
    if (confidence >= 70) return 'from-yellow-500 to-amber-600';
    return 'from-gray-500 to-gray-600';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'bg-gradient-to-r from-yellow-400 to-amber-500';
    if (rating >= 4.0) return 'bg-gradient-to-r from-yellow-300 to-amber-400';
    return 'bg-gradient-to-r from-yellow-200 to-amber-300';
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmarkToggle && onBookmarkToggle(doctor.id);
  };

  const handleCompare = () => {
    setIsInCompare(!isInCompare);
    onCompareToggle && onCompareToggle(doctor.id);
  };

  const handleQuickBook = (type) => {
    if (type === 'video' && doctor.telemedicine) {
      alert(`Initiating video consultation with ${doctor.name}...`);
    } else if (type === 'clinic') {
      onBook(doctor);
    } else if (type === 'phone') {
      alert(`Calling ${doctor.name} at ${doctor.contact}...`);
    }
  };

  return (
    <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 hover:border-teal-300">
      {/* Premium/Featured Badge */}
      {doctor.featured && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-1 rounded-r-full text-xs font-bold flex items-center shadow-lg">
            <FaAward className="mr-1" />
            FEATURED
          </div>
        </div>
      )}
      
      {/* Confidence Match Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`bg-gradient-to-r ${getConfidenceColor(doctor.confidence)} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transform hover:scale-105 transition-transform`}>
          {doctor.confidence}% Match
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-emerald-600"></div>
        </div>
      </div>

      {/* Quick Actions Overlay */}
      {showQuickActions && (
        <div className="absolute inset-0 bg-black bg-opacity-80 z-20 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900">Quick Actions</h3>
              <button
                onClick={() => setShowQuickActions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => handleQuickBook('video')}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                disabled={!doctor.telemedicine}
              >
                <FaVideo />
                <span>Video Consultation</span>
              </button>
              <button
                onClick={() => handleQuickBook('clinic')}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
              >
                <FaCalendarAlt />
                <span>Book Clinic Visit</span>
              </button>
              <button
                onClick={() => handleQuickBook('phone')}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <FaPhone />
                <span>Call Doctor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Header Section */}
      <div className="p-6 pb-4">
        <div className="flex items-start space-x-4 mb-6">
          {/* Doctor Avatar */}
          <div className="relative flex-shrink-0">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
              <img 
                src={doctor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`}
                alt={doctor.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-teal-400 to-teal-600 text-white">
                      ${doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  `;
                }}
              />
            </div>
            {/* Online Status */}
            {doctor.online && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            )}
            {/* Verified Badge */}
            {doctor.verified && (
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <FaCheck className="text-white text-sm" />
              </div>
            )}
          </div>

          {/* Doctor Basic Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{doctor.name}</h3>
                <p className="text-teal-600 font-semibold text-lg">{doctor.specialization}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleBookmark}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Bookmark"
                >
                  {isBookmarked ? <FaBookmark className="text-red-500" /> : <FaRegBookmark />}
                </button>
                <button
                  onClick={handleCompare}
                  className={`p-2 rounded-full ${isInCompare ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'} transition-colors`}
                  title="Compare"
                >
                  <FaChartLine />
                </button>
                <button
                  onClick={() => setShowQuickActions(true)}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                  title="Quick Actions"
                >
                  <FaArrowRight className="transform rotate-45" />
                </button>
              </div>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center space-x-4 mb-3">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getRatingColor(doctor.rating)} text-white font-bold`}>
                <FaStar />
                <span>{doctor.rating}</span>
              </div>
              <span className="text-gray-600">
                ({doctor.reviews.toLocaleString()} reviews)
              </span>
              <div className="flex items-center space-x-1 text-gray-600">
                <FaUserFriends />
                <span>{doctor.patientStories} success stories</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <FaUserMd className="text-blue-600" />
                  <span className="text-sm text-gray-700">Experience</span>
                </div>
                <div className="text-xl font-bold text-gray-900 mt-1">{doctor.experience} years</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <FaClock className="text-green-600" />
                  <span className="text-sm text-gray-700">Response</span>
                </div>
                <div className="text-xl font-bold text-gray-900 mt-1">{doctor.responseTime}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <GiHeartBeats className="text-purple-600" />
                  <span className="text-sm text-gray-700">Success Rate</span>
                </div>
                <div className="text-xl font-bold text-gray-900 mt-1">{doctor.successRate}</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <FaUserFriends className="text-amber-600" />
                  <span className="text-sm text-gray-700">Satisfaction</span>
                </div>
                <div className="text-xl font-bold text-gray-900 mt-1">{doctor.satisfactionScore}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Recommended - Animated */}
        <div className="relative bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-5 mb-6 border border-teal-100 group">
          <div className="absolute top-3 right-3">
            <FaInfoCircle className="text-teal-500" />
          </div>
          <h4 className="font-bold text-gray-900 mb-3 flex items-center">
            <FaStethoscope className="mr-2 text-teal-600" />
            Why Recommended for You
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {doctor.reasons.map((reason, index) => (
              <div 
                key={index} 
                className="flex items-start space-x-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaCheck className="text-teal-600 text-xs" />
                </div>
                <span className="text-sm text-gray-700">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hospital & Languages */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
              <FaHospital className="text-gray-600" />
              <span className="font-medium">{doctor.hospital}</span>
            </div>
            <div className="flex items-center space-x-2">
              {doctor.languages.slice(0, 2).map((lang, index) => (
                <span key={index} className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full border border-gray-300">
                  {lang}
                </span>
              ))}
              {doctor.languages.length > 2 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  +{doctor.languages.length - 2} more
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {doctor.telemedicine && (
              <div className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                <FaVideo />
                <span>Video Available</span>
              </div>
            )}
            {doctor.emergencyAvailable && (
              <div className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                <FaShieldAlt />
                <span>24/7 Emergency</span>
              </div>
            )}
          </div>
        </div>

        {/* Availability & Pricing */}
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-2">Next Available</div>
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-green-500" />
                <div>
                  <div className="font-bold text-gray-900 text-lg">{doctor.nextAvailable}</div>
                  <div className="text-sm text-green-600">{doctor.nextAvailableDetail}</div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-2">Consultation Fee</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">${doctor.consultationFee}</span>
                <span className="text-gray-500">/consultation</span>
              </div>
              {doctor.videoFee && (
                <div className="text-sm text-gray-600 mt-1">
                  Video: <span className="font-medium">${doctor.videoFee}</span>
                </div>
              )}
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-2">Available Slots Today</div>
              <div className="flex flex-wrap gap-2">
                {doctor.availableSlots.slice(0, 3).map((slot, index) => (
                  <span key={index} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                    {slot}
                  </span>
                ))}
                {doctor.availableSlots.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    +{doctor.availableSlots.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => onBook(doctor)}
            className="flex-1 group relative bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 py-4 rounded-xl font-bold hover:from-teal-700 hover:to-teal-800 transition-all transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center space-x-3"
          >
            <FaCalendarAlt />
            <span>Book Appointment</span>
            <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
          </button>
          
          <div className="flex gap-3">
            {doctor.telemedicine && (
              <button
                onClick={() => handleQuickBook('video')}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center space-x-2"
              >
                <FaVideo />
                <span>Video</span>
              </button>
            )}
            
            <button
              onClick={() => setShowFullProfile(true)}
              className="flex-1 px-6 py-4 border-2 border-teal-600 text-teal-600 rounded-xl font-bold hover:bg-teal-50 transition-all flex items-center justify-center space-x-2"
            >
              <FaEye />
              <span>Profile</span>
            </button>
            
            <button className="px-4 py-4 border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-all">
              <FaShareAlt />
            </button>
          </div>
        </div>
      </div>

      {/* Insurance & Specialties Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Accepts:</span>
            <div className="flex flex-wrap gap-2">
              {doctor.insuranceAccepted?.slice(0, 3).map((insurance, index) => (
                <span key={index} className="px-3 py-1 bg-white text-gray-700 text-xs rounded-full border border-gray-300">
                  {insurance}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <GiMedicines className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {doctor.procedures?.length || 0} procedures
            </span>
          </div>
        </div>
      </div>

      {/* Full Profile Modal */}
      {showFullProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal content would go here */}
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold">Full Doctor Profile</h3>
                <button
                  onClick={() => setShowFullProfile(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
              <p>Full profile details would appear here...</p>
            </div>
          </div>
        </div>
      )}

      {/* Hover Effects */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-teal-400 rounded-2xl pointer-events-none transition-all duration-300"></div>
    </div>
  );
};

DoctorCard.defaultProps = {
  doctor: {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialization: "General Physician & ENT Specialist",
    confidence: 92,
    rating: 4.8,
    reviews: 245,
    experience: 12,
    qualification: "MD in Internal Medicine",
    hospital: "City General Hospital",
    nextAvailable: "Today, 3:00 PM",
    nextAvailableDetail: "in 2 hours",
    languages: ["English", "Spanish", "French"],
    reasons: [
      "Specialized in throat infections with 95% success rate",
      "High patient satisfaction score (96%)",
      "Available for same-day appointments",
      "Expert in respiratory conditions"
    ],
    telemedicine: true,
    emergencyAvailable: true,
    online: true,
    verified: true,
    featured: true,
    responseTime: "15 mins",
    successRate: "94%",
    patientStories: 45,
    satisfactionScore: 96,
    consultationFee: 120,
    videoFee: 100,
    availableSlots: ["3:00 PM", "4:30 PM", "6:00 PM"],
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    contact: "+1 (555) 123-4567",
    insuranceAccepted: ["BlueCross", "Aetna", "Cigna"],
    procedures: ["Throat Examination", "Respiratory Therapy", "General Checkup"]
  }
};

export default DoctorCard;