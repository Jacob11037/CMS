'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import axiosPrivate from '../../../../../../utils/axiosPrivate';

export default function UpdateAppointmentPage({ params }) {
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated === null) return; // Wait until authentication is verified

    if (!isAuthenticated) {
      router.push('/pages/login'); // Redirect to login if not authenticated
      return;
    }

    const fetchAppointmentDetails = async () => {
      try {
        const response = await axiosPrivate.get(`/appointments/${params.appointmentid}/`);
        setAppointment(response.data);
        setStatus(response.data.status);
      } catch (error) {
        setError('An error occurred while fetching the appointment details');
      }
    };

    fetchAppointmentDetails();
  }, [isAuthenticated, router, params.appointmentid]);

  // Function to update appointment status
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    
  try {
    await axiosPrivate.put(`/appointments/${appointmentid}/`, {
      doctor: appointment.doctor,  
      patient: appointment.patient, 
      start_time: appointment.start_time,  
      end_time: appointment.end_time,  
      status: status,  
    });

    router.push('/receptionist/appointments');
  } catch (error) {
    setError('An error occurred while updating the appointment');
  }
};

  if (isAuthenticated === null) {
    return <p className="loading">Loading...</p>;
  }

  return (
    <div className="container">
      <h1 className="header">Update Appointment <b>WORK IN PROGRESS</b> </h1>
      {error && <p className="error">{error}</p>}
      
      {appointment ? (
        <form onSubmit={handleUpdateSubmit}>
          {/* Display Full Appointment Details */}
          <div className="details">
            <p><strong>Patient:</strong> {appointment.patient_name}</p>
            <p><strong>Doctor:</strong> {appointment.doctor_name}</p>
            <p><strong>Start Time:</strong> {appointment.start_time}</p>
            <p><strong>End Time:</strong> {appointment.end_time}</p>
          </div>

          {/* Status Update Section */}
          <div>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <button type="submit" className="button">Update Appointment</button>
        </form>
      ) : (
        <p>Loading appointment details...</p>
      )}
    </div>
  );
}
