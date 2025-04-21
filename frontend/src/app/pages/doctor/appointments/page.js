"use client";

import { useState, useEffect } from "react";
import axiosPrivate from "../../../../../utils/axiosPrivate";
import Select from "react-select"; 
import "../../../styles/doctorappointments.css"; 
import withDoctorAuth from "@/app/middleware/withDoctorAuth";
import { formatDateTime } from "../../../../../utils/dateFormatter";

const DoctorPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [medicalHistory, setMedicalHistory] = useState([]);
    const [prescriptionData, setPrescriptionData] = useState({
        diagnosis: "",
        medicines: [],
        lab_tests: [],
        notes: "",
    });
    const [medicines, setMedicines] = useState([]);
    const [labTests, setLabTests] = useState([]);
    const [errors, setErrors] = useState({});


    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [filters, setFilters] = useState({
        status:'',
        patient_name:'',
        start_time:''
      });
    const [showFilters, setShowFilters] = useState(false);


    // Format medicines for React Select
    const medicineOptions = medicines.map(medicine => ({
        value: medicine.id,
        label: medicine.medicine_name,
    }));

    // Format lab tests for React Select
    const labTestOptions = labTests.map(labTest => ({
        value: labTest.id,
        label: labTest.test_name,
    }));

    const customStyles = {
        control: (provided) => ({
            ...provided,
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: 'none',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#007bff' : 'white',
            color: state.isSelected ? 'white' : 'black',
        }),
    };

    useEffect(() => {
        const fetchMedicinesAndLabTests = async () => {
            try {
                const medicinesResponse = await axiosPrivate.get("/medicines/");
                const labTestsResponse = await axiosPrivate.get("/lab-tests/");
                setMedicines(medicinesResponse.data);
                setLabTests(labTestsResponse.data);
            } catch (error) {
                console.error("Error fetching medicines or lab tests:", error);
            }
        };
        fetchMedicinesAndLabTests();
    }, []);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const params = {
                    page : currentPage,
                    status : filters.status,
                    patient_name : filters.patient_name,
                    start_time : filters.start_time,
                };
                const response = await axiosPrivate.get("/appointments/", {params});
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
            console.log(appointment)

            const response = await axiosPrivate.get(`/medical-history/?patient_id=${appointment.patient}`);
            console.log(response.data)
            setMedicalHistory(response.data);
            setSelectedAppointment(appointment);
        } catch (error) {
            console.error("Error fetching medical history:", error);
        }
    };

    const validatePrescription = () => {
        let newErrors = {};
        if (!prescriptionData.diagnosis || prescriptionData.diagnosis.length < 5) {
            newErrors.diagnosis = "Diagnosis must be at least 5 characters long.";
        }
        if (prescriptionData.medicines.length === 0 && prescriptionData.lab_tests.length === 0) {
            newErrors.selection = "At least one medicine or lab test must be selected.";
        }
        if (prescriptionData.notes.length > 500) {
            newErrors.notes = "Notes cannot exceed 500 characters.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreatePrescription = async () => {
        if (!validatePrescription()) return;

        try {
            // Prepare medicines data with dosage and frequency
            const medicinesData = prescriptionData.medicines.map(medicine => ({
                id: medicine.value,
                dosage: medicine.dosage,
                frequency: medicine.frequency,
                quantity: medicine.quantity,
            }));

            // Prepare lab tests data with test_date
            const labTestsData = prescriptionData.lab_tests.map(labTest => ({
                id: labTest.value,
                test_date: labTest.test_date,
            }));

            // Send the request to create the prescription
            await axiosPrivate.post("/prescriptions/", {
                patient: selectedAppointment.patient,
                doctor: selectedAppointment.doctor,
                appointment: selectedAppointment.id,
                diagnosis: prescriptionData.diagnosis,
                medicines: medicinesData,
                lab_tests: labTestsData,
                notes: prescriptionData.notes,
            });

            alert("Prescription created successfully!");
            setPrescriptionData({ diagnosis: "", medicines: [], lab_tests: [], notes: "" });

            // Fetch updated medical history
            const updatedMedicalHistory = await axiosPrivate.get(`/medical-history/?patient_id=${selectedAppointment.patient}`);
            setMedicalHistory(updatedMedicalHistory.data);
        } catch (error) {
            console.error("Error creating prescription:", error);
        }
    };

    return (
        <div className="container">
            <h1 className="header">Doctor's Dashboard</h1>
            <h2 className="subHeader">View Appointments</h2>
            <div>
                <button className="button"
                onClick={()=>setShowFilters(!showFilters)}>
                    {showFilters? 'Hide Filters': 'Show Filters'}
                </button>
                {showFilters && 
                    <div className="filters-panel">
                    <input 
                    type="text" 
                    placeholder="Search Patient" 
                    value={filters.patient_name}
                    onChange={(e) => {
                        setFilters({ ...filters, patient_name: e.target.value })
                        setCurrentPage(1); // reset to first page when filter changes
                    }}
                    />
                    <input 
                    type="date"
                    value={filters.start_time}
                    onChange={(e) => {
                        setFilters({ ...filters, start_time: e.target.value })
                        setCurrentPage(1);
                    }}
                    />
                    <select
                    value={filters.status}
                    onChange={(e) => {
                        setFilters({ ...filters, status: e.target.value })
                        setCurrentPage(1);
                    }}
                    >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    </select>
                    <button className="button"
                    onClick={()=>setFilters({
                        status:'',
                        patient_name:'',
                        start_time:''
                      })}>
                        Reset Filters
                    </button>
                </div>
                }
            </div>
            {appointments.length > 0?
            (<div>
                <ol className="appointmentList">
                    {appointments.map((appointment) => (
                        <li key={appointment.id} className="appointmentItem">
                            <div
                                className="appointmentCard"
                                onClick={() => handleAppointmentClick(appointment)}
                            >
                                <p className="appointmentText">
                                    <strong>{appointment.patient_name}</strong> - {formatDateTime(appointment.start_time)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
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
            </div>)
            : 
            (<div>
                <p>No Appointments found.</p>
            </div>)}
            {selectedAppointment && (
                <div className="patientDetails">
                    <h3 className="sectionHeader">Patient Details</h3>
                    <p className="patientName">Name: {selectedAppointment.patient_name}</p>
                    <p className="sectionHeader">Medical History:</p>
                    <ul className="medicalHistoryList">
                        {medicalHistory.map((history) => (
                            <li key={history.id} className="medicalHistoryItem">
                                <strong>Diagnosis:</strong> {history.diagnosis}<br />
                                <strong>Notes:</strong> {history.medical_notes}<br />

                                {/* Display Medicines */}
                                {history.prescription && history.prescription.medicines && history.prescription.medicines.length > 0 && (
                                    <div>
                                        <strong>Medicines:</strong>
                                        <ul>
                                            {history.prescription.medicines.map((medicine, index) => (
                                                <li key={index}>
                                                    {medicine.medicine_name} - {medicine.dosage} ({medicine.frequency}) <br/>quantity : {medicine.quantity}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Display Lab Tests */}
                                {history.prescription && history.prescription.lab_tests && history.prescription.lab_tests.length > 0 && (
                                    <div>
                                        <strong>Lab Tests:</strong>
                                        <ul>
                                            {history.prescription.lab_tests.map((labTest, index) => (
                                                <li key={index}>
                                                    {labTest.test_name} - {labTest.test_date}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="prescriptionForm">
                        <h3 className="sectionHeader">Create Prescription</h3>
                        <textarea
                            name="diagnosis"
                            value={prescriptionData.diagnosis}
                            onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })}
                            placeholder="Enter diagnosis"
                            className="textarea"
                        />
                        {errors.diagnosis && <p className="error">{errors.diagnosis}</p>}

                        <textarea
                            name="notes"
                            value={prescriptionData.notes}
                            onChange={(e) => setPrescriptionData({ ...prescriptionData, notes: e.target.value })}
                            placeholder="Enter prescription notes"
                            className="textarea"
                        />
                        {errors.notes && <p className="error">{errors.notes}</p>}

                        <div className="selectContainer">
                            <label className="label">Medicines:</label>
                            <Select
                                isMulti
                                options={medicineOptions}
                                value={prescriptionData.medicines}
                                onChange={(selectedOptions) =>
                                    setPrescriptionData({ ...prescriptionData, medicines: selectedOptions })
                                }
                                placeholder="Select medicines"
                                styles={customStyles}
                            />
                            {prescriptionData.medicines.map((medicine) => (
                                <div key={medicine.value} className="medicineDetails">
                                    <p>{medicine.label}</p>
                                    <input
                                        type="text"
                                        placeholder="Dosage"
                                        onChange={(e) => {
                                            const updatedMedicines = prescriptionData.medicines.map(m =>
                                                m.value === medicine.value ? { ...m, dosage: e.target.value } : m
                                            );
                                            setPrescriptionData({ ...prescriptionData, medicines: updatedMedicines });
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Frequency"
                                        onChange={(e) => {
                                            const updatedMedicines = prescriptionData.medicines.map(m =>
                                                m.value === medicine.value ? { ...m, frequency: e.target.value } : m
                                            );
                                            setPrescriptionData({ ...prescriptionData, medicines: updatedMedicines });
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Quantity"
                                        onChange={(e) => {
                                            const updatedMedicines = prescriptionData.medicines.map(m =>
                                                m.value === medicine.value ? { ...m, quantity: e.target.value } : m
                                            );
                                            setPrescriptionData({ ...prescriptionData, medicines: updatedMedicines });
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="selectContainer">
                            <label className="label">Lab Tests:</label>
                            <Select
                                isMulti
                                options={labTestOptions}
                                value={prescriptionData.lab_tests}
                                onChange={(selectedOptions) =>
                                    setPrescriptionData({ ...prescriptionData, lab_tests: selectedOptions })
                                }
                                placeholder="Select lab tests"
                                styles={customStyles}
                            />
                            {prescriptionData.lab_tests.map((labTest) => (
                                <div key={labTest.value} className="labTestDetails">
                                    <p>{labTest.label}</p>
                                    <input
                                        type="date"
                                        onChange={(e) => {
                                            const updatedLabTests = prescriptionData.lab_tests.map(lt =>
                                                lt.value === labTest.value ? { ...lt, test_date: e.target.value } : lt
                                            );
                                            setPrescriptionData({ ...prescriptionData, lab_tests: updatedLabTests });
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <button className="button" onClick={handleCreatePrescription}>
                            Create Prescription
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default withDoctorAuth(DoctorPage);