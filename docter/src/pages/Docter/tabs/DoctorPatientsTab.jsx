import React from 'react';
import { FaUserFriends, FaPhone, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';

const DoctorPatientsTab = () => {
  const recentPatients = [
    { id: 1, name: 'Robert Brown', age: 45, patientId: 'PAT101', lastVisit: '2 days ago', condition: 'Diabetes', nextAppointment: 'Next week' },
    { id: 2, name: 'Lisa Garcia', age: 38, patientId: 'PAT102', lastVisit: '1 week ago', condition: 'Hypertension', nextAppointment: 'Tomorrow' },
    { id: 3, name: 'David Lee', age: 52, patientId: 'PAT103', lastVisit: '3 days ago', condition: 'Asthma', nextAppointment: 'In 2 weeks' },
    { id: 4, name: 'Maria Rodriguez', age: 67, patientId: 'PAT104', lastVisit: '2 weeks ago', condition: 'Arthritis', nextAppointment: 'Today' },
    { id: 5, name: 'James Wilson', age: 29, patientId: 'PAT105', lastVisit: '5 days ago', condition: 'Migraine', nextAppointment: 'Next month' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">My Patients</h2>
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex space-x-4">
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>All Patients</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Recent</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            Add New Patient
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 font-medium text-gray-700">Patient Name</th>
              <th className="text-left py-3 font-medium text-gray-700">Patient ID</th>
              <th className="text-left py-3 font-medium text-gray-700">Last Visit</th>
              <th className="text-left py-3 font-medium text-gray-700">Primary Condition</th>
              <th className="text-left py-3 font-medium text-gray-700">Next Appointment</th>
              <th className="text-left py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentPatients.map((patient) => (
              <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <FaUserFriends className="text-teal-600" />
                    </div>
                    <div>
                      <span className="font-medium">{patient.name}</span>
                      <div className="text-sm text-gray-500">Age: {patient.age}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                    {patient.patientId}
                  </span>
                </td>
                <td className="py-4 text-gray-600">{patient.lastVisit}</td>
                <td className="py-4">
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                    {patient.condition}
                  </span>
                </td>
                <td className="py-4">
                  <div className="text-gray-900">{patient.nextAppointment}</div>
                  <div className="text-sm text-gray-500">Follow-up required</div>
                </td>
                <td className="py-4">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700">
                      View
                    </button>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      Message
                    </button>
                    <button className="px-3 py-1 text-sm border border-teal-600 text-teal-600 rounded hover:bg-teal-50">
                      Book
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">Showing 5 of 245 patients</div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded">Previous</button>
          <button className="px-3 py-1 bg-teal-600 text-white rounded">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded">2</button>
          <button className="px-3 py-1 border border-gray-300 rounded">3</button>
          <button className="px-3 py-1 border border-gray-300 rounded">Next</button>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientsTab;