'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import axiosPrivate from '../../../../../../utils/axiosPrivate';
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';
import { toast } from 'react-toastify';

function UpdateAppointmentPage({ params }) {
  const { appointmentid } = use(params);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated === null) return;

    if (!isAuthenticated) {
      router.push('/pages/login');
      return;
    }

    const fetchAppointmentDetails = async () => {
      try {
        const response = await axiosPrivate.get(`/appointments/${appointmentid}/`);
        setAppointment(response.data);
        setStatus(response.data.status);
      } catch (error) {
        setError('Failed to fetch appointment details');
        toast.error('Failed to fetch appointment details');
      }
    };

    fetchAppointmentDetails();
  }, [isAuthenticated, router, appointmentid]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosPrivate.patch(`/appointments/${appointmentid}/`, {
        status: status,
      });
      toast.success('Appointment updated successfully!');
      router.push('/pages/receptionist/view-appointments');
    } catch (error) {
      setError('Failed to update appointment');
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    }
  };

  const handleReschedule = async () => {
    try {
      // First cancel the current appointment
      await axiosPrivate.patch(`/appointments/${appointmentid}/`, {
        status: 'Cancelled'
      });
      
      // Then redirect to create appointment page with query params
      const queryParams = new URLSearchParams({
        patient: appointment.patient,
        doctor: appointment.doctor,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        reschedule: 'true'
      }).toString();
      
      router.push(`/pages/receptionist/appointment?${queryParams}`);
      
      toast.info('Appointment marked as cancelled. Please reschedule.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reschedule appointment');
    }
  };

  if (isAuthenticated === null) {
    return <p className="loading">Loading...</p>;
  }

  return (
    <div className="container">
      <h1 className="header">Update Appointment</h1>
      {error && <p className="error">{error}</p>}
      {appointment ? (
        <form onSubmit={handleUpdateSubmit}>
          <div className="details">
            <p><strong>Patient:</strong> {appointment.patient_name}</p>
            <p><strong>Doctor:</strong> {appointment.doctor_name}</p>
            <p><strong>Start Time:</strong> {new Date(appointment.start_time).toLocaleString()}</p>
            <p><strong>End Time:</strong> {new Date(appointment.end_time).toLocaleString()}</p>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="button-group">
            <button type="submit" className="button">Update Status</button>
            <button 
              type="button" 
              className="button secondary"
              onClick={handleReschedule}
            >
              Reschedule Appointment
            </button>
          </div>
        </form>
      ) : (
        <p>Loading appointment details...</p>
      )}
    </div>
  );
}

export default withReceptionistAuth(UpdateAppointmentPage);