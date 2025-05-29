'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Import useParams
import { useAuth } from '../../../../context/AuthContext'; // Adjust path if needed
import axiosPrivate from '../../../../../../utils/axiosPrivate'; // Adjust path if needed
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth'; // Adjust path if needed
import { toast } from 'react-toastify';
import styles from '../../../../styles/receptionist/updateAppointment.module.css'; // Import the CSS module
import { motion } from 'framer-motion';
import { formatDateTime } from '@/utils/dateFormatter';

function UpdateAppointmentPage() { // No need to destructure params here if using useParams
  const { appointmentid } = useParams(); 
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state
  const [status, setStatus] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Ensure appointmentid is available before proceeding
    if (!appointmentid) {
        setIsLoading(false); // Stop loading if ID is missing
        setError('Appointment ID is missing from URL.');
        toast.error('Appointment ID is missing.');
        return;
    }

    if (isAuthenticated === null) return; // Wait for auth check

    if (!isAuthenticated) {
      router.push('/pages/login');
      return;
    }

    const fetchAppointmentDetails = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axiosPrivate.get(`/appointments/${appointmentid}/`);
        setAppointment(response.data);
        setStatus(response.data.status);
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        setError('Failed to fetch appointment details. It might not exist or there was a network issue.');
        toast.error('Failed to fetch appointment details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [isAuthenticated, router, appointmentid]); // Dependency array

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(''); // Clear previous errors
    try {
      await axiosPrivate.patch(`/appointments/${appointmentid}/`, {
        status: status,
      });
      toast.success('Appointment status updated successfully!');
      router.push('/pages/receptionist/view-appointments'); // Redirect after success
    } catch (updateError) {
      console.error("Update error:", updateError);
      const errorMessage = updateError.response?.data?.detail || // Check for DRF detail field
                             updateError.response?.data?.message ||
                             'Failed to update appointment status.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!appointment) {
      toast.error("Appointment details not loaded yet.");
      return;
    }

    setIsSubmitting(true); // Use submitting state to disable buttons
    try {
      // First cancel the current appointment
      await axiosPrivate.patch(`/appointments/${appointmentid}/`, {
        status: 'Cancelled'
      });

      // Then redirect to create appointment page with query params
      const queryParams = new URLSearchParams({
        patient: appointment.patient, // Send patient ID
        doctor: appointment.doctor,   // Send doctor ID
        reschedule: 'true',
      }).toString();

      router.push(`/pages/receptionist/appointment?${queryParams}`);
      toast.info('Current appointment marked as Cancelled. Please create the rescheduled appointment.');
    } catch (rescheduleError) {
      console.error("Reschedule error:", rescheduleError);
      const errorMessage = rescheduleError.response?.data?.detail ||
                             rescheduleError.response?.data?.message ||
                             'Failed to mark appointment as cancelled for rescheduling.';
      setError(errorMessage);
      toast.error(errorMessage);
      // Only set back if navigation fails or if you want to retry/handle failure gracefully
      setIsSubmitting(false);
    }
  };

  // Framer Motion variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut', delay: 0.1 } }
  };

  return (
    <>
      {/* Bootstrap CSS */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.0/font/bootstrap-icons.min.css"
        rel="stylesheet"
      />

      <motion.div
        className={styles.container}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Background Elements */}
        <div className={styles.bgElements}>
          <div className={styles.bgCircle1}></div>
          <div className={styles.bgCircle2}></div>
        </div>

        <motion.div
          className={styles.card}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header with Icon */}
          <div className={styles.headerSection}>
            <div className={styles.headerIcon}>
              <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <h1 className={styles.header}>Update Appointment</h1>
            <p className={styles.subtitle}>Manage appointment status and scheduling</p>
          </div>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.modernSpinner}></div>
              <p className={styles.loadingText}>Loading appointment details...</p>
            </div>
          ) : error ? (
            <div className={styles.errorAlert}>
              <div className={styles.errorContent}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {error}
              </div>
            </div>
          ) : appointment ? (
            <>
              {/* Details Section */}
              <div className={styles.detailsCard}>
                <div className={styles.detailsHeader}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <h3>Appointment Details</h3>
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Patient:</span>
                    <span className={styles.detailValue}>{appointment.patient_name || 'N/A'}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Doctor:</span>
                    <span className={styles.detailValue}>{appointment.doctor_name || 'N/A'}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Start Time:</span>
                    <span className={styles.detailValue}>{formatDateTime(appointment.start_time)}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>End Time:</span>
                    <span className={styles.detailValue}>{formatDateTime(appointment.end_time)}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Current Status:</span>
                    {/* Applying the local module class for the badge */}
                    <span className={`${styles.statusBadge} ${
                      appointment.status === 'Completed' ? styles.statusSuccess :
                      appointment.status === 'Cancelled' ? styles.statusSecondary :
                      styles.statusWarning
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Update Form */}
              <form onSubmit={handleUpdateSubmit} className={styles.updateForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="status" className={styles.formLabel}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Update Status
                  </label>
                  <div className={styles.selectWrapper}>
                    <select
                      id="status"
                      className={styles.formSelect}
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={isSubmitting}
                      required
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <svg className={styles.selectIcon} width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.buttonGroup}>
                  <button
                    type="submit"
                    className={`${styles.actionButton} ${styles.primaryButton}`}
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting ? (
                      <>
                        <div className={styles.buttonSpinner}></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Update Status
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.secondaryButton}`}
                    onClick={handleReschedule}
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting ? (
                      <>
                        <div className={styles.buttonSpinner}></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
                        </svg>
                        Reschedule Appointment
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.linkButton}`}
                    onClick={() => router.push('/pages/receptionist/view-appointments')}
                    disabled={isSubmitting}
                  >
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                    Back to Appointments List
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className={styles.noDataContainer}>
              <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <p>Could not load appointment details.</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}

export default withReceptionistAuth(UpdateAppointmentPage);