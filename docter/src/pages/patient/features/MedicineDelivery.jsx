// pages/MedicineDelivery.jsx
import React, { useState } from 'react';
import { 
  FaPills, FaTruck, FaMapMarkerAlt, FaClock, 
  FaCreditCard, FaShieldAlt, FaSearch, FaFilter 
} from 'react-icons/fa';

const MedicineDelivery = () => {
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      medicine: 'Paracetamol 500mg',
      quantity: '10 tablets',
      status: 'ready',
      pharmacy: 'City Pharmacy',
      deliveryTime: '30-45 min',
      price: '$5.99'
    }
  ]);
  
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('123 Main St, City');
  const [deliveryOption, setDeliveryOption] = useState('express');
  
  const pharmacies = [
    { id: 1, name: 'City Pharmacy', distance: '0.5 km', rating: 4.5 },
    { id: 2, name: 'Health Plus', distance: '1.2 km', rating: 4.2 },
    { id: 3, name: 'MediCare', distance: '2.0 km', rating: 4.7 }
  ];
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Medicine Delivery</h1>
        <p className="text-gray-600">Get prescribed medicines delivered to your doorstep</p>
      </div>
      
      {/* Delivery Options */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <FaClock className="text-teal-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Express Delivery</h3>
              <p className="text-sm text-gray-600">30-45 minutes</p>
            </div>
          </div>
          <button
            onClick={() => setDeliveryOption('express')}
            className={`w-full py-2 rounded-lg ${
              deliveryOption === 'express' 
                ? 'bg-teal-600 text-white' 
                : 'border border-teal-600 text-teal-600'
            }`}
          >
            Select
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaTruck className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Standard Delivery</h3>
              <p className="text-sm text-gray-600">2-3 hours</p>
            </div>
          </div>
          <button
            onClick={() => setDeliveryOption('standard')}
            className={`w-full py-2 rounded-lg ${
              deliveryOption === 'standard' 
                ? 'bg-teal-600 text-white' 
                : 'border border-teal-600 text-teal-600'
            }`}
          >
            Select
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaMapMarkerAlt className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Pickup</h3>
              <p className="text-sm text-gray-600">From nearest pharmacy</p>
            </div>
          </div>
          <button
            onClick={() => setDeliveryOption('pickup')}
            className={`w-full py-2 rounded-lg ${
              deliveryOption === 'pickup' 
                ? 'bg-teal-600 text-white' 
                : 'border border-teal-600 text-teal-600'
            }`}
          >
            Select
          </button>
        </div>
      </div>
      
      {/* Prescription Medicines */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Prescriptions</h2>
        
        <div className="space-y-4">
          {prescriptions.map(prescription => (
            <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaPills className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{prescription.medicine}</h4>
                  <p className="text-gray-600">{prescription.quantity}</p>
                  <p className="text-sm text-gray-500">{prescription.pharmacy}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-gray-900">{prescription.price}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    prescription.status === 'ready' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {prescription.status}
                  </span>
                  <button className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700">
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Nearby Pharmacies */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Nearby Pharmacies</h2>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search pharmacies..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {pharmacies.map(pharmacy => (
            <div key={pharmacy.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <FaPills className="text-teal-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{pharmacy.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <FaMapMarkerAlt className="mr-1" />
                      {pharmacy.distance}
                    </span>
                    <span>⭐ {pharmacy.rating}</span>
                    <span className="text-green-600 font-medium">Open Now</span>
                  </div>
                </div>
              </div>
              
              <button className="px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Security & Payment */}
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <FaShieldAlt className="text-2xl" />
            <h3 className="text-lg font-bold">Secure Delivery</h3>
          </div>
          <p className="opacity-90">
            All medicines are sourced from verified pharmacies and delivered in tamper-proof packaging.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <FaCreditCard className="text-2xl" />
            <h3 className="text-lg font-bold">Multiple Payment Options</h3>
          </div>
          <p className="opacity-90">
            Pay via card, UPI, wallet, or cash on delivery. Insurance claims supported.
          </p>
        </div>
      </div>
    </div>
  );
};
export default MedicineDelivery;