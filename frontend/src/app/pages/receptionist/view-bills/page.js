'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';
import { useAuth } from '@/app/context/AuthContext';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import '../../../styles/receptionist/receptionist-viewbills.css'; // Import the modern styles

function ViewBillsPage() {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('All');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const billsPerPage = 6;
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === null) return;

    if (!isAuthenticated) {
      router.push('/pages/login');
      return;
    }

    const fetchBills = async () => {
      try {
        const response = await axiosPrivate.get('/consultation-bills/');
        setBills(response.data);
      } catch (error) {
        setError('Failed to fetch bills');
        toast.error('Failed to fetch bills');
      }
    };

    fetchBills();
  }, [isAuthenticated, router]);

  useEffect(() => {
    let result = [...bills];

    // Filter by payment status
    if (paymentStatus === 'Paid') {
      result = result.filter((bill) => bill.paid);
    } else if (paymentStatus === 'Unpaid') {
      result = result.filter((bill) => !bill.paid);
    }

    // Filter by amount
    if (minAmount !== '') {
      result = result.filter((bill) => parseFloat(bill.amount) >= parseFloat(minAmount));
    }
    if (maxAmount !== '') {
      result = result.filter((bill) => parseFloat(bill.amount) <= parseFloat(maxAmount));
    }

    // Filter by date range
    if (startDate) {
      result = result.filter((bill) => new Date(bill.bill_date) >= new Date(startDate));
    }

    setFilteredBills(result);
    setCurrentPage(1);
  }, [bills, paymentStatus, minAmount, maxAmount, startDate]);

  const indexOfLastBill = currentPage * billsPerPage;
  const indexOfFirstBill = indexOfLastBill - billsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstBill, indexOfLastBill);
  const totalPages = Math.ceil(filteredBills.length / billsPerPage);

  const handleEdit = (billId) => {
    router.push(`/pages/receptionist/update-bill/${billId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleResetFilters = () => {
    setPaymentStatus('All');
    setMinAmount('');
    setMaxAmount('');
    setStartDate('');
  };

  if (isAuthenticated === null) {
    return (
      <div className="modern-bills-container">
        <div className="modern-bg-elements">
          <div className="modern-bg-circle-1"></div>
          <div className="modern-bg-circle-2"></div>
        </div>
        <div className="modern-loading">
          <div className="modern-spinner"></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="modern-bills-container">
      {/* Animated Background Elements */}
      <div className="modern-bg-elements">
        <div className="modern-bg-circle-1"></div>
        <div className="modern-bg-circle-2"></div>
      </div>

      <div className="container-fluid">
        <div className="modern-bills-wrapper">
          {/* Header */}
          <div className="modern-bills-header">
            <h1 className="modern-bills-title">Consultation Bills</h1>
            <p className="modern-bills-subtitle">Manage and view all consultation billing records</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="modern-error-alert">
              {error}
            </div>
          )}

          {/* Filters Section */}
          <div className="modern-filters-section">
            <div className="row g-3">
              <div className="col-md-3">
                <div className="modern-filter-group">
                  <label className="modern-filter-label">Payment Status</label>
                  <select
                    className="modern-filter-select"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="modern-filter-group">
                  <label className="modern-filter-label">Min Amount</label>
                  <input
                    type="number"
                    className="modern-filter-input"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    placeholder="₹ 0"
                  />
                </div>
              </div>

              <div className="col-md-2">
                <div className="modern-filter-group">
                  <label className="modern-filter-label">Max Amount</label>
                  <input
                    type="number"
                    className="modern-filter-input"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    placeholder="₹ 999999"
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="modern-filter-group">
                  <label className="modern-filter-label">Start Date</label>
                  <input
                    type="date"
                    className="modern-filter-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <div className="modern-filter-group w-100">
                  <button
                    onClick={handleResetFilters}
                    className="modern-reset-btn"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Cards */}
          <div className="row">
            {currentBills.length > 0 ? (
              currentBills.map((bill) => (
                <div key={bill.id} className="col-lg-4 col-md-6 mb-4">
                  <div className="modern-bill-card">
                    <h5 className="modern-bill-title">
                      Appointment #{bill.appointment.id}
                    </h5>
                    
                    <div className="modern-bill-detail">
                      <span className="modern-bill-label">Patient:</span>
                      <span className="modern-bill-value">{bill.appointment.patient_name}</span>
                    </div>
                    
                    <div className="modern-bill-detail">
                      <span className="modern-bill-label">Doctor:</span>
                      <span className="modern-bill-value">{bill.appointment.doctor_name}</span>
                    </div>
                    
                    <div className="modern-bill-detail">
                      <span className="modern-bill-label">Department:</span>
                      <span className="modern-bill-value">{bill.appointment.department_name}</span>
                    </div>
                    
                    <div className="modern-bill-detail">
                      <span className="modern-bill-label">Start Time:</span>
                      <span className="modern-bill-value">
                        {new Date(bill.appointment.start_time).toLocaleDateString()} at{' '}
                        {new Date(bill.appointment.start_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <div className="modern-bill-detail">
                      <span className="modern-bill-label">Amount:</span>
                      <span className="modern-bill-value modern-bill-amount">
                        ₹{parseFloat(bill.amount).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="modern-bill-detail">
                      <span className="modern-bill-label">Payment Status:</span>
                      <span className={`modern-paid-status ${bill.paid ? 'modern-paid-yes' : 'modern-paid-no'}`}>
                        {bill.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    
                    <div className="modern-bill-detail">
                      <span className="modern-bill-label">Bill Date:</span>
                      <span className="modern-bill-value">
                        {new Date(bill.bill_date).toLocaleDateString()}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleEdit(bill.id)} 
                      className="modern-edit-btn"
                    >
                      Edit Bill Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="modern-no-results">
                  No bills match the current filters.
                  <br />
                  <small>Try adjusting your filter criteria or reset filters to see all bills.</small>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="modern-pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="modern-pagination-btn"
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              
              <div className="modern-pagination-info">
                Page {currentPage} of {totalPages}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="modern-pagination-btn"
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withReceptionistAuth(ViewBillsPage);