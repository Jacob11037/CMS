'use client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/pharmacist/dashboard.css'
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';

function PharmacistDashboard() {
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundImage: "url('/background.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
        <div className="container-fluid">
          <h2 className="navbar-brand">PHARMACY</h2>
          <div className="d-flex">
            <a href="available-stock" className="btn btn-outline-light me-2">Available Stock</a>
            <a href="add-stock" className="btn btn-outline-light me-2">Add Stocks</a>
            <a href="update-stock" className="btn btn-outline-light me-2">Update Stocks</a>
            <a href="medicine-stocks-billing" className="btn btn-outline-light me-2">Medicine Stocks Billing</a>
            <a href="signup" className="btn btn-danger">Log Out</a>
          </div>
        </div>
      </nav>

      <div className="d-flex flex-grow-1 justify-content-center align-items-center text-center p-5">
        <h1 className="text-white fw-bold shadow">Welcome Pharmacist..</h1>
      </div>
    </div>
  );
};

export default withReceptionistAuth(PharmacistDashboard);