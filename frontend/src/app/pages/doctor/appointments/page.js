'use client';

import { useState, useEffect, useMemo } from 'react';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import Select from 'react-select';
import { Form, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { formatDateTime } from '../../../../../utils/dateFormatter';
import withDoctorAuth from '@/app/middleware/withDoctorAuth';


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
    status: 'Pending', // Set default status to 'Pending'
    patient_name: '',
    start_time: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  const Button = ({ variant, className, ...props }) => (
    <button
      className={`px-4 py-2 rounded ${
        variant === 'outline-primary'
          ? 'border border-blue-500 text-blue-500 hover:bg-blue-50'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      } ${className}`}
      {...props}
    />
  );

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
          // reset to first page and try again automatically
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
      console.log(medicalHistory)
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
    if (!validateForm()) {
      console.log(errors)
      return;
    }

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

      // Refresh medical history
      const res = await axiosPrivate.get(`/medical-history/?patient_id=${selectedAppointment.patient}`);
      setMedicalHistory(res.data);
    } catch (err) {
      console.error("Prescription submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Doctor Page</h1>
      <div className="row">
        {/* Left Column: Appointments */}
        <div className="col-md-3">
          <h5>Appointments</h5>
          <div className="mb-2">
            <button onClick={() => setShowFilters(!showFilters)} className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {showFilters &&
              <div className="mt-2 p-3 border rounded bg-light">
                <div className="mb-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search Patient"
                    value={filters.patient_name}
                    onChange={(e) => {
                      setFilters({ ...filters, patient_name: e.target.value });
                      setCurrentPage(1); // reset to first page when filter changes
                    }}
                  />
                </div>
                <div className="mb-2">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={filters.start_time}
                    onChange={(e) => {
                      setFilters({ ...filters, start_time: e.target.value });
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div className="mb-2">
                  <select
                    className="form-select form-select-sm"
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
                <button
                  className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  onClick={() => setFilters({ status: 'Pending', patient_name: '', start_time: '' })} // Reset and default to Pending
                >
                  Reset Filters
                </button>
              </div>
            }
          </div>
          <div className="d-flex flex-column gap-2">
            {appointments.map(appt => (
              <Button
                key={appt.id}
                variant="outline-primary"
                onClick={() => handleAppointmentClick(appt)}
              >
                {`${appt.patient_name} - ${formatDateTime(appt.start_time)}`}
              </Button>
            ))}
            <div className="pagination">
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

        {/* Middle Column: Patient Info */}
        <div className="col-md-4">
          <h5>Patient Info</h5>
          {selectedAppointment ? (
            <>
              <p><strong>Name:</strong> {selectedAppointment.patient_name}</p>
              <p className="mt-3"><strong>Medical History:</strong></p>
              <ul className="list-unstyled">
                {medicalHistory.length ? (
                  medicalHistory.map((item) => (
                    <li key={item.id} className="mb-3">
                      <div
                        role="button"
                        onClick={() => toggleExpand(item.id)}
                        className="p-2 border rounded shadow-sm bg-light"
                      >
                        {console.log(item.prescription)}
                        <strong>{item.diagnosis}</strong> ({item.date_of_occurrence})
                      </div>
                      {expandedItems[item.id] && (
                        <div className="mt-2 ps-3 border-start">
                          <p><strong>Prescription Notes:</strong> {item.prescription?.notes || "No notes available."}</p>

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
                            <p className="ms-3">None</p>
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
                            <p className="ms-3">None</p>
                          )}
                        </div>
                      )}
                    </li>
                  ))
                ) : (
                  <li>No history found.</li>
                )}
              </ul>
            </>
          ) : (
            <p>Select an appointment to view details.</p>
          )}
        </div>

        {/* Right Column: Prescription Form */}
        <div className="col-md-5">
          <h5>Create Prescription</h5>
          {selectedAppointment ? (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Diagnosis</Form.Label>
                <Form.Control
                  as="textarea"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={2}
                  isInvalid={!!errors.diagnosis}
                />
                {errors.diagnosis && <div className="text-danger">{errors.diagnosis}</div>}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  isInvalid={!!errors.notes}
                />
                {errors.notes && <div className="text-danger">{errors.notes}</div>}
              </Form.Group>

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
  );
};

export default withDoctorAuth(DoctorPage);
