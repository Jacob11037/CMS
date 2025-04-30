'use client';
import withPharmacistAuth from '@/app/middleware/withPharmacistAuth';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import axiosPrivate from '../../../../../utils/axiosPrivate';

function AddStock() {
  const [searchTerm, setSearchTerm] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔍 Search medicines with debounce
  useEffect(() => {
    const search = async () => {
      if (searchTerm.length > 2) {
        setLoading(true);
        try {
          const response = await axiosPrivate.get(
            '/api/pharmacist/medicines/',
            { params: { search: searchTerm } }
          );
          setMedicines(response.data);
        } catch (error) {
          console.error('Search error:', error);
          setMedicines([]);
        } finally {
          setLoading(false);
        }
      } else {
        setMedicines([]);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ➕ Add stock
  const addStock = async () => {
    if (!selectedMedicine || isNaN(quantity) || quantity < 1) {
      setResult('Please select a medicine and enter a valid quantity.');
      return;
    }

    try {
      const response = await axiosPrivate.post(
        '/api/medicine/update-stock/', // ✅ Correct endpoint
        {
          medicine_id: selectedMedicine.id,
          quantity: parseInt(quantity)
        }
      );

      setResult(`Success: Added ${quantity} units to ${selectedMedicine.name}. New stock: ${response.data.stock}`);
      resetForm();
    } catch (error) {
      console.error('Update error:', error);
      setResult(`Error: ${error.response?.data?.message || 'Failed to update stock'}`);
    }
  };

  // 🔄 Reset form
  const resetForm = () => {
    setSelectedMedicine(null);
    setSearchTerm('');
    setQuantity('');
    setMedicines([]);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Add Stock</h2>
      <div className="card p-4">
        <h3 className="mb-3">Stock Management</h3>

        {/* 🔍 Search Input */}
        <div className="mb-3">
          <label htmlFor="medicineSearch" className="form-label">
            Search Medicine by Name or ID:
          </label>
          <div className="input-group">
            <input
              type="text"
              id="medicineSearch"
              className="form-control"
              placeholder="Type medicine name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && (
              <span className="input-group-text">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </span>
            )}
          </div>
        </div>

        {/* 🧾 Search Results */}
        {medicines.length > 0 && (
          <div className="mb-3 border rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {medicines.map(medicine => (
              <div
                key={medicine.id}
                className={`p-3 border-bottom cursor-pointer ${selectedMedicine?.id === medicine.id ? 'bg-light' : ''}`}
                onClick={() => setSelectedMedicine(medicine)}
              >
                <div className="d-flex justify-content-between">
                  <div>
                    <strong>{medicine.name}</strong> (ID: {medicine.id})
                  </div>
                  <div>Stock: {medicine.stock}</div>
                </div>
                <div className="text-muted small">{medicine.manufacturer}</div>
                <div className="text-end">Price: ${medicine.price}</div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Selected Medicine Details */}
        {selectedMedicine && (
          <div className="mb-3 p-3 bg-light rounded">
            <h5>Selected Medicine Details</h5>
            <div className="row">
              <div className="col-md-6">
                <p><strong>Name:</strong> {selectedMedicine.name}</p>
                <p><strong>ID:</strong> {selectedMedicine.id}</p>
                <p><strong>Manufacturer:</strong> {selectedMedicine.manufacturer}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Current Stock:</strong> {selectedMedicine.stock}</p>
                <p><strong>Price:</strong> ${selectedMedicine.price}</p>
                <p><strong>Requires Prescription:</strong> 
                  {selectedMedicine.requires_prescription ? ' Yes' : ' No'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ➕ Quantity Input */}
        <div className="mb-3">
          <label htmlFor="quantity" className="form-label">Quantity to Add:</label>
          <input
            type="number"
            id="quantity"
            className="form-control"
            min="1"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={!selectedMedicine}
          />
        </div>

        {/* 🔘 Action Buttons */}
        <div className="d-flex gap-2">
          <button 
            className="btn btn-success flex-grow-1"
            onClick={addStock}
            disabled={!selectedMedicine || !quantity}
          >
            Add Stock
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={resetForm}
          >
            Clear
          </button>
        </div>

        {/* ✅ Result Message */}
        {result && (
          <div className={`alert mt-3 ${result.startsWith('Success') ? 'alert-success' : 'alert-danger'}`}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

export default withPharmacistAuth(AddStock);
