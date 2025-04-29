import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function LabTechnicianDashboard() {
  return (
    <div className="container mt-5">
      <h2 className="mb-4">Lab Technician Dashboard</h2>
      <div className="row">
        {/* Lab Tests Box */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-primary">
            <div className="card-body">
              <h5 className="card-title">🧪 Lab Tests</h5>
              <p className="card-text">View and manage lab tests.</p>
              <Link href="/pages/labtechnician/viewlabtest" className="btn btn-primary">
                Go to Lab Tests
              </Link>
            </div>
          </div>
        </div>

        {/* Generate Bill Box */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-success">
            <div className="card-body">
              <h5 className="card-title">💳 Generate Bill</h5>
              <p className="card-text">Generate and manage patient bills.</p>
              <Link href="/pages/labtechnician/create-bill" className="btn btn-success">
                Go to Billing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
