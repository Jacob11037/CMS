'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext'; // Adjust path if needed
import axiosPrivate from '../../../../../../utils/axiosPrivate'; // Adjust path if needed
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth'; // Adjust path if needed
import { toast } from 'react-toastify';
import styles from '../../../../styles/receptionist/updateAppointment.module.css'; // Import the CSS module
import { motion } from 'framer-motion';
import { formatDateTime } from '../../../../../../utils/dateFormatter'; // Import the formatter

function UpdateAppointmentPage({ params }) {
  const { appointmentid } = params; // Get ID from params prop
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state
  const [status, setStatus] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated === null) return; // Wait for auth check

    if (!isAuthenticated) {
      router.push('/pages/login');
      return;
    }

    if (!appointmentid) {
      setError('Appointment ID is missing.');
      setIsLoading(false);
      toast.error('Appointment ID is missing.');
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
    // Consider adding a confirmation dialog
    // if (!window.confirm("This will cancel the current appointment. Do you want to proceed with rescheduling?")) {
    //   return;
    // }

    setIsSubmitting(true); // Use submitting state to disable buttons
    try {
      // First cancel the current appointment (optional, depends on workflow)
      // If you ALWAYS want to cancel before rescheduling, keep this.
      // If rescheduling means creating a *new* related one, you might skip this.
      await axiosPrivate.patch(`/appointments/${appointmentid}/`, {
        status: 'Cancelled'
      });

      // Then redirect to create appointment page with query params
      const queryParams = new URLSearchParams({
        patient: appointment.patient, // Send patient ID
        doctor: appointment.doctor,   // Send doctor ID
        // start_time: appointment.start_time, // Maybe don't prefill time?
        // end_time: appointment.end_time,
        reschedule: 'true',
        // original_appointment_id: appointmentid // Optional: link new to old
      }).toString();

      // *** IMPORTANT: Update this path if your create form is elsewhere ***
      router.push(`/pages/receptionist/appointment?${queryParams}`);

      toast.info('Current appointment marked as Cancelled. Please create the rescheduled appointment.');
      // No finally block setting isSubmitting to false here, because we navigate away.
    } catch (rescheduleError) {
      console.error("Reschedule error:", rescheduleError);
      const errorMessage = rescheduleError.response?.data?.detail ||
                           rescheduleError.response?.data?.message ||
                           'Failed to mark appointment as cancelled for rescheduling.';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsSubmitting(false); // Only set back if navigation fails
    }
  };

  // Framer Motion variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <motion.div
      className={styles.container}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.card}> {/* Main card for content */}
        <h1 className={styles.header}>Update Appointment</h1>

        {isLoading ? (
          <div className="d-flex justify-content-center">
            <div className={`spinner-border text-primary ${styles.loadingSpinner}`} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className={`alert alert-danger ${styles.errorAlert}`} role="alert">
            {error}
          </div>
        ) : appointment ? (
          <>
            {/* Details Section */}
            <div className={styles.detailsCard}>
              <p><strong>Patient:</strong> {appointment.patient_name || 'N/A'}</p>
              <p><strong>Doctor:</strong> {appointment.doctor_name || 'N/A'}</p>
              <p><strong>Start Time:</strong> {formatDateTime(appointment.start_time)}</p>
              <p><strong>End Time:</strong> {formatDateTime(appointment.end_time)}</p>
              <p><strong>Current Status:</strong> <span className={`badge bg-${appointment.status === 'Completed' ? 'success' : appointment.status === 'Cancelled' ? 'secondary' : 'warning'}`}>{appointment.status}</span></p>
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdateSubmit}>
              <div className="mb-4"> {/* Increased margin bottom */}
                <label htmlFor="status" className={styles.formLabel}>Update Status:</label>
                <select
                  id="status"
                  className={`form-select ${styles.formSelect}`} // Use Bootstrap and custom styles
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isSubmitting} // Disable while submitting
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  className={`btn btn-primary ${styles.actionButton}`}
                  disabled={isSubmitting || isLoading} // Disable on load/submit
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span className="ms-1">Updating...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle"></i> Update Status
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className={`btn btn-outline-secondary ${styles.actionButton}`} // Changed style for reschedule
                  onClick={handleReschedule}
                  disabled={isSubmitting || isLoading} // Disable on load/submit
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span className="ms-1">Processing...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calendar-plus"></i> Reschedule Appointment
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className={`btn btn-link ${styles.actionButton} mt-2`} // Back button styled as link
                  onClick={() => router.push('/pages/receptionist/view-appointments')}
                  disabled={isSubmitting}
                >
                  Back to Appointments List
                </button>
              </div>
            </form>
          </>
        ) : (
          <p className="text-center text-muted mt-4">Could not load appointment details.</p> // Fallback if no error but no appointment
        )}
      </div>
    </motion.div>
  );
}

export default withReceptionistAuth(UpdateAppointmentPage);