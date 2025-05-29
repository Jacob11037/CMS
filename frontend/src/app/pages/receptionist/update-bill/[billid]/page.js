'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import axiosPrivate from '../../../../../../utils/axiosPrivate';
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';
import { toast } from 'react-toastify';
import '../../../../styles/receptionist/receptionist-updatebill.css'  ;

function UpdateBillPage({ params }) {
  const { billid } = use(params);
  const [bill, setBill] = useState(null);
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated === null) return;

    if (!isAuthenticated) {
      router.push('/pages/login');
      return;
    }

    const fetchBillDetails = async () => {
      try {
        const response = await axiosPrivate.get(`/consultation-bills/${billid}/`);
        setBill(response.data);
        setPaid(response.data.paid);
      } catch (error) {
        setError('Failed to fetch bill details');
        toast.error('Failed to fetch bill details', { position: "top-right", autoClose: 3000 });
      }
    };

    fetchBillDetails();
  }, [isAuthenticated, router, billid]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await axiosPrivate.patch(`/consultation-bills/${billid}/`, {
        paid: paid,
      });
      toast.success('Bill status updated successfully!', { position: "top-right", autoClose: 3000 });
      router.push('/pages/receptionist/view-bills');
    } catch (error) {
      setError('Failed to update bill');
      toast.error(error.response?.data?.message || 'Failed to update bill', { position: "top-right", autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="modern-page-container">
        <div className="modern-loading">
          <div className="modern-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Bootstrap CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      <div className="modern-page-container">
        {/* Animated Background Elements */}
        <div className="modern-bg-elements">
          <div className="modern-bg-circle-1"></div>
          <div className="modern-bg-circle-2"></div>
        </div>

        {/* Main Content Card */}
        <div className="modern-page-card">
          {/* Header */}
          <div className="modern-page-header">
            <div className="modern-page-icon">
              <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </div>
            <h2 className="modern-page-title">Update Consultation Bill</h2>
            <p className="modern-page-subtitle">Modify payment status and bill details</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="modern-alert">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="20" height="20" fill="currentColor" style={{ marginRight: '0.5rem' }} viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {error}
              </div>
            </div>
          )}

          {bill ? (
            <>
              {/* Bill Details Section */}
              <div className="modern-details-section">
                <h3 className="modern-section-title">Bill Information</h3>
                <div className="modern-details-grid">
                  <div className="modern-detail-item">
                    <span className="modern-detail-label">Appointment ID:</span>
                    <span className="modern-detail-value">{bill.appointment.id}</span>
                  </div>
                  <div className="modern-detail-item">
                    <span className="modern-detail-label">Patient:</span>
                    <span className="modern-detail-value">{bill.appointment.patient_name}</span>
                  </div>
                  <div className="modern-detail-item">
                    <span className="modern-detail-label">Doctor:</span>
                    <span className="modern-detail-value">{bill.appointment.doctor_name}</span>
                  </div>
                  <div className="modern-detail-item">
                    <span className="modern-detail-label">Department:</span>
                    <span className="modern-detail-value">{bill.appointment.department_name}</span>
                  </div>
                  <div className="modern-detail-item">
                    <span className="modern-detail-label">Appointment Time:</span>
                    <span className="modern-detail-value">{new Date(bill.appointment.start_time).toLocaleString()}</span>
                  </div>
                  <div className="modern-detail-item">
                    <span className="modern-detail-label">Amount:</span>
                    <span className="modern-detail-value modern-amount">₹{parseFloat(bill.amount).toFixed(2)}</span>
                  </div>
                  <div className="modern-detail-item">
                    <span className="modern-detail-label">Bill Date:</span>
                    <span className="modern-detail-value">{new Date(bill.bill_date).toLocaleString()}</span>
                  </div>
                  <div className="modern-detail-item">
                    <span className="modern-detail-label">Current Status:</span>
                    <span className={`modern-status-badge ${paid ? 'paid' : 'unpaid'}`}>
                      {paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Update Form */}
              <form className="modern-update-form" onSubmit={handleUpdateSubmit}>
                <div className="modern-form-group">
                  <label className="modern-form-label">Payment Status</label>
                  <div className="modern-select-wrapper">
                    <select
                      className="modern-select"
                      value={paid ? 'true' : 'false'}
                      onChange={(e) => setPaid(e.target.value === 'true')}
                      disabled={isLoading}
                    >
                      <option value="false">Unpaid</option>
                      <option value="true">Paid</option>
                    </select>
                    <svg className="modern-select-icon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="modern-actions">
                  <button 
                    type="button" 
                    className="modern-btn modern-btn-secondary"
                    onClick={() => router.push('/pages/receptionist/view-bills')}
                    disabled={isLoading}
                  >
                    <svg width="16" height="16" fill="currentColor" style={{ marginRight: '0.5rem' }} viewBox="0 0 24 24">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                    Back to Bills
                  </button>
                  <button 
                    type="submit" 
                    className="modern-btn modern-btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="modern-spinner-sm"></div>
                        Updating...
                      </div>
                    ) : (
                      <>
                        <svg width="16" height="16" fill="currentColor" style={{ marginRight: '0.5rem' }} viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Update Bill
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="modern-loading">
              <div className="modern-spinner"></div>
              <p>Loading bill details...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default withReceptionistAuth(UpdateBillPage);