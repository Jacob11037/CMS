'use client';
import React, { useEffect, useState } from 'react';
import { searchMedicines, updateMedicineStock, deleteMedicine } from '../../../../services/pharmacist';
import { toast } from 'react-hot-toast';

export default function ManageMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stockToAdd, setStockToAdd] = useState(5); // Default to adding 5 stock

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const data = await searchMedicines();
      setMedicines(data);
    } catch (error) {
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (id) => {
    try {
      await updateMedicineStock(id, stockToAdd); // Use the dynamic stock value
      toast.success('Stock updated!');
      loadMedicines(); // Refresh list
    } catch (error) {
      toast.error('Error updating stock');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMedicine(id);
      toast.success('Medicine deleted!');
      loadMedicines();
    } catch (error) {
      toast.error('Error deleting medicine');
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Manage Medicines</h2>
      <div className="row">
        {loading ? (
          <p>Loading medicines...</p>
        ) : (
          medicines.map((med) => (
            <div key={med.id} className="col-md-4">
              <div className="card p-3 mb-3">
                <h5>{med.name}</h5>
                <p>Manufacturer: {med.manufacturer}</p>
                <p>Stock: {med.stock}</p>
                <div className="input-group mb-3">
                  <input
                    type="number"
                    className="form-control"
                    value={stockToAdd}
                    onChange={(e) => setStockToAdd(Number(e.target.value))}
                    min="1"
                  />
                  <button className="btn btn-success me-2" onClick={() => handleAddStock(med.id)}>
                    Add Stock
                  </button>
                </div>
                <button className="btn btn-danger" onClick={() => handleDelete(med.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
