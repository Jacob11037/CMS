// services/labService.js

import axiosPrivate from "../../../utils/axiosPrivate";

export const getDashboardStats = async () => {
  const response = await axiosPrivate.get('/labtechnician/dashboard/');
  return response.data;
};

export const getPendingTests = async () => {
  const response = await axiosPrivate.get('/labtechnician/pending-tests/');
  return response.data;
};

export const getCompletedToday = async () => {
  const response = await axiosPrivate.get('/labtechnician/reports/?status=completed&today=true');
  return response.data;
};

export const submitTestResult = async (testId, resultData) => {
  const response = await axiosPrivate.put(`/labtechnician/labtests/results/${testId}/`, {
    result_data: resultData,
    status: 'Completed'
  });
  return response.data;
};

export const generateLabReport = async (prescriptionId, testResults, technicianId) => {
  const response = await axiosPrivate.post('/labtechnician/generate-report/', {
    prescription_id: prescriptionId,
    test_results: testResults,
    generated_by: technicianId
  });
  return response.data;
};

export const downloadReport = async (reportId) => {
  const response = await axiosPrivate.get(`/labtechnician/reports/${reportId}/download/`, {
    responseType: 'blob'
  });
  return response.data;
};

// Fetch patients
export const fetchPatients = async () => {
  const response = await axiosPrivate.get("/patients/");
  return response.data;
};

// Fetch doctors
export const fetchDoctors = async () => {
  const response = await axiosPrivate.get("/doctors/");
  return response.data;
};



// Fetch all lab tests
export const fetchLabTests = async () => {
  const response = await axiosPrivate.get('/labtechnician/lab-tests/');
  return response.data;
};

// Fetch single lab test details
export const fetchLabTestById = async (id) => {
  const response = await axiosPrivate.get(`/labtechnician/labtests/${id}/`);
  return response.data;
};

// Update a lab test result (for Update button)
export const updateLabTestResult = async (id, updatedData) => {
  const response = await axiosPrivate.patch(`/labtechnician/labtests/results/${id}/`, updatedData);
  return response.data;
};

// Cancel a lab test (you can just set status to 'Cancelled' manually)
export const cancelLabTest = async (id) => {
  const response = await axiosPrivate.put(`/labtechnician/labtests/results/${id}/`, { status: 'Cancelled' });
  return response.data;
};

export const createLabTest = async (newData) => {
  const response = await axiosPrivate.post('/labtechnician/labtests/', newData);
  return response.data;
};
