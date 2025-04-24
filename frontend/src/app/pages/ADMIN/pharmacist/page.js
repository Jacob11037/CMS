'use client';
import React, { useEffect, useState } from 'react';
import axiosPrivate from '../../../../../utils/axiosPrivate';

const Pharmacist = () => {
  const [pharmacists, setPharmacists] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    qualification: '',
    salary: '',
    date_of_birth: '',
    user: '' // Assuming user is already created and you assign user ID
  });

  const API_URL = 'pharmacists/';

  useEffect(() => {
    fetchPharmacists();
  }, []);

  const fetchPharmacists = async () => {
    try {
      const response = await axiosPrivate.get(API_URL);
      setPharmacists(response.data);
    } catch (error) {
      console.error('Error fetching pharmacists:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosPrivate.post(API_URL, formData);
      fetchPharmacists();
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        qualification: '',
        salary: '',
        date_of_birth: '',
        user: ''
      });
    } catch (error) {
      console.error('Error adding pharmacist:', error.response?.data || error.message);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Pharmacist Management</h2>

      <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 shadow rounded">
        {[
          { name: 'first_name', label: 'First Name', type: 'text' },
          { name: 'last_name', label: 'Last Name', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'phone', label: 'Phone', type: 'text' },
          { name: 'address', label: 'Address', type: 'text' },
          { name: 'qualification', label: 'Qualification', type: 'text' },
          { name: 'salary', label: 'Salary', type: 'number' },
          { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
          { name: 'user', label: 'User ID', type: 'number' }
        ].map(({ name, label, type }) => (
          <div key={name} className="mb-2">
            <label className="block text-sm font-semibold capitalize">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        ))}

        <button type="submit" className="mt-3 bg-blue-500 text-white px-4 py-2 rounded">
          Add Pharmacist
        </button>
      </form>

      <div>
        <h3 className="text-xl font-semibold mb-2">Pharmacists List</h3>
        <ul className="divide-y divide-gray-300 bg-white rounded shadow">
          {pharmacists.map((pharmacist) => (
            <li key={pharmacist.id} className="p-3">
              <p><strong>Name:</strong> {pharmacist.first_name} {pharmacist.last_name}</p>
              <p><strong>Email:</strong> {pharmacist.email}</p>
              <p><strong>Phone:</strong> {pharmacist.phone}</p>
              <p><strong>Qualification:</strong> {pharmacist.qualification}</p>
              <p><strong>Salary:</strong> ₹{pharmacist.salary}</p>
              <p><strong>Date of Birth:</strong> {pharmacist.date_of_birth}</p>
              <p><strong>Joining Date:</strong> {pharmacist.joining_date}</p>
              <p><strong>Staff ID:</strong> {pharmacist.staff_id}</p>
              <p><strong>User ID:</strong> {pharmacist.user}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Pharmacist;
