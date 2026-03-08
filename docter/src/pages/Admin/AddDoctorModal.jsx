import React from 'react';
import { FaUserMd, FaCamera, FaTimes, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const AddDoctorModal = React.memo(({
  show,
  onClose,
  onSubmit,
  formState,
  setFormState,
  modalState,
  setModalState,
  specializations,
  languageOptions,
  locations,
  fileInputRef,
  handleInputChange,
  handleLanguageChange,
  handleImageSelect
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Add New Doctor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Form fields */}
            <div className="space-y-4">
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center overflow-hidden">
                      {formState.imagePreview ? (
                        <img src={formState.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FaUserMd className="text-white text-3xl" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-50"
                    >
                      <FaCamera className="text-teal-600" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                  {modalState.uploadProgress > 0 && modalState.uploadProgress < 100 && (
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-teal-600 h-2 rounded-full"
                          style={{ width: `${modalState.uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Uploading: {modalState.uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formState.newDoctor.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    formState.formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Dr. John Doe"
                />
                {formState.formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formState.formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formState.newDoctor.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    formState.formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="doctor@example.com"
                />
                {formState.formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formState.formErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formState.newDoctor.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    formState.formErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+94 77 123 4567"
                />
                {formState.formErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{formState.formErrors.phone}</p>
                )}
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <select
                  name="specialization"
                  value={formState.newDoctor.specialization}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    formState.formErrors.specialization ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {formState.formErrors.specialization && (
                  <p className="text-red-500 text-xs mt-1">{formState.formErrors.specialization}</p>
                )}
              </div>

              {/* Qualifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualifications <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="qualifications"
                  value={formState.newDoctor.qualifications}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    formState.formErrors.qualifications ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="MBBS, MD, FRCP"
                />
                {formState.formErrors.qualifications && (
                  <p className="text-red-500 text-xs mt-1">{formState.formErrors.qualifications}</p>
                )}
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formState.newDoctor.experience}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    formState.formErrors.experience ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="10+ Years"
                />
                {formState.formErrors.experience && (
                  <p className="text-red-500 text-xs mt-1">{formState.formErrors.experience}</p>
                )}
              </div>

              {/* License Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="license"
                  value={formState.newDoctor.license}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    formState.formErrors.license ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="SLMC-12345"
                />
                {formState.formErrors.license && (
                  <p className="text-red-500 text-xs mt-1">{formState.formErrors.license}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Hospital */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital/Clinic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hospital"
                  value={formState.newDoctor.hospital}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    formState.formErrors.hospital ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="City Hospital"
                />
                {formState.formErrors.hospital && (
                  <p className="text-red-500 text-xs mt-1">{formState.formErrors.hospital}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  name="location"
                  value={formState.newDoctor.location}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    formState.formErrors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                {formState.formErrors.location && (
                  <p className="text-red-500 text-xs mt-1">{formState.formErrors.location}</p>
                )}
              </div>

              {/* Consultation Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fees"
                  value={formState.newDoctor.fees}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    formState.formErrors.fees ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="LKR 2,500"
                />
                {formState.formErrors.fees && (
                  <p className="text-red-500 text-xs mt-1">{formState.formErrors.fees}</p>
                )}
              </div>

              {/* Consultation Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Time
                </label>
                <input
                  type="text"
                  name="consultationTime"
                  value={formState.newDoctor.consultationTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="30 mins"
                />
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages
                </label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map(lang => (
                    <label key={lang} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formState.newDoctor.languages.includes(lang)}
                        onChange={() => handleLanguageChange(lang)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="ml-1 text-sm text-gray-700">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <div className="space-y-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isVideoAvailable"
                      checked={formState.newDoctor.isVideoAvailable}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Video Consultation Available</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isVerified"
                      checked={formState.newDoctor.isVerified}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Verified Doctor</span>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formState.newDoctor.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="busy">Busy</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Rating
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formState.newDoctor.rating}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* AI Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Summary / Description
                </label>
                <textarea
                  name="aiSummary"
                  value={formState.newDoctor.aiSummary}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter doctor description or AI summary..."
                />
              </div>

              {/* Default Password Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  Default password will be: <strong>doctor123</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={modalState.modalLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalState.modalLoading}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {modalState.modalLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  <span>Create Doctor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

AddDoctorModal.displayName = 'AddDoctorModal';

export default AddDoctorModal;