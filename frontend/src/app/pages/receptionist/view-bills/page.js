'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';
import { useAuth } from '@/app/context/AuthContext';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import '../../../styles/ViewAppointmentsPage.css'

function ViewBillsPage() {
    const [bills, setBills] = useState([]);
    const [filteredBills, setFilteredBills] = useState([]);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('All');
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
      if (filter === 'Paid') {
        result = result.filter((bill) => bill.paid);
      } else if (filter === 'Unpaid') {
        result = result.filter((bill) => !bill.paid);
      }
      setFilteredBills(result);
      setCurrentPage(1); // reset to page 1 on filter change
    }, [filter, bills]);
  
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
  
    if (isAuthenticated === null) {
      return <p className="loading">Loading...</p>;
    }
  
    return (
      <div className="container">
        <h1 className="header">View All Bills</h1>
        {error && <p className="error">{error}</p>}
  
        {/* Filter Controls */}
        <div className="form-group">
          <label htmlFor="filter">Filter by Payment Status:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
  
        <div className="appointmentsContainer">
          {currentBills.length > 0 ? (
            <ul className="appointmentsList">
              {currentBills.map((bill) => (
                <li key={bill.id} className="appointmentItem">
                    <p className="appointmentText">
                    <strong>Appointment ID:</strong>{' '}
                    <a
                        href={`/pages/receptionist/update-appointment/${bill.appointment}`}
                        className="appointmentLink"
                    >
                        {bill.appointment}
                    </a>
                    </p>
                  <p className="appointmentText"><strong>Amount:</strong> ${parseFloat(bill.amount).toFixed(2)}</p>
                  <p className="appointmentText"><strong>Paid:</strong> {bill.paid ? 'Yes' : 'No'}</p>
                  <p className="appointmentText"><strong>Date:</strong> {new Date(bill.bill_date).toLocaleString()}</p>
                  <button
                    onClick={() => handleEdit(bill.id)}
                    className="button updateButton"
                  >
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No bills available.</p>
          )}
  
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  export default withReceptionistAuth(ViewBillsPage);