// pages/FamilyHealth.jsx
import React, { useState } from 'react';
import { 
  FaUsers, FaUserPlus, FaUserMd, FaFileMedical,
  FaSyringe, FaBaby, FaHeartbeat, FaStethoscope,
  FaCalendarAlt, FaBell, FaShareAlt, FaEdit,
  FaTrash, FaEye, FaLock, FaUnlock, FaUserCheck,
  FaChild, FaUserFriends, FaUserInjured, FaPills,
  FaClipboardCheck, FaChartLine, FaShieldAlt,
  FaPhone // ← IMPORT ADDED
} from 'react-icons/fa';

const FamilyHealth = () => {
  const [familyMembers, setFamilyMembers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      relationship: 'Wife',
      age: 32,
      bloodGroup: 'A+',
      allergies: ['Penicillin', 'Dust'],
      conditions: ['Asthma'],
      lastCheckup: '2024-12-10',
      doctor: 'Dr. Michael Chen',
      avatarColor: 'bg-pink-500'
    },
    {
      id: 2,
      name: 'Emma Johnson',
      relationship: 'Daughter',
      age: 8,
      bloodGroup: 'O+',
      allergies: ['Peanuts'],
      conditions: [],
      lastCheckup: '2024-12-05',
      doctor: 'Dr. Lisa Wang',
      avatarColor: 'bg-purple-500'
    },
    {
      id: 3,
      name: 'Robert Johnson',
      relationship: 'Father',
      age: 68,
      bloodGroup: 'B+',
      allergies: ['Shellfish'],
      conditions: ['Diabetes', 'Hypertension'],
      lastCheckup: '2024-11-28',
      doctor: 'Dr. Sarah Johnson',
      avatarColor: 'bg-blue-500'
    }
  ]);

  const [vaccinations, setVaccinations] = useState([
    { id: 1, member: 'Emma Johnson', vaccine: 'MMR', date: '2024-11-15', nextDue: '2025-11-15', status: 'completed' },
    { id: 2, member: 'Emma Johnson', vaccine: 'HPV', date: '2024-12-01', nextDue: '2025-06-01', status: 'completed' },
    { id: 3, member: 'Emma Johnson', vaccine: 'Flu Shot', date: '2024-10-20', nextDue: '2025-10-20', status: 'completed' },
    { id: 4, member: 'Robert Johnson', vaccine: 'Pneumococcal', date: '2024-09-10', nextDue: '2029-09-10', status: 'completed' },
    { id: 5, member: 'Sarah Johnson', vaccine: 'TDAP', date: '2023-08-15', nextDue: '2028-08-15', status: 'completed' },
    { id: 6, member: 'Emma Johnson', vaccine: 'Chickenpox', date: '', nextDue: '2025-03-01', status: 'pending' }
  ]);

  const [sharedRecords, setSharedRecords] = useState([
    { id: 1, type: 'Blood Test', member: 'All', date: '2024-12-15', sharedBy: 'Alex', access: 'Full' },
    { id: 2, type: 'Prescription', member: 'Sarah Johnson', date: '2024-12-10', sharedBy: 'Sarah', access: 'View' },
    { id: 3, type: 'X-Ray Report', member: 'Robert Johnson', date: '2024-11-28', sharedBy: 'Robert', access: 'Limited' },
    { id: 4, type: 'Vaccination Record', member: 'Emma Johnson', date: '2024-12-01', sharedBy: 'Alex', access: 'Full' }
  ]);

  const [familyDoctors, setFamilyDoctors] = useState([
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'General Physician', assignedTo: ['Alex', 'Sarah'], phone: '+1 (555) 123-4567' },
    { id: 2, name: 'Dr. Michael Chen', specialty: 'Pediatrician', assignedTo: ['Emma'], phone: '+1 (555) 987-6543' },
    { id: 3, name: 'Dr. Lisa Wang', specialty: 'Geriatric Care', assignedTo: ['Robert'], phone: '+1 (555) 456-7890' }
  ]);

  const [elderlyCare, setElderlyCare] = useState({
    medicationReminders: true,
    doctorVisitAlerts: true,
    fallDetection: false,
    dailyCheckIn: true,
    emergencyContacts: ['+1 (555) 111-2222', '+1 (555) 333-4444']
  });

  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: '',
    age: '',
    bloodGroup: '',
    allergies: '',
    conditions: ''
  });

  const addFamilyMember = () => {
    if (!newMember.name || !newMember.relationship) {
      alert('Please fill in required fields');
      return;
    }

    const member = {
      id: familyMembers.length + 1,
      name: newMember.name,
      relationship: newMember.relationship,
      age: parseInt(newMember.age),
      bloodGroup: newMember.bloodGroup,
      allergies: newMember.allergies.split(',').map(a => a.trim()).filter(a => a),
      conditions: newMember.conditions.split(',').map(c => c.trim()).filter(c => c),
      lastCheckup: new Date().toISOString().split('T')[0],
      doctor: 'Not assigned',
      avatarColor: 'bg-green-500'
    };

    setFamilyMembers([...familyMembers, member]);
    setNewMember({ name: '', relationship: '', age: '', bloodGroup: '', allergies: '', conditions: '' });
    setShowAddMember(false);
    alert('Family member added successfully!');
  };

  const removeFamilyMember = (id) => {
    if (window.confirm('Are you sure you want to remove this family member?')) {
      setFamilyMembers(familyMembers.filter(member => member.id !== id));
    }
  };

  const shareRecord = (memberId) => {
    const member = familyMembers.find(m => m.id === memberId);
    alert(`Sharing medical records with ${member?.name}...`);
  };

  const assignDoctor = (memberId, doctorName) => {
    setFamilyMembers(familyMembers.map(member => 
      member.id === memberId ? { ...member, doctor: doctorName } : member
    ));
    alert(`Assigned ${doctorName} to ${familyMembers.find(m => m.id === memberId)?.name}`);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRelationshipIcon = (relationship) => {
    switch(relationship.toLowerCase()) {
      case 'wife': case 'husband': return <FaUserFriends />;
      case 'daughter': case 'son': return <FaChild />;
      case 'father': case 'mother': return <FaUserInjured />;
      default: return <FaUserCheck />;
    }
  };

  const getVaccineStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <FaUsers className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Family Health Management</h1>
              <p className="text-gray-600">Manage health records for your entire family</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700"
          >
            <FaUserPlus />
            <span>Add Family Member</span>
          </button>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Family Member</h2>
                <button onClick={() => setShowAddMember(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                  <select
                    value={newMember.relationship}
                    onChange={(e) => setNewMember({...newMember, relationship: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select relationship</option>
                    <option value="Wife">Wife</option>
                    <option value="Husband">Husband</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Son">Son</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={newMember.age}
                      onChange={(e) => setNewMember({...newMember, age: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                    <select
                      value={newMember.bloodGroup}
                      onChange={(e) => setNewMember({...newMember, bloodGroup: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select blood group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (comma separated)</label>
                  <input
                    type="text"
                    value={newMember.allergies}
                    onChange={(e) => setNewMember({...newMember, allergies: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="e.g., Penicillin, Dust, Peanuts"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
                  <input
                    type="text"
                    value={newMember.conditions}
                    onChange={(e) => setNewMember({...newMember, conditions: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="e.g., Diabetes, Asthma, Hypertension"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addFamilyMember}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Family Members */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <FaUsers className="text-blue-600" />
            <span>Family Members ({familyMembers.length})</span>
          </h2>
          <div className="text-sm text-gray-600">
            Last updated: Today
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {familyMembers.map((member) => (
            <div key={member.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${member.avatarColor} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{member.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{getRelationshipIcon(member.relationship)}</span>
                      <span>{member.relationship} • {member.age} years</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFamilyMember(member.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Remove member"
                >
                  <FaTrash />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Blood Group</span>
                  <span className="font-bold">{member.bloodGroup}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Checkup</span>
                  <span className="font-bold">{member.lastCheckup}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Assigned Doctor</span>
                  <span className="font-medium text-teal-600">{member.doctor}</span>
                </div>
              </div>

              {member.allergies.length > 0 && (
                <div className="mt-4 pt-3 border-t">
                  <div className="text-sm text-gray-600 mb-1">Allergies</div>
                  <div className="flex flex-wrap gap-1">
                    {member.allergies.map((allergy, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t">
                <div className="flex space-x-2">
                  <button
                    onClick={() => shareRecord(member.id)}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <FaShareAlt />
                    <span className="text-sm">Share Records</span>
                  </button>
                  <button
                    onClick={() => assignDoctor(member.id, 'Dr. Sarah Johnson')}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100"
                  >
                    <FaUserMd />
                    <span className="text-sm">Assign Doctor</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vaccination Tracker */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <FaSyringe className="text-green-600" />
              <span>Vaccination Tracker</span>
            </h2>
            <button className="text-sm text-teal-600 hover:text-teal-700">
              <FaCalendarAlt /> Schedule New
            </button>
          </div>

          <div className="space-y-4">
            {vaccinations.map((vaccine) => (
              <div key={vaccine.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    {vaccine.member.includes('Emma') ? <FaBaby className="text-green-600" /> : <FaHeartbeat className="text-green-600" />}
                  </div>
                  <div>
                    <div className="font-bold">{vaccine.vaccine}</div>
                    <div className="text-sm text-gray-600">{vaccine.member}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm ${getVaccineStatusColor(vaccine.status)}`}>
                    {vaccine.status}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {vaccine.date || 'Not taken'} → {vaccine.nextDue}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">Vaccination Coverage</div>
                <div className="text-sm text-gray-600">Family vaccination status</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">85%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>

        {/* Elderly Care Monitoring */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <FaStethoscope className="text-purple-600" />
              <span>Elderly Care Monitoring</span>
            </h2>
            <div className="text-sm text-gray-600">
              For: Robert Johnson (68)
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {[
              { label: 'Medication Reminders', enabled: elderlyCare.medicationReminders, icon: <FaPills /> },
              { label: 'Doctor Visit Alerts', enabled: elderlyCare.doctorVisitAlerts, icon: <FaBell /> },
              { label: 'Fall Detection', enabled: elderlyCare.fallDetection, icon: <FaUserInjured /> },
              { label: 'Daily Check-in Calls', enabled: elderlyCare.dailyCheckIn, icon: <FaClipboardCheck /> }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${item.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={() => {}}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-3">Emergency Contacts</h3>
            <div className="space-y-2">
              {elderlyCare.emergencyContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FaBell className="text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">Emergency Contact {index + 1}</div>
                      <div className="text-red-700">{contact}</div>
                    </div>
                  </div>
                  <button className="text-red-600 hover:text-red-700">
                    <FaEdit />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Shared Medical Records */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <FaFileMedical className="text-blue-600" />
            <span>Shared Medical Records</span>
          </h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            <FaShareAlt />
            <span>Share New Record</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600">Record Type</th>
                <th className="text-left py-3 px-4 text-gray-600">Family Member</th>
                <th className="text-left py-3 px-4 text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-gray-600">Shared By</th>
                <th className="text-left py-3 px-4 text-gray-600">Access Level</th>
                <th className="text-left py-3 px-4 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sharedRecords.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{record.type}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {record.member}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{record.date}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs">
                        {record.sharedBy[0]}
                      </div>
                      <span>{record.sharedBy}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      record.access === 'Full' ? 'bg-green-100 text-green-800' :
                      record.access === 'View' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.access}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                        <FaEye />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Edit Access">
                        {record.access === 'Full' ? <FaLock /> : <FaUnlock />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Family Doctors */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Family Doctors</h2>
            <p className="opacity-90">Assigned healthcare providers for your family</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{familyDoctors.length}</div>
            <div className="text-sm opacity-90">Assigned Doctors</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {familyDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white/20 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
                  <FaUserMd />
                </div>
                <div>
                  <div className="font-bold">{doctor.name}</div>
                  <div className="text-sm opacity-90">{doctor.specialty}</div>
                </div>
              </div>
              <div className="text-sm mb-3">
                <div className="flex items-center space-x-2 mb-1">
                  <FaPhone className="text-sm" />
                  <span>{doctor.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaUserCheck />
                  <span>Assigned to: {doctor.assignedTo.join(', ')}</span>
                </div>
              </div>
              <button className="w-full mt-2 py-2 bg-white/30 hover:bg-white/40 rounded-lg text-sm">
                Book Appointment
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaShieldAlt className="text-xl" />
              <div>
                <div className="font-bold">Family Health Insurance</div>
                <div className="text-sm opacity-90">All members covered under same plan</div>
              </div>
            </div>
            <button className="px-4 py-2 bg-white text-teal-600 rounded-lg font-medium hover:bg-gray-100">
              View Coverage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyHealth;