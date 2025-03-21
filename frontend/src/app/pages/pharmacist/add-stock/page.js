'use client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';

export default function AddMedicine() {
  const [medicine, setMedicine] = useState('');
  const [quantity, setQuantity] = useState('');
  const [result, setResult] = useState('');

  const addStock = () => {
    if (!medicine.trim() || isNaN(quantity) || quantity < 1) {
      setResult('Please enter a valid medicine name and quantity.');
      return;
    }

    let stockData = localStorage.getItem("stockData");
    let stock = stockData ? JSON.parse(stockData) : [];

    let stockItem = stock.find(med => med.name.toLowerCase() === medicine.toLowerCase());
    if (stockItem) {
      stockItem.quantity += parseInt(quantity);
      setResult(`Updated stock for ${medicine}: ${stockItem.quantity}`);
    } else {
      stock.push({ name: medicine, quantity: parseInt(quantity) });
      setResult(`Added new medicine ${medicine} with stock: ${quantity}`);
    }

    localStorage.setItem("stockData", JSON.stringify(stock));
    setMedicine('');
    setQuantity('');
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Add Medicine</h2>
      <div className="card p-4">
        <h3 className="mb-3">Add Stock</h3>
        <label htmlFor="addMedicine" className="form-label">Medicine Name:</label>
        <input type="text" id="addMedicine" className="form-control mb-3" placeholder="Enter medicine name" value={medicine} onChange={(e) => setMedicine(e.target.value)} />
        <label htmlFor="addQuantity" className="form-label">Quantity:</label>
        <input type="number" id="addQuantity" className="form-control mb-3" min="1" placeholder="Enter quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <button className="btn btn-success" onClick={addStock}>Add Stock</button>
        {result && <div className="alert alert-info mt-3">{result}</div>}
      </div>
      <div className="text-center mt-3">
        <button className="btn btn-primary" onClick={() => window.history.back()}>Go Back</button>
      </div>
    </div>
  );
}