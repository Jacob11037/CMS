'use client';
import { useEffect, useState } from 'react';
import axiosPrivate from '@/app/utils/axiosPrivate'; // adjust path as needed

export default function CreateLabTestForm() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    test_name: '',
    prescribed_by: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch patients and doctors
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [patientRes, doctorRes] = await Promise.all([
          axiosPrivate.get('/patients/'), // adjust endpoint
          axiosPrivate.get('/doctors/'),  // adjust endpoint
        ]);
        setPatients(patientRes.data);
        setDoctors(doctorRes.data);
      } catch (err) {
        console.error('Error fetching options:', err);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const response = await axiosPrivate.post('/labtechnician/labtests/', formData);
      setSuccess('Lab test created successfully!');
      setFormData({ patient: '', doctor: '', test_name: '', prescribed_by: '' });
    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message);
      setError(JSON.stringify(err.response?.data || 'Something went wrong'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-light">
      <h4 className="mb-3">Add New Lab Test</h4>

      <div className="mb-3">
        <label className="form-label">Patient</label>
        <select
          name="patient"
          className="form-select"
          value={formData.patient}
          onChange={handleChange}
          required
        >
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Doctor</label>
        <select
          name="doctor"
          className="form-select"
          value={formData.doctor}
          onChange={handleChange}
          required
        >
          <option value="">Select doctor</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Test Name</label>
        <input
          type="text"
          name="test_name"
          className="form-control"
          value={formData.test_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Prescribed By</label>
        <input
          type="text"
          name="prescribed_by"
          className="form-control"
          value={formData.prescribed_by}
          onChange={handleChange}
          required
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <button type="submit" className="btn btn-primary">Create Lab Test</button>
    </form>
  );
}
