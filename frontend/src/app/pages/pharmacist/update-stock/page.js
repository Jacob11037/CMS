'use client';
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';

function UpdateMedicineStock() {
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
      setResult(`Updated stock for ${medicine}: ${newQuantity}`);
    } else {
      setResult(`Medicine ${medicine} not found in stock.`);
      return;
    }

    localStorage.setItem("stockData", JSON.stringify(stock));
    setMedicine('');
    setNewQuantity('');
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Update Medicine Stock</h2>
      <div className="card p-4">
        <h3 className="mb-3">Update Stock</h3>
        <label htmlFor="updateMedicine" className="form-label">Medicine Name:</label>
        <input type="text" id="updateMedicine" className="form-control mb-3" placeholder="Enter medicine name" value={medicine} onChange={(e) => setMedicine(e.target.value)} />
        <label htmlFor="updateQuantity" className="form-label">New Quantity:</label>
        <input type="number" id="updateQuantity" className="form-control mb-3" min="0" placeholder="Enter new quantity" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} />
        <button className="btn btn-warning" onClick={updateStock}>Update Stock</button>
        {result && <div className="alert alert-info mt-3">{result}</div>}
      </div>
      <div className="text-center mt-3">
        <button className="btn btn-primary" onClick={() => window.history.back()}>Go Back</button>
      </div>
    </div>
  );
};

export default withReceptionistAuth(UpdateMedicineStock);
