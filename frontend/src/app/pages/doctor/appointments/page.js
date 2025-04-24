'use client';

import { useState, useEffect } from 'react';
const Button = ({ variant, className, ...props }) => (
  <button 
    className={`px-4 py-2 rounded ${
      variant === 'outline-primary' 
        ? 'border border-blue-500 text-blue-500 hover:bg-blue-50' 
        : 'bg-blue-500 text-white hover:bg-blue-600'
    } ${className}`}
    {...props}
  />
)
import Select from 'react-select';
import { Form, Toast, Spinner } from 'react-bootstrap';
import axiosPrivate from '../../../../../utils/axiosPrivate';

const DoctorPage = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [availableLabTests, setAvailableLabTests] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch patients
    axiosPrivate.get('/patients/')
      .then(res => setPatients(res.data))
      .catch(err => console.error('Error fetching patients:', err));

    // Fetch medicines
    axiosPrivate.get('/medicines/')
      .then(res => setAvailableMedicines(res.data))
      .catch(err => console.error('Error fetching medicines:', err));

    // Fetch lab tests
    axiosPrivate.get('/lab-tests/')
      .then(res => setAvailableLabTests(res.data))
      .catch(err => console.error('Error fetching lab tests:', err));
  }, []);

  const handleMedicineChange = (selected) => {
    const updated = selected.map(item => ({
      ...item,
      dosage: '',
      frequency: '',
      duration: '',
    }));
    setMedicines(updated);
  };

  const handleLabTestChange = (selected) => {
    const updated = selected.map(item => ({
      ...item,
      date: '',
    }));
    setLabTests(updated);
  };

  const handleInputChange = (index, field, value, type = 'medicine') => {
    const list = type === 'medicine' ? [...medicines] : [...labTests];
    list[index][field] = value;
    type === 'medicine' ? setMedicines(list) : setLabTests(list);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const payload = {
      patient: selectedPatient?.value,
      diagnosis,
      notes,
      medicines: medicines.map(m => ({
        id: m.value,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration
      })),
      lab_tests: labTests.map(l => ({
        id: l.value,
        date: l.date
      })),
    };
    
    axiosPrivate.post('/prescriptions/', payload)
      .then(() => {
        setShowToast(true);
        setDiagnosis('');
        setNotes('');
        setMedicines([]);
        setLabTests([]);
      })
      .catch(err => console.error('Error submitting prescription:', err))
      .finally(() => setIsSubmitting(false));
  };

  const validateForm = () => {
    return (
      selectedPatient &&
      diagnosis.trim() &&
      medicines.every(m => m.dosage && m.frequency && m.duration) &&
      labTests.every(l => l.date)
    );
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Doctor Page</h1>
      <div className="row">
        {/* Left Column: Appointments */}
        <div className="col-md-3">
          <h5>Appointments</h5>
          <div className="d-flex flex-column gap-2">
            {patients.map(patient => (
              <Button
                key={patient.id}
                variant="outline-primary"
                onClick={() =>
                  setSelectedPatient({ value: patient.id, label: `${patient.first_name} ${patient.last_name}` })
                }
              >
                {`${patient.first_name} ${patient.last_name} `}
              </Button>
            ))}
          </div>
        </div>

        {/* Middle Column: Patient Info */}
        <div className="col-md-4">
          <h5>Patient Info</h5>
          {selectedPatient ? (
            <>
              <p><strong>Name:</strong> {selectedPatient.label}</p>
              <p><em>Medical history display placeholder...</em></p>
            </>
          ) : (
            <p>Select a patient to view details.</p>
          )}
        </div>

        {/* Right Column: Prescription Form */}
        <div className="col-md-5">
          <h5>Create Prescription</h5>
          {selectedPatient ? (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Diagnosis</Form.Label>
                <Form.Control
                  as="textarea"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={2}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Medicines</Form.Label>
                <Select
                  isMulti
                  options={availableMedicines.map(m => ({ value: m.id, label: m.name }))}
                  onChange={handleMedicineChange}
                  value={medicines}
                />
                {medicines.map((m, i) => (
                  <div key={m.value} className="mt-2 row">
                    <div className="col">
                      <Form.Control
                        placeholder="Dosage"
                        value={m.dosage}
                        onChange={(e) => handleInputChange(i, 'dosage', e.target.value)}
                      />
                    </div>
                    <div className="col">
                      <Form.Control
                        placeholder="Frequency"
                        value={m.frequency}
                        onChange={(e) => handleInputChange(i, 'frequency', e.target.value)}
                      />
                    </div>
                    <div className="col">
                      <Form.Control
                        placeholder="Duration"
                        value={m.duration}
                        onChange={(e) => handleInputChange(i, 'duration', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Lab Tests</Form.Label>
                <Select
                  isMulti
                  options={availableLabTests.map(l => ({ value: l.id, label: l.name }))}
                  onChange={handleLabTestChange}
                  value={labTests}
                />
                {labTests.map((l, i) => (
                  <div key={l.value} className="mt-2">
                    <Form.Control
                      type="date"
                      value={l.date}
                      onChange={(e) =>
                        handleInputChange(i, 'date', e.target.value, 'lab')
                      }
                    />
                  </div>
                ))}
              </Form.Group>
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={!validateForm() || isSubmitting}
              >
                {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Submit Prescription'}
              </Button>
            </Form>
          ) : (
            <p>Select a patient to begin a prescription.</p>
          )}
        </div>
      </div>

      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
        bg="success"
        style={{ position: 'fixed', top: 20, right: 20 }}
      >
        <Toast.Body className="text-white">Prescription submitted successfully!</Toast.Body>
      </Toast>
    </div>
  );
};

export default DoctorPage;