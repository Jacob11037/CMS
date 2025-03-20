'use client';
import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const masterList = [
  { name: "Paracetamol", generic: "Acetaminophen", company: "MediCorp" },
  { name: "Ibuprofen", generic: "Ibuprofen", company: "HealthPlus" },
  { name: "Amoxicillin", generic: "Amoxicillin", company: "PharmaCo" },
  { name: "Ciprofloxacin", generic: "Ciprofloxacin", company: "MediPlus" },
  { name: "Cetirizine", generic: "Cetirizine Hydrochloride", company: "HealthCorp" },
  { name: "Metformin", generic: "Metformin Hydrochloride", company: "Glucare" },
  { name: "Aspirin", generic: "Acetylsalicylic Acid", company: "PainRelief" },
  { name: "Loratadine", generic: "Loratadine", company: "AllergyMed" },
  { name: "Ranitidine", generic: "Ranitidine Hydrochloride", company: "GastroCare" },
  { name: "Omeprazole", generic: "Omeprazole", company: "AcidRelief" }
];

export default function MedicineOrdering() {
  const [medicine, setMedicine] = useState("");
  const [company, setCompany] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [orders, setOrders] = useState([]);
  const [patientID, setPatientID] = useState("");

  useEffect(() => {
    if (medicine) {
      const selectedMedicine = masterList.find((med) => med.name === medicine);
      setCompany(selectedMedicine ? selectedMedicine.company : "");
    }
  }, [medicine]);

  const orderMedicine = () => {
    if (quantity < 1) {
      alert("Please enter a valid quantity.");
      return;
    }
    
    const newOrder = {
      id: Date.now(),
      medicine,
      company,
      quantity,
      price: (Math.random() * 50 + 10).toFixed(2)
    };
    setOrders([...orders, newOrder]);
  };

  const updateOrder = (id) => {
    const newQuantity = prompt("Enter new quantity:");
    if (newQuantity && newQuantity > 0) {
      setOrders(orders.map(order => order.id === id ? { ...order, quantity: newQuantity } : order));
    } else {
      alert("Invalid quantity.");
    }
  };

  const deleteOrder = (id) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  const generateBill = () => {
    if (!patientID || orders.length === 0) {
      alert("Enter patient ID and order at least one medicine.");
      return;
    }
  };

  return (
    <div className="container-fluid bg-dark text-white min-vh-100 p-4" style={{ backgroundImage: "url('/background.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="row justify-content-center">
        <div className="col-md-8 bg-dark bg-opacity-75 p-4 rounded">
          <h2 className="text-center mb-4">Medicine Ordering & Billing System</h2>
          
          <h3 className="text-center mb-3">Order Medicines</h3>
          <select value={medicine} onChange={(e) => setMedicine(e.target.value)} className="form-select mb-3">
            <option value="">Select Medicine</option>
            {masterList.map((med) => (
              <option key={med.name} value={med.name}>{med.name}</option>
            ))}
          </select>
          <input type="text" value={company} readOnly className="form-control mb-3" />
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" className="form-control mb-3" />
          <button onClick={orderMedicine} className="btn btn-primary w-100 mb-3">Order</button>
          
          <div className="mt-4">
            {orders.map(order => (
              <div key={order.id} className="card bg-light text-dark mb-3">
                <div className="card-body">
                  <strong>{order.medicine}</strong> - Company: {order.company} - Quantity: {order.quantity} - Price: ${order.price}
                  <button onClick={() => updateOrder(order.id)} className="btn btn-warning btn-sm ms-2">Update</button>
                  <button onClick={() => deleteOrder(order.id)} className="btn btn-danger btn-sm ms-2">Delete</button>
                </div>
              </div>
            ))}
          </div>
          
          <h3 className="text-center mt-4">Generate Bill</h3>
          <input type="text" placeholder="Patient ID or Name" value={patientID} onChange={(e) => setPatientID(e.target.value)} className="form-control mb-3" />
          <button onClick={generateBill} className="btn btn-success w-100">Generate Bill</button>
        </div>
      </div>
    </div>
  );
}