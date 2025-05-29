'use client';

import { useState, useEffect, useMemo } from 'react';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import Select from 'react-select';
import { Form, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../styles/doctorappointments.css'
import withDoctorAuth from '@/app/middleware/withDoctorAuth';
import { formatDateTime } from '@/utils/dateFormatter';

const DoctorPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);

  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [availableLabTests, setAvailableLabTests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandedItems, setExpandedItems] = useState({});

  //--------------Filtering and Pagination----------
  const [filters, setFilters] = useState({
    status: 'Pending',
    patient_name: '',
    start_time: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const Button = ({ variant, className, children, ...props }) => (
    <button
      className={`modern-btn ${
        variant === 'outline-primary'
          ? 'modern-btn-outline'
          : variant === 'success'
          ? 'modern-btn-success'
          : 'modern-btn-primary'
      } ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Custom Select styles to match theme
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(102, 126, 234, 0.25)' : 'none',
      borderColor: state.isFocused ? '#667eea' : '#e2e8f0',
      '&:hover': {
        borderColor: '#667eea'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#667eea' : state.isFocused ? 'rgba(102, 126, 234, 0.1)' : 'white',
      color: state.isSelected ? 'white' : '#2d3748'
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      borderRadius: '8px'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#667eea',
      fontWeight: '500'
    })
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, medRes, labRes] = await Promise.all([
          axiosPrivate.get('/appointments/'),
          axiosPrivate.get('/medicines/'),
          axiosPrivate.get('/lab-tests/')
        ]);
        setAppointments(apptRes.data.results);
        setAvailableMedicines(medRes.data);
        setAvailableLabTests(labRes.data);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const params = {
          page: currentPage,
          status: filters.status,
          patient_name: filters.patient_name,
          start_time: filters.start_time,
        };
        const response = await axiosPrivate.get("/appointments/", { params });
        setAppointments(response.data.results);
        setTotalPages(response.data.total_pages);

      } catch (error) {
        if (error.response?.status === 404) {
          setCurrentPage(1);
        } else {
          console.log('An error occurred while fetching appointments');
        }
      }
    };
    fetchAppointments();
  }, [filters, currentPage]);

  const handleAppointmentClick = async (appointment) => {
    try {
      setSelectedAppointment(appointment);
      const res = await axiosPrivate.get(`/medical-history/?patient_id=${appointment.patient}`);
      setMedicalHistory(res.data);
    } catch (error) {
      console.error("Error fetching medical history:", error);
    }
  };

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
      test_date: '',
    }));
    setLabTests(updated);
  };

  const handleInputChange = (index, field, value, type = 'medicine') => {
    const list = type === 'medicine' ? [...medicines] : [...labTests];
    list[index][field] = value;
    type === 'medicine' ? setMedicines(list) : setLabTests(list);
  };

  const isFormValid = useMemo(() => {
    const hasValidMedicines = medicines.length > 0 && !medicines.some(m => !m.dosage || !m.frequency || !m.duration);
    const hasValidLabTests = labTests.length > 0 && !labTests.some(l => !l.test_date);

    return (
      selectedAppointment &&
      diagnosis.trim().length >= 3 &&
      (hasValidMedicines || hasValidLabTests) &&
      notes.length <= 500
    );
  }, [selectedAppointment, diagnosis, medicines, labTests, notes]);

  const validateForm = () => {
    const errs = {};
    const hasValidMedicines = medicines.length > 0 && !medicines.some(m => !m.dosage || !m.frequency || !m.duration);
    const hasValidLabTests = labTests.length > 0 && !labTests.some(l => !l.test_date);

    if (!selectedAppointment) errs.appointment = "Appointment required";
    if (!diagnosis || diagnosis.trim().length < 3) errs.diagnosis = "Diagnosis must be at least 3 characters";
    if (!hasValidMedicines && !hasValidLabTests) errs.selection = "Select at least one valid medicine or lab test";
    if (notes.length > 500) errs.notes = "Notes too long";
    if (medicines.length > 0 && medicines.some(m => !m.dosage || !m.frequency || !m.duration)) {
      errs.medicines = "Complete all medicine fields";
    }
    if (labTests.length > 0 && labTests.some(l => !l.test_date)) {
      errs.labTests = "Fill all lab test dates";
    }
    if (labTests.some(l => !l.test_date || new Date(l.test_date) < new Date().setHours(0,0,0,0))) {
      errs.labTests = "Lab test dates must be today or in the future";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        patient: selectedAppointment.patient,
        doctor: selectedAppointment.doctor,
        appointment: selectedAppointment.id,
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
          test_date: l.test_date
        })),
      };
      await axiosPrivate.post('/prescriptions/', payload);

      toast.success('Prescription submitted successfully!');

      setDiagnosis('');
      setNotes('');
      setMedicines([]);
      setLabTests([]);

      const res = await axiosPrivate.get(`/medical-history/?patient_id=${selectedAppointment.patient}`);
      setMedicalHistory(res.data);
    } catch (err) {
      console.error("Prescription submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="modern-doctor-container">
        <div className="modern-bg-elements">
          <div className="modern-bg-circle-1"></div>
          <div className="modern-bg-circle-2"></div>
        </div>

        <div className="container">
          <h1 className="modern-main-title">Doctor Dashboard</h1>
          
          <div className="row">
            {/* Left Column: Appointments */}
            <div className="col-lg-3 col-md-4">
              <div className="modern-card">
                <div className="modern-card-header">
                  <div className="modern-card-icon">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                  </div>
                  <h5 className="modern-card-title">Appointments</h5>
                </div>

                <Button
                  variant="outline-primary"
                  onClick={() => setShowFilters(!showFilters)}
                  className="mb-3 w-100"
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>

                {showFilters && (
                  <div className="modern-filters">
                    <div className="mb-3">
                      <label className="modern-label">Search Patient</label>
                      <input
                        type="text"
                        className="modern-input"
                        placeholder="Patient name..."
                        value={filters.patient_name}
                        onChange={(e) => {
                          setFilters({ ...filters, patient_name: e.target.value });
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="modern-label">Date</label>
                      <input
                        type="date"
                        className="modern-input"
                        value={filters.start_time}
                        onChange={(e) => {
                          setFilters({ ...filters, start_time: e.target.value });
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="modern-label">Status</label>
                      <select
                        className="modern-input"
                        value={filters.status}
                        onChange={(e) => {
                          setFilters({ ...filters, status: e.target.value });
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <Button
                      variant="outline-primary"
                      onClick={() => setFilters({ status: 'Pending', patient_name: '', start_time: '' })}
                      className="w-100"
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}

                <div className="d-flex flex-column">
                  {appointments.map(appt => (
                    <Button
                      key={appt.id}
                      variant="outline-primary"
                      className="modern-appointment-item"
                      onClick={() => handleAppointmentClick(appt)}
                    >
                      <strong>{appt.patient_name}</strong>
                      <br />
                      <small>{formatDateTime(appt.start_time)}</small>
                    </Button>
                  ))}
                  
                  <div className="modern-pagination">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column: Patient Info */}
            <div className="col-lg-4 col-md-4">
              <div className="modern-card">
                <div className="modern-card-header">
                  <div className="modern-card-icon">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <h5 className="modern-card-title">Patient Information</h5>
                </div>

                {selectedAppointment ? (
                  <>
                    <div className="mb-4">
                      <p><strong>Name:</strong> {selectedAppointment.patient_name}</p>
                    </div>
                    
                    <div>
                      <h6 className="modern-label mb-3">Medical History</h6>
                      {medicalHistory.length ? (
                        medicalHistory.map((item) => (
                          <div key={item.id}>
                            <div
                              className="modern-history-item"
                              onClick={() => toggleExpand(item.id)}
                            >
                              <strong>{item.diagnosis}</strong>
                              <br />
                              <small className="text-muted">({item.date_of_occurrence})</small>
                            </div>
                            {expandedItems[item.id] && (
                              <div className="modern-history-expanded">
                                <p><strong>Notes:</strong> {item.prescription?.notes || "No notes available."}</p>

                                <p><strong>Medicines:</strong></p>
                                {item.prescription?.medicines?.length ? (
                                  <ul className="ms-3">
                                    {item.prescription.medicines.map((med, index) => (
                                      <li key={index}>
                                        {med.medicine.medicine_name} - {med.dosage}, {med.frequency}, {med.duration}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="ms-3 text-muted">None</p>
                                )}

                                <p><strong>Lab Tests:</strong></p>
                                {item.prescription?.lab_tests?.length ? (
                                  <ul className="ms-3">
                                    {item.prescription.lab_tests.map((test, index) => (
                                      <li key={index}>
                                        {test.lab_test.test_name} (Date: {test.test_date})
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="ms-3 text-muted">None</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">No medical history found.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-muted">Select an appointment to view patient details.</p>
                )}
              </div>
            </div>

            {/* Right Column: Prescription Form */}
            <div className="col-lg-5 col-md-4">
              <div className="modern-card">
                <div className="modern-card-header">
                  <div className="modern-card-icon">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                  </div>
                  <h5 className="modern-card-title">Create Prescription</h5>
                </div>

                {selectedAppointment ? (
                  <Form>
                    <div className="mb-3">
                      <label className="modern-label">Diagnosis</label>
                      <textarea
                        className={`modern-input ${errors.diagnosis ? 'is-invalid' : ''}`}
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        rows={3}
                        placeholder="Enter diagnosis..."
                      />
                      {errors.diagnosis && <div className="modern-error">{errors.diagnosis}</div>}
                    </div>

                    <div className="mb-3">
                      <label className="modern-label">Notes</label>
                      <textarea
                        className={`modern-input ${errors.notes ? 'is-invalid' : ''}`}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Additional notes..."
                      />
                      {errors.notes && <div className="modern-error">{errors.notes}</div>}
                    </div>

              <Form.Group className="mb-3">
                <Form.Label>Medicines</Form.Label>
                <Select
                  isMulti
                  options={availableMedicines.map(m => ({
                    value: m.id,
                    label: m.medicine_name,
                    medicine: m   // Store the full medicine object
                  }))}
                  onChange={handleMedicineChange}
                  value={medicines}
                />
                {errors.medicines && <div className="text-danger">{errors.medicines}</div>}
                {medicines.map((m, i) => (
                  <div key={m.value} className="mt-3 p-3 border rounded">
                    <h6 className="mb-3">{m.label} {/* Display medicine name */}</h6>
                    <div className="row">
                      <div className="col-md-4">
                        <Form.Group>
                          <Form.Label>Dosage</Form.Label>
                          <Form.Control
                            placeholder="e.g., 500mg"
                            value={m.dosage}
                            onChange={(e) => handleInputChange(i, 'dosage', e.target.value)}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-4">
                        <Form.Group>
                          <Form.Label>Frequency</Form.Label>
                          <Form.Control
                            placeholder="e.g., 3 times daily"
                            value={m.frequency}
                            onChange={(e) => handleInputChange(i, 'frequency', e.target.value)}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-4">
                        <Form.Group>
                          <Form.Label>Duration</Form.Label>
                          <Form.Control
                            placeholder="e.g., 7 days"
                            value={m.duration}
                            onChange={(e) => handleInputChange(i, 'duration', e.target.value)}
                          />
                        </Form.Group>
                      </div>
                    </div>
                  </div>
                ))}
              </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Lab Tests</Form.Label>
        <Select
          isMulti
          options={availableLabTests.map(l => ({ 
            value: l.id, 
            label: l.test_name,
            test: l  // Store the full test object
          }))}
          onChange={handleLabTestChange}
          value={labTests}
        />
        {labTests.map((l, i) => (
          <div key={l.value} className="mt-3 p-3 border rounded">
            <h6 className="mb-3">{l.label} {/* Display lab test name */}</h6>
            <Form.Group>
              <Form.Label>Test Date</Form.Label>
              <Form.Control
                type="date"
                min={new Date().toISOString().split('T')[0]} // prevents past dates
                value={l.test_date}
                onChange={(e) => handleInputChange(i, 'test_date', e.target.value, 'lab')}
              />

            </Form.Group>
            {errors.labTests && <div className="text-danger">{errors.labTests}</div>}

          </div>
        ))}
        {errors.selection && <div className="text-danger">{errors.selection}</div>}
      </Form.Group>
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Submit Prescription'}
              </Button>
              

            </Form>
          ) : (
            <p>Select an appointment to begin a prescription.</p>
          )}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

    </div>
    </div>
    </div>
  );
};

export default withDoctorAuth(DoctorPage);
