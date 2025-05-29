'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; // Assuming path is correct
import axiosPrivate from '../../../utils/axiosPrivate';
import styles from '../styles/receptionist/viewAppointments.module.css'; // Import the CSS module
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion
import { formatDateTime, formatTimeOnly } from '@/utils/dateFormatter';

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
    return (
      <>
        <link 
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" 
          rel="stylesheet" 
        />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css" 
        />
        <div className={styles.container}>
          <p className={styles.loadingText}>Loading authentication...</p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Bootstrap CSS and Icons */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css" 
      />
      
      <motion.div
        className={styles.container}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <i className="bi bi-calendar-check me-3"></i>
          View Appointments
        </motion.h1>

        <motion.div 
          className="d-flex justify-content-end mb-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button
            className={styles.filtersToggle}
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="filters-panel"
          >
            <i className={`bi bi-funnel me-2`}></i>
            {showFilters ? 'Hide Filters' : 'Show Filters'} 
            <i className={`bi bi-chevron-${showFilters ? 'up' : 'down'} ms-2`}></i>
          </button>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              id="filters-panel"
              className={styles.filtersCard}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={filtersVariants}
            >
              <h5>
                <i className="bi bi-search me-2"></i>
                Filter Appointments
              </h5>
              <div className="row g-3">
                <div className="col-md-6 col-lg-3">
                  <label className="form-label text-muted small fw-semibold">Patient Name</label>
                  <div className="position-relative">
                    <input
                      type="text"
                      name="patient_name"
                      className={styles.formControl}
                      placeholder="Search Patient Name"
                      value={filters.patient_name}
                      onChange={handleFilterChange}
                    />
                    <i className="bi bi-person position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <label className="form-label text-muted small fw-semibold">Doctor Name</label>
                  <div className="position-relative">
                    <input
                      type="text"
                      name="doctor_name"
                      className={styles.formControl}
                      placeholder="Search Doctor Name"
                      value={filters.doctor_name}
                      onChange={handleFilterChange}
                    />
                    <i className="bi bi-person-badge position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <label className="form-label text-muted small fw-semibold">Date</label>
                  <div className="position-relative">
                    <input
                      type="date"
                      name="start_time"
                      className={styles.formControl}
                      value={filters.start_time}
                      onChange={handleFilterChange}
                    />
                    <i className="bi bi-calendar3 position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <label className="form-label text-muted small fw-semibold">Status</label>
                  <div className="position-relative">
                    <select
                      name="status"
                      className={styles.formSelect}
                      value={filters.status}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <i className="bi bi-flag position-absolute top-50 end-0 translate-middle-y me-3 text-muted" style={{pointerEvents: 'none'}}></i>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-end">
                <button 
                  className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                  onClick={resetFilters}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className={styles.loadingText}>Loading appointments...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            className={`alert ${styles.errorText}`} 
            role="alert"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </motion.div>
        ) : appointments.length > 0 ? (
          <motion.div 
            className={styles.appointmentsCard} 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <AnimatePresence mode="popLayout">
              {appointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  className={styles.appointmentItem}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className={styles.appointmentDetails}>
                    <p>
                      <i className="bi bi-person-fill me-2 text-primary"></i>
                      <strong>Patient:</strong> {appointment.patient_name}
                    </p>
                    <p>
                      <i className="bi bi-person-badge-fill me-2 text-info"></i>
                      <strong>Doctor:</strong> {appointment.doctor_name}
                    </p>
                    <p>
                      <i className="bi bi-clock-fill me-2 text-success"></i>
                      <strong>Time:</strong> {formatDateTime(appointment.start_time)} to {formatTimeOnly(appointment.end_time)}
                    </p>
                    <p>
                      <i className="bi bi-flag-fill me-2 text-warning"></i>
                      <strong>Status:</strong>{' '}
                      <span className={`${styles.statusBadge} ${getStatusClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </p>
                  </div>
                  <div className={styles.buttonGroup}>
                    <motion.button
                      className={`btn btn-sm btn-primary ${styles.actionButton}`}
                      onClick={() => navigateToUpdate(appointment.id)}
                      title="Update Appointment Details"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="bi bi-pencil-square"></i> Update
                    </motion.button>

                    <motion.button
                      className={`btn btn-sm btn-info text-white ${styles.actionButton}`}
                      onClick={() => navigateToReschedule(appointment)}
                      title="Reschedule Appointment Time/Date"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="bi bi-calendar-event"></i> Reschedule
                    </motion.button>

                    <motion.button
                      className={`btn btn-sm btn-danger ${styles.actionButton}`}
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      title="Delete Appointment"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.nav 
                aria-label="Page navigation" 
                className={styles.paginationContainer}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <ul className="pagination pagination-sm">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <i className="bi bi-chevron-left"></i> Previous
                    </button>
                  </li>
                  <li className="page-item disabled">
                    <span className="page-link">
                      <i className="bi bi-file-text me-1"></i>
                      Page {currentPage} of {totalPages}
                    </span>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </motion.nav>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className={`${styles.appointmentsCard} text-center p-4`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <i className="bi bi-calendar-x display-1 text-muted mb-3"></i>
            <p className={styles.noAppointmentsText}>No appointments found matching your criteria.</p>
            <p className="text-muted small">Try adjusting your filters or check back later.</p>
          </motion.div>
        )}

        {/* Enhanced Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                  <motion.div 
                    className="modal-content"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <div className="modal-header">
                      <h5 className="modal-title">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Confirm Deletion
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowDeleteModal(false)}
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-trash3 text-danger fs-1 me-3"></i>
                        <div>
                          <p className="mb-1 fw-semibold">Are you sure you want to delete this appointment?</p>
                          <p className="text-muted small mb-0">This action cannot be undone.</p>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowDeleteModal(false)}
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={confirmDeleteAppointment}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
              <div className="modal-backdrop fade show"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}