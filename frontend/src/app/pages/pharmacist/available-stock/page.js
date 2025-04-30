'use client';

import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import withPharmacistAuth from '@/app/middleware/withPharmacistAuth';

const AvailableStock = () => {
  const [stock, setStock] = useState([]);

  useEffect(() => {
    const stockData = localStorage.getItem("stockData");
    if (stockData) {
      setStock(JSON.parse(stockData));
    }
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">📦 Available Medicine Stock</h2>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Medicine Name</th>
            <th>Stock Quantity</th>
          </tr>
        </thead>
        <tbody>
          {stock.length > 0 ? (
            stock.map((med, index) => (
              <tr key={index}>
                <td>{med.name}</td>
                <td>
                  {med.quantity} {med.quantity === 0 && <span className="text-danger fw-bold">(Out of Stock)</span>}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="text-center">No stock data available</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="text-center mt-3">
        <button className="btn btn-primary" onClick={() => window.history.back()}>Go Back</button>
      </div>
    </div>
  );
};

export default withPharmacistAuth(AvailableStock); // Or export based on role
