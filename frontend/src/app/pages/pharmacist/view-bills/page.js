'use client';

import { useEffect, useState } from 'react';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import withPharmacistAuth from '@/app/middleware/withPharmacistAuth';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const PharmacistViewBillsPage = () => {
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    name: '',
    phone_number: '',
    paid: '',
    bill_date: ''
  });

  const fetchBills = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        bill_type: 'Medicine',
        ...filters,
      };
      const res = await axiosPrivate.get('/bills/', { params });
      setBills(res.data.results);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      if (err.response?.status === 404) {
        setCurrentPage(1);
      } else {
        toast.error("Failed to fetch bills.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePaidStatus = async (billId, currentStatus) => {
    try {
      await axiosPrivate.patch(`/bills/${billId}/`, {
        paid: !currentStatus,
      });
      toast.success("Payment status updated.");
      fetchBills();
    } catch (err) {
      toast.error("Error updating payment status.");
    }
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      phone_number: '',
      paid: '',
      bill_date: ''
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchBills();
  }, [filters, currentPage]);

  return (
    <motion.div className="container my-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="mb-4 fw-bold">Pharmacist – View Medicine Bills</h2>

      <div className="row mb-4">
  <div className="col-md-4">
    <div className="card shadow-sm border-0 text-center p-3">
      <h6 className="text-muted">Total Bills</h6>
      <h4>{bills.length}</h4>
    </div>
      </div>
      <div className="col-md-4">
        
      </div>
      <div className="col-md-4">
        <div className="card shadow-sm border-0 text-center p-3">
          <h6 className="text-muted">Paid / Unpaid</h6>
          <h4>
            {bills.filter(b => b.paid).length} / {bills.filter(b => !b.paid).length}
          </h4>
        </div>
      </div>
    </div>

      <button 
        className="btn btn-outline-primary mb-3"
        onClick={() => setShowFilters(!showFilters)}
      >
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      {showFilters && (
        <div className="card mb-4 p-3 shadow-sm">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Patient Name</label>
              <input
                type="text"
                className="form-control"
                value={filters.name}
                onChange={(e) => {
                  setFilters({ ...filters, name: e.target.value });
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={filters.phone_number}
                onChange={(e) => {
                  setFilters({ ...filters, phone_number: e.target.value });
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Payment Status</label>
              <select
                className="form-select"
                value={filters.paid}
                onChange={(e) => {
                  setFilters({ ...filters, paid: e.target.value });
                  setCurrentPage(1);
                }}
              >
                <option value="">All</option>
                <option value="true">Paid</option>
                <option value="false">Unpaid</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Date Created</label>
              <input
                type="date"
                className="form-control"
                value={filters.bill_date}
                onChange={(e) => {
                  setFilters({ ...filters, bill_date: e.target.value });
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="col-12">
              <button className="btn btn-secondary" onClick={resetFilters}>Reset Filters</button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : bills.length === 0 ? (
        <p>No medicine bills found.</p>
      ) : (
        <>
          <div className="accordion" id="billsAccordion">
            {bills.map((bill, index) => (
              <div className="accordion-item mb-3 shadow-sm" key={bill.id}>
                <h2 className="accordion-header" id={`heading-${index}`}>
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${index}`}
                    aria-expanded="false"
                    aria-controls={`collapse-${index}`}
                  >
                    Bill #{index+1} – {bill.name} – ₹{bill.total_amount}
                    {bill.paid && <span className="badge bg-success ms-2">Paid</span>}
                    {!bill.paid && <span className="badge bg-warning ms-2">Unpaid</span>}
                  </button>
                </h2>
                <div
                  id={`collapse-${index}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading-${index}`}
                  data-bs-parent="#billsAccordion"
                >
                  <div className="accordion-body">
                    <p><strong>Phone:</strong> {bill.phone_number}</p>
                    <p><strong>Date Created:</strong> {new Date(bill.bill_date).toLocaleString()}</p>

                    {Array.isArray(bill.medicines) && bill.medicines.length > 0 ? (
                      <>
                        <h6 className="mt-3">Medicines:</h6>
                        <ul className="list-group mb-3">
                          {bill.medicines.map((item, i) => (
                            <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                              {item.medicine?.medicine_name || "Unknown"} x {item.quantity}
                              <span className="badge bg-primary rounded-pill">
                                ₹{(item.medicine?.price * item.quantity).toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="text-muted">No medicines in this bill.</p>
                    )}

                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`paidSwitch-${bill.id}`}
                        checked={bill.paid}
                        onChange={() => togglePaidStatus(bill.id, bill.paid)}
                      />
                      <label className="form-check-label" htmlFor={`paidSwitch-${bill.id}`}>
                        Mark as {bill.paid ? "Unpaid" : "Paid"}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <nav className="mt-4">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>
              </li>

              <li className="page-item active">
                <span className="page-link">
                  Page {currentPage} of {totalPages}
                </span>
              </li>

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </motion.div>
  );
};

export default withPharmacistAuth(PharmacistViewBillsPage);
