// src/services/pharmacist.js

import axiosPrivate from "utils/axiosPrivate";



// 🔍 Search Medicines
export const searchMedicines = async (searchQuery = '') => {
  const response = await axiosPrivate.get(`/pharmacist/medicine/?search=${searchQuery}`);
  return response.data;
};

// ➕ Update/Add Stock
export const updateMedicineStock = async (medicineId, quantity) => {
  const response = await axiosPrivate.post(`/pharmacist/medicine/update-stock/`, {
    medicine_id: medicineId,
    quantity: quantity,
  });
  return response.data;
};

// ✏️ Update Medicine Details
export const updateMedicine = async (medicineId, updateData) => {
  const response = await axiosPrivate.put(`/pharmacist/medicine/${medicineId}/update/`, updateData);
  return response.data;
};

// ❌ Delete Medicine
export const deleteMedicine = async (medicineId) => {
  const response = await axiosPrivate.delete(`/pharmacist/medicine/${medicineId}/delete/`);
  return response.data;
};
