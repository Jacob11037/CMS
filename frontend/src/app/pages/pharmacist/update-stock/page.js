'use client';

import withPharmacistAuth from '@/app/middleware/withPharmacistAuth';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';

function UpdateStock() {
  const [medicine, setMedicine] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [result, setResult] = useState('');

  const updateStock = () => {
    if (!medicine.trim() || isNaN(newQuantity) || newQuantity < 0) {
      setResult('Please enter a valid medicine name and quantity.');
      return;
    }

    let stockData = localStorage.getItem("stockData");
    let stock = stockData ? JSON.parse(stockData) : [];

    let stockItem = stock.find(med => med.name.toLowerCase() === medicine.toLowerCase());
    if (stockItem) {
      stockItem.quantity = parseInt(newQuantity);
      setResult(`✅ Updated stock for ${medicine}: ${newQuantity}`);
    } else {
      setResult(`❌ Medicine ${medicine} not found in stock.`);
      return;
    }

    localStorage.setItem("stockData", JSON.stringify(stock));
    setMedicine('');
    setNewQuantity('');
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">✏️ Update Medicine Stock</h2>
      <div className="card p-4 shadow">
        <h4 className="mb-3">Update Existing Stock</h4>
        <label htmlFor="medicineName" className="form-label">Medicine Name:</label>
        <input type="text" id="medicineName" className="form-control mb-3" placeholder="e.g. Paracetamol" value={medicine} onChange={(e) => setMedicine(e.target.value)} />
        <label htmlFor="quantity" className="form-label">New Quantity:</label>
        <input type="number" id="quantity" className="form-control mb-3" min="0" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} />
        <button className="btn btn-warning w-100" onClick={updateStock}>Update Stock</button>
        {result && <div className="alert alert-info mt-3 text-center">{result}</div>}
      </div>
      <div className="text-center mt-4">
        <button className="btn btn-secondary" onClick={() => window.history.back()}>🔙 Back</button>
      </div>
    </div>
  );
}

export default withPharmacistAuth(UpdateStock);
