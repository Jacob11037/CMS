'use client';
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';
import axios from 'axios';

const ManageMedicine = () => {
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState('');

  const fetchMedicines = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/medicines/');
      setMedicines(response.data);
    } catch (err) {
      setError('Failed to load medicine data.');
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleUpdate = async (id, updatedStock, updatedDesc) => {
    try {
      await axios.patch(`http://localhost:8000/api/medicines/${id}/`, {
        stock: updatedStock,
        medicine_desc: updatedDesc,
      });
      fetchMedicines(); // Refresh list
    } catch (err) {
      alert('Failed to update medicine.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Manage Medicine Stock</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Manufacturer</th>
            <th>Price</th>
            <th>Description</th>
            <th>Stock</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((med) => (
            <tr key={med.id}>
              <td>{med.medicine_name}</td>
              <td>{med.manufacturer}</td>
              <td>₹{med.price}</td>
              <td>
                <input
                  type="text"
                  defaultValue={med.medicine_desc}
                  onBlur={(e) => (med.newDesc = e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  defaultValue={med.stock}
                  onBlur={(e) => (med.newStock = parseInt(e.target.value))}
                />
              </td>
              <td>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() =>
                    handleUpdate(med.id, med.newStock ?? med.stock, med.newDesc ?? med.medicine_desc)
                  }
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-center mt-3">
        <button className="btn btn-primary" onClick={() => window.history.back()}>🔙 Back</button>
      </div>
    </div>
  );
};

export default withReceptionistAuth(ManageMedicine);
