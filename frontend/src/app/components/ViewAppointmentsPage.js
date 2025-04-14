'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import axiosPrivate from '../../../utils/axiosPrivate';
import { formatDateTime, formatTimeOnly } from '../../../utils/dateFormatter';
import "../styles/ViewAppointmentsPage.css";

export default function ViewAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status:'',
    doctor_name:'',
    patient_name:'',
    start_time:''
  });
  const [showFilters, setShowFilters] = useState(false)

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

        const params = {
          page: currentPage,
          status: filters.status,
          patient_name: filters.patient_name,
          doctor_name: filters.doctor_name,
          start_time: filters.start_time,
        };
        console.log(params)
        const response = await axiosPrivate.get('/appointments/', {params});
        console.log(response)

        setAppointments(response.data.results);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        setError('An error occurred while fetching appointments');
      }
    };

    fetchAppointments();
  }, [isAuthenticated, router, filters, currentPage]);

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
      <button 
        className="button toggle-filters-btn" 
        onClick={() => setShowFilters(!showFilters)}
      >
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>
      {showFilters &&
            <div className="filters-panel">
            <input 
              type="text" 
              placeholder="Search Patient" 
              value={filters.patient_name}
              onChange={(e) => setFilters({ ...filters, patient_name: e.target.value })}
            />
            <input 
              type="text" 
              placeholder="Search Doctor" 
              value={filters.doctor_name}
              onChange={(e) => setFilters({ ...filters, doctor_name: e.target.value })}
            />
            <input 
              type="date"
              value={filters.start_time}
              onChange={(e) => setFilters({ ...filters, start_time: e.target.value })}
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          }

      {appointments.length > 0 ? (
        <div className="appointmentsContainer">
          <ul className="appointmentsList">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="appointmentItem">
                <p className="appointmentText">
                  <strong>{appointment.patient_name}</strong> - 
                  Doctor: {appointment.doctor_name} <br />
                  {formatDateTime(appointment.start_time)} to {formatTimeOnly(appointment.end_time)} - 
                  Status: {appointment.status}
                </p>
                <div className="buttonGroup">
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
                </div>
              </li>
            ))}
          </ul>
          <div className="pagination">
          <button 
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        </div>
      ) : (
        <p>No appointments available.</p>
      )}
    </div>
  );
}
