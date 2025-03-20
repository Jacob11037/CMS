'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import axiosPrivate from '../../../utils/axiosPrivate';
import "../styles/ViewAppointmentsPage.css";

export default function ViewAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth(); // Get authentication state

  // Check if isAuthenticated is not null before proceeding
  useEffect(() => {
    if (isAuthenticated === null) {
      return; // Do not proceed until isAuthenticated is determined
    }

    if (!isAuthenticated) {
      router.push('/pages/login'); // Redirect to login if not authenticated
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await axiosPrivate.get('/appointments/');
        setAppointments(response.data);
      } catch (error) {
        setError('An error occurred while fetching appointments');
      }
    };

    fetchAppointments();
  }, [isAuthenticated, router]);

  // Function to delete an appointment
  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await axiosPrivate.delete(`/appointments/${appointmentId}/`);
      setAppointments(appointments.filter((appointment) => appointment.id !== appointmentId));
    } catch (error) {
      setError('An error occurred while deleting the appointment');
    }
  };

  // Function to update an appointment (redirect to a form)
  const handleUpdateAppointment = (appointmentId) => {
    router.push(`/pages/receptionist/update-appointment/${appointmentId}`);
  };

  if (isAuthenticated === null) {
    return <p className="loading">Loading...</p>; // Show loading while checking authentication
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="container">
      <h1 className="header">View Appointments</h1>
      {appointments.length > 0 ? (
        <div className="appointmentsContainer">
          <ul className="appointmentsList">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="appointmentItem">
                <p className="appointmentText">
                  <strong>{appointment.patient_name}</strong> - {appointment.start_time} - {appointment.status}
                </p>
                <button 
                  className="button updateButton" 
                  onClick={() => handleUpdateAppointment(appointment.id)}>
                  Update
                </button>
                <button 
                  className="button deleteButton" 
                  onClick={() => handleDeleteAppointment(appointment.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No appointments available.</p>
      )}
    </div>
  );
}
