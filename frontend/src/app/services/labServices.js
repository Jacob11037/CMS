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


