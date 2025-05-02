// ManageMedicines.js (Frontend)
'use client';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ManageMedicines() {
  return (
    <div className="container mt-5 text-center">
      <h2 className="mb-4">Manage Medicines</h2>
      <div className="row mt-4 justify-content-center">

        <div className="col-md-6 col-lg-4">
          <Link href="/pharmacist/update-medicine">
            <button className="btn btn-primary btn-lg w-100 p-3 mb-3">
              Update Stock
            </button>
          </Link>
        </div>

        <div className="col-md-6 col-lg-4">
          <Link href="/pharmacist/available-medicine">
            <button className="btn btn-secondary btn-lg w-100 p-3 mb-3">
              Available Stock
            </button>
          </Link>
        </div>

        <div className="col-md-6 col-lg-4">
          <Link href="/pharmacist/add-medicine">
            <button className="btn btn-success btn-lg w-100 p-3 mb-3">
              Add Stock
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}