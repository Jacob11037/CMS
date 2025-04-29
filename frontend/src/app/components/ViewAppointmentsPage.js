'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; // Assuming path is correct
import axiosPrivate from '../../../utils/axiosPrivate';
import { formatDateTime, formatTimeOnly } from '../../../utils/dateFormatter';
import styles from '../styles/receptionist/viewAppointments.module.css'; // Import the CSS module
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion

// Ensure Bootstrap CSS is imported globally, e.g., in your layout.js or _app.js
// import 'bootstrap/dist/css/bootstrap.min.css';
// Ensure Bootstrap Icons are set up if you want to use them
// import 'bootstrap-icons/font/bootstrap-icons.css';


export default function ViewAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    doctor_name: '',
    patient_name: '',
    start_time: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);


  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated === null) {
      return;
    }
    if (!isAuthenticated) {
      router.push('/pages/login');
      return;
    }

    const fetchAppointments = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = {
          page: currentPage,
          status: filters.status || undefined,
          patient_name: filters.patient_name || undefined,
          doctor_name: filters.doctor_name || undefined,
          start_time: filters.start_time || undefined,
        };
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

        const response = await axiosPrivate.get('/appointments/', { params });

        setAppointments(response.data.results || []);
        setTotalPages(response.data.total_pages || 1);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        if (error.response?.status === 404 && currentPage > 1) {
            setCurrentPage(1);
        } else if (error.response?.data) {
             const messages = Object.values(error.response.data).flat().join(' ');
             setError(messages || 'An error occurred while fetching appointments.');
        }
         else {
          setError('An error occurred while fetching appointments. Please try again.');
        }
        setAppointments([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [isAuthenticated, router, currentPage, filters]);


  const handleDeleteAppointment = (appointmentId) => {
    setAppointmentToDelete(appointmentId);
    setShowDeleteModal(true);
  };

  const confirmDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    try {
      await axiosPrivate.delete(`/appointments/${appointmentToDelete}/`);
      setAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== appointmentToDelete)
      );
      // TODO: Add success toast notification
    } catch (error) {
      console.error("Error deleting appointment:", error);
      setError('An error occurred while deleting the appointment.');
      // TODO: Add error toast notification
    } finally {
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
    }
  };
  
  

  // Renamed for clarity - navigates to the create form for rescheduling
  const navigateToReschedule = (appointment) => {
    const queryParams = new URLSearchParams({
        reschedule: 'true',
        patient: appointment.patient,
        doctor: appointment.doctor,
        start_time: appointment.start_time,
        end_time: appointment.end_time // Pass end time too if needed by the form
    }).toString();
    router.push(`/pages/receptionist/appointment?${queryParams}`);
  };

  // *** NEW FUNCTION: Navigates to the dedicated update page ***
  const navigateToUpdate = (appointmentId) => {
    router.push(`/pages/receptionist/update-appointment/${appointmentId}`);
  };


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
        status: '',
        doctor_name: '',
        patient_name: '',
        start_time: '',
    });
    setCurrentPage(1);
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return styles.statusPending;
      case 'Completed': return styles.statusCompleted;
      case 'Cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const filtersVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.4, ease: 'easeInOut' } }
  };


  if (isAuthenticated === null) {
    return <p className={`text-center mt-5 ${styles.loadingText}`}>Loading authentication...</p>;
  }


  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className={styles.header}>View Appointments</h1>

      <div className="d-flex justify-content-end mb-3">
        <button
          className={`btn btn-outline-secondary ${styles.filtersToggle}`}
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          aria-controls="filters-panel"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'} <i className={`bi bi-chevron-${showFilters ? 'up' : 'down'}`}></i>
        </button>
      </div>

       <AnimatePresence>
            {showFilters && (
                <motion.div
                    id="filters-panel"
                    className={`${styles.filtersCard} mb-4`}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={filtersVariants}
                >
                    <h5>Filter Appointments</h5>
                     <div className="row g-3">
                        <div className="col-md-6 col-lg-3">
                            <input
                            type="text"
                            name="patient_name"
                            className={`form-control ${styles.formControl}`}
                            placeholder="Search Patient Name"
                            value={filters.patient_name}
                            onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <input
                            type="text"
                            name="doctor_name"
                             className={`form-control ${styles.formControl}`}
                            placeholder="Search Doctor Name"
                            value={filters.doctor_name}
                            onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <input
                            type="date"
                            name="start_time"
                            className={`form-control ${styles.formControl}`}
                            value={filters.start_time}
                            onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <select
                            name="status"
                            className={`form-select ${styles.formSelect}`}
                            value={filters.status}
                            onChange={handleFilterChange}
                            >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                     <div className="mt-3 text-end">
                        <button className="btn btn-outline-secondary btn-sm" onClick={resetFilters}>
                            Reset Filters
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>


      {isLoading ? (
        <p className={styles.loadingText}>Loading appointments...</p>
      ) : error ? (
        <div className={`alert alert-danger ${styles.errorText}`} role="alert">
          {error}
        </div>
      ) : appointments.length > 0 ? (
        <motion.div className={styles.appointmentsCard} layout>
           <AnimatePresence>
            {appointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                className={styles.appointmentItem}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                layout
              >
                <div className={styles.appointmentDetails}>
                  <p><strong>Patient:</strong> {appointment.patient_name}</p>
                  <p><strong>Doctor:</strong> {appointment.doctor_name}</p>
                  <p>
                    <strong>Time:</strong> {formatDateTime(appointment.start_time)} to {formatTimeOnly(appointment.end_time)}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`${styles.statusBadge} ${getStatusClass(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </p>
                </div>
                <div className={styles.buttonGroup}>
                  {/* *** UPDATE BUTTON ADDED *** */}
                  <button
                    className={`btn btn-sm btn-primary ${styles.actionButton}`} // Primary color for update
                    onClick={() => navigateToUpdate(appointment.id)}
                    title="Update Appointment Details"
                  >
                    <i className="bi bi-pencil-square"></i> Update {/* Pencil icon */}
                  </button>
                   {/* --- End Update Button --- */}

                  <button
                    className={`btn btn-sm btn-info text-white ${styles.actionButton}`}
                    onClick={() => navigateToReschedule(appointment)}
                    title="Reschedule Appointment Time/Date"
                  >
                   <i className="bi bi-calendar-event"></i> Reschedule
                  </button>

                  <button
                    className={`btn btn-sm btn-danger ${styles.actionButton}`}
                    onClick={() => handleDeleteAppointment(appointment.id)}
                    title="Delete Appointment"
                  >
                    <i className="bi bi-trash"></i> Delete
                  </button>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Page navigation" className={styles.paginationContainer}>
              <ul className="pagination pagination-sm">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                 <li className="page-item disabled">
                    <span className="page-link">Page {currentPage} of {totalPages}</span>
                 </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </motion.div>
      ) : (
         <div className={`${styles.appointmentsCard} text-center p-4`}>
            <p className={styles.noAppointmentsText}>No appointments found matching your criteria.</p>
        </div>
      )}
      {/* Delete Confirmation Modal */}
<div className="modal fade show" style={{ display: showDeleteModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
  <div className="modal-dialog modal-dialog-centered" role="document">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Confirm Deletion</h5>
        <button
          type="button"
          className="btn-close"
          onClick={() => setShowDeleteModal(false)}
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body">
        <p>Are you sure you want to delete this appointment?</p>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowDeleteModal(false)}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={confirmDeleteAppointment}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</div>

{/* Modal backdrop */}
{showDeleteModal && <div className="modal-backdrop fade show"></div>}

    </motion.div>
  );
}