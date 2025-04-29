'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/app/context/AuthContext';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import withPharmacistAuth from '@/app/middleware/withPharmacistAuth';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const PharmacistBillPage = () => {
  const [patientQuery, setPatientQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicineQuery, setMedicineQuery] = useState("");
  const [medicineResults, setMedicineResults] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const fetchPatients = async (query) => {
    try {
      const res = await axiosPrivate.get(`/patients/?search=${query}`);
      setPatients(res.data);
    } catch (err) {
      toast.error("Error fetching patients");
    }
  };

  const fetchMedicines = async (query) => {
    try {
      const res = await axiosPrivate.get(`/medicines/?search=${query}`);
      setMedicineResults(res.data);
    } catch (err) {
      toast.error("Error fetching medicines");
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
    if (medicineQuery.length > 1) {
      const delayDebounce = setTimeout(() => fetchMedicines(medicineQuery), 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setMedicineResults([]);
    }
  }, [medicineQuery]);

  const addMedicine = (medicine) => {
    if (selectedMedicines.some((m) => m.id === medicine.id)) return;
    setSelectedMedicines([...selectedMedicines, { ...medicine, quantity: 1 }]);
    setMedicineQuery("");
    setMedicineResults([]);
  };

  const updateQuantity = (id, quantity) => {
    setSelectedMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, quantity } : m))
    );
  };

  const removeMedicine = (id) => {
    setSelectedMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const total = selectedMedicines.reduce(
    (sum, med) => sum + med.price * med.quantity,
    0
  );

  const handleConfirmBill = async () => {
    try {
      setConfirming(true);
      setIsLoading(true);
      const res = await axiosPrivate.post("/bills/", {
        name: selectedPatient.name,
        phone_number: selectedPatient.phone_number,
        bill_type: "Medicine",
        total_amount: total.toFixed(2),
        medicines: selectedMedicines.map((m) => ({
          medicine: m.id,
          quantity: m.quantity,
        })),
      });
      
      toast.success("Bill created successfully");
      setSelectedMedicines([]);
      setSelectedPatient(null);
      setPatientQuery("");
      setShowModal(false);
    } catch (err) {
      toast.error("Error creating bill");
    } finally {
      setIsLoading(false);
      setConfirming(false);
    }
  };
  

  return (
    <motion.div className="container mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="mb-4 fw-bold fs-3">Pharmacist - Create Bill</h1>

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


      {/* Medicine Search */}
      <div className="mb-4">
        <label className="form-label">Search Medicine:</label>
        <input
          type="text"
          className="form-control"
          value={medicineQuery}
          onChange={(e) => setMedicineQuery(e.target.value)}
        />
        {medicineResults.length > 0 && (
          <ul className="list-group mt-1">
            {medicineResults.map((m) => (
              <li
                key={m.id}
                className="list-group-item d-flex justify-content-between align-items-center"
                onClick={() => addMedicine(m)}
                style={{ cursor: 'pointer' }}
              >
                <span>{m.medicine_name} - ₹{m.price}</span>
                <span className={`badge ${m.requires_prescription ? 'bg-success' : 'bg-danger'}`}>
                  {m.requires_prescription ? 'Prescription' : 'OTC'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected Medicines */}
      <div className="mb-4">
        <h5 className="mb-2">Selected Medicines:</h5>
        {selectedMedicines.length === 0 ? (
          <p>No medicines added</p>
        ) : (
          selectedMedicines.map((med) => (
            <div key={med.id} className="d-flex align-items-center mb-2">
              <span className="me-3">{med.medicine_name} - ₹{med.price}</span>
              <input
                type="number"
                min="1"
                className="form-control form-control-sm w-auto me-2"
                value={med.quantity}
                onChange={(e) => updateQuantity(med.id, parseInt(e.target.value))}
              />
              <button className="btn btn-sm btn-outline-danger" onClick={() => removeMedicine(med.id)}>
                Remove
              </button>
            </div>
          ))
        )}
        {selectedMedicines.length > 0 && (
          <p className="mt-3 fw-bold fs-5">Total: ₹{total.toFixed(2)}</p>
        )}
      </div>

      {/* Actions */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            if (!selectedPatient || selectedMedicines.length === 0) {
              toast.error("Select patient and at least one medicine");
              return;
            }
            setShowModal(true);
          }}
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Bill"}
        </button>
        <Link href="/pages/pharmacist/view-bills" className="btn btn-link">Back to Bills</Link>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <motion.div
                className="modal-content"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
              >
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Bill Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                <p><strong>Patient:</strong> {selectedPatient?.name} ({selectedPatient?.phone_number})</p>
                <ul className="list-unstyled mt-2">
                    {selectedMedicines.map((med) => (
                      <li key={med.id}>
                        {med.medicine_name} (x{med.quantity}) - ₹{(med.price * med.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p className="fw-bold mt-3">Total: ₹{total.toFixed(2)}</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleConfirmBill}
                    disabled={confirming}
                  >
                    {confirming ? "Processing..." : "Confirm & Create"}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default withPharmacistAuth(PharmacistBillPage);
