'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';
import { useAuth } from '@/app/context/AuthContext';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';

function ViewBillsPage() {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('All');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const billsPerPage = 5;
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
    return <p className="text-center mt-5">Loading...</p>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 animate__animated animate__fadeInDown">View Consultation Bills</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <label className="form-label">Payment Status</label>
          <select
            className="form-select"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Min Amount</label>
          <input
            type="number"
            className="form-control"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            placeholder="₹ Min"
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Max Amount</label>
          <input
            type="number"
            className="form-control"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            placeholder="₹ Max"
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>


        <div className="col-md-3 d-flex align-items-end">
          <button
            onClick={handleResetFilters}
            className="btn btn-outline-secondary w-100"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Bill Cards */}
      <div className="row">
        {currentBills.length > 0 ? (
          currentBills.map((bill) => (
            <div key={bill.id} className="col-md-6 col-lg-4 mb-4 animate__animated animate__fadeInUp">
              <div className="card shadow-sm h-100 border-0 rounded-4">
                <div className="card-body">
                  <h5 className="card-title">Appointment ID: {bill.appointment}</h5>
                  <p className="card-text"><strong>Amount:</strong> ₹{parseFloat(bill.amount).toFixed(2)}</p>
                  <p className="card-text"><strong>Paid:</strong> {bill.paid ? 'Yes' : 'No'}</p>
                  <p className="card-text"><strong>Date:</strong> {new Date(bill.bill_date).toLocaleString()}</p>
                  <button onClick={() => handleEdit(bill.id)} className="btn btn-primary btn-sm mt-2">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No bills match the filters.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="btn btn-outline-secondary mx-2"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="fw-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="btn btn-outline-secondary mx-2"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default withReceptionistAuth(ViewBillsPage);
