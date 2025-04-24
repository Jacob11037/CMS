'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/app/context/AuthContext';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import { motion, AnimatePresence } from 'framer-motion';
import Link from "next/link";
import withLabTechnicianAuth from '@/app/middleware/withLabTechnicianAuth';

const LabTechnicianBillPage = () => {
  const [patientQuery, setPatientQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchPatients = async (query) => {
    try {
      const res = await axiosPrivate.get(`/patients/?search=${query}`);
      setPatients(res.data);
    } catch (err) {
      toast.error("Error fetching patients");
    }
  };

  const fetchLabTests = async (query) => {
    try {
      const res = await axiosPrivate.get(`/lab-tests/?search=${query}`);
      setTestResults(res.data);
    } catch (err) {
      toast.error("Error fetching lab tests");
    }
  };

  useEffect(() => {
    if (patientQuery.length > 1) {
      const delayDebounce = setTimeout(() => fetchPatients(patientQuery), 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setPatients([]);
    }
  }, [patientQuery]);

  useEffect(() => {
    if (testQuery.length > 1) {
      const delayDebounce = setTimeout(() => fetchLabTests(testQuery), 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setTestResults([]);
    }
  }, [testQuery]);

  const addTest = (test) => {
    if (selectedTests.some((t) => t.id === test.id)) return;
    setSelectedTests([...selectedTests, test]);
    setTestQuery('');
    setTestResults([]);
  };

  const removeTest = (id) => {
    setSelectedTests((prev) => prev.filter((t) => t.id !== id));
  };

  const total = selectedTests.reduce((sum, t) => sum + Number(t.price), 0);

  const confirmAndCreate = async () => {
    if (!selectedPatient || selectedTests.length === 0) {
      toast.error("Select patient and at least one lab test");
      return;
    }
    try {
      setIsLoading(true);
      const res = await axiosPrivate.post("/bills/", {
        name: selectedPatient.name,
        phone_number: selectedPatient.phone_number,
        bill_type: "Lab Test",
        total_amount: total.toFixed(2),
        lab_tests: selectedTests.map((t) => ({ lab_test: t.id }))
      });
      toast.success("Bill created successfully");
      setSelectedTests([]);
      setSelectedPatient(null);
      setPatientQuery('');
    } catch (err) {
      toast.error("Error creating bill");
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };
  
  

  return (
    <motion.div className="container py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="display-5 mb-4">Lab Technician - Create Bill</h1>

      {/* Patient Details */}
      <div className="mb-4">
        <h5 className="fw-bold mb-3">Patient Details</h5>
        <div className="card shadow-sm p-3">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Patient Name:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter patient's full name"
                value={selectedPatient?.name || ''}
                onChange={(e) =>
                  setSelectedPatient((prev) => ({
                    ...prev,
                    name: e.target.value,
                    id: prev?.id || null,
                  }))
                }
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone Number:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter phone number"
                value={selectedPatient?.phone_number || ''}
                onChange={(e) =>
                  setSelectedPatient((prev) => ({
                    ...prev,
                    phone_number: e.target.value,
                    id: prev?.id || null,
                  }))
                }
              />
            </div>
          </div>
        </div>
      </div>



      <div className="mb-4">
        <label className="form-label">Search Lab Test:</label>
        <input
          type="text"
          value={testQuery}
          onChange={(e) => setTestQuery(e.target.value)}
          className="form-control"
        />
        {testResults.length > 0 && (
          <div className="list-group mt-1">
            {testResults.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => addTest(t)}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              >
                <span>{t.test_name} - ₹{t.price}</span>
                <span className={`badge bg-${t.requires_prescription ? 'success' : 'danger'}`}>
                  {t.requires_prescription ? 'Requires Prescription' : 'No Prescription'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <h5>Selected Lab Tests:</h5>
        {selectedTests.length === 0 && <p>No tests added</p>}
        <ul className="list-group">
          {selectedTests.map((t) => (
            <li key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
              {t.test_name} - ₹{t.price}
              <button className="btn btn-sm btn-outline-danger" onClick={() => removeTest(t.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        {selectedTests.length > 0 && (
          <p className="mt-3 fw-semibold">Total: ₹{total.toFixed(2)}</p>
        )}
      </div>

      <div className="d-flex gap-3">
        <button
          onClick={() => setShowModal(true)}
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Processing...' : 'Create Bill'}
        </button>
        <Link href="/pages/labtechnician/view-bills" className="btn btn-outline-secondary">
          Back to Bills
        </Link>
      </div>

      {/* Modal for bill confirmation */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal fade show d-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <motion.div className="modal-content"
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                exit={{ y: 50 }}
              >
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Bill</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                <p><strong>Patient:</strong> {selectedPatient?.name} ({selectedPatient?.phone_number})</p>
                <ul className="list-group">
                    {selectedTests.map((t) => (
                      <li key={t.id} className="list-group-item d-flex justify-content-between">
                        <span>{t.test_name}</span>
                        <span>₹{t.price}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3"><strong>Total:</strong> ₹{total.toFixed(2)}</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={confirmAndCreate}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Confirm and Create'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default withLabTechnicianAuth(LabTechnicianBillPage);
