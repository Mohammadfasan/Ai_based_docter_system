import React, { useState } from 'react';
import { FaFileMedical, FaCalendar, FaUserMd, FaDownload, FaEye, FaPrint } from 'react-icons/fa';

const MedicalRecords = () => {
  const [records, setRecords] = useState([
    {
      id: 1,
      date: '2024-11-15',
      doctor: 'Dr. Sarah Johnson',
      type: 'General Checkup',
      diagnosis: 'Common Cold',
      prescription: 'Rest, fluids, over-the-counter cold medication',
      notes: 'Patient presented with fever and sore throat. Vital signs normal.',
      fileUrl: '#'
    },
    {
      id: 2,
      date: '2024-10-20',
      doctor: 'Dr. Michael Chen',
      type: 'Follow-up Visit',
      diagnosis: 'Bronchitis',
      prescription: 'Antibiotics, cough syrup, steam inhalation',
      notes: 'Chest X-ray clear. Advised to avoid smoking.',
      fileUrl: '#'
    },
    {
      id: 3,
      date: '2024-09-05',
      doctor: 'Dr. Emily Rodriguez',
      type: 'Annual Physical',
      diagnosis: 'Healthy',
      prescription: 'None',
      notes: 'All blood work within normal ranges. Cholesterol slightly elevated.',
      fileUrl: '#'
    }
  ]);

  const [selectedRecord, setSelectedRecord] = useState(null);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal-100 rounded-xl">
            <FaFileMedical className="text-teal-600 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Medical Records</h2>
            <p className="text-gray-600">Your complete medical history</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
          Upload Record
        </button>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {records.map((record) => (
          <div
            key={record.id}
            className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-900">{record.type}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center">
                    <FaCalendar className="mr-2" />
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <FaUserMd className="mr-2" />
                    {record.doctor}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedRecord(record)}
                  className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"
                  title="View Details"
                >
                  <FaEye />
                </button>
                <button
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Download"
                >
                  <FaDownload />
                </button>
                <button
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Print"
                >
                  <FaPrint />
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Diagnosis:</span>
                <p className="text-gray-900">{record.diagnosis}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Prescription:</span>
                <p className="text-gray-900">{record.prescription}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Records Message */}
      {records.length === 0 && (
        <div className="text-center py-12">
          <FaFileMedical className="text-4xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Medical Records</h3>
          <p className="text-gray-500">Your medical records will appear here after consultations</p>
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Record Details</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1">{new Date(selectedRecord.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Doctor</label>
                    <p className="mt-1">{selectedRecord.doctor}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Visit Type</label>
                  <p className="mt-1">{selectedRecord.type}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedRecord.diagnosis}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Prescription</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedRecord.prescription}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Doctor's Notes</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedRecord.notes}</p>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <FaDownload className="inline mr-2" />
                    Download PDF
                  </button>
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                    <FaPrint className="inline mr-2" />
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;