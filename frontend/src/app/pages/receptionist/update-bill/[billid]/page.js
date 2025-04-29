'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import axiosPrivate from '../../../../../../utils/axiosPrivate';
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';

function UpdateBillPage({ params }) {
  const { billid } = use(params);
  const [bill, setBill] = useState(null);
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated === null) return;

    if (!isAuthenticated) {
      router.push('/pages/login');
      return;
    }

    const fetchBillDetails = async () => {
      try {
        const response = await axiosPrivate.get(`/consultation-bills/${billid}/`);
        setBill(response.data);
        setPaid(response.data.paid);
      } catch (error) {
        setError('Failed to fetch bill details');
        toast.error('Failed to fetch bill details', { position: "top-right", autoClose: 3000 });
      }
    };

    fetchBillDetails();
  }, [isAuthenticated, router, billid]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosPrivate.patch(`/consultation-bills/${billid}/`, {
        paid: paid,
      });
      toast.success('Bill status updated successfully!', { position: "top-right", autoClose: 3000 });
      router.push('/pages/receptionist/view-bills');
    } catch (error) {
      setError('Failed to update bill');
      toast.error(error.response?.data?.message || 'Failed to update bill', { position: "top-right", autoClose: 3000 });
    }
  };

  if (isAuthenticated === null) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 animate__animated animate__fadeInDown">Update Consultation Bill</h2>
      {error && <div className="alert alert-danger text-center">{error}</div>}

      {bill ? (
        <div className="card shadow-sm p-4 rounded-4 animate__animated animate__fadeInUp">
          <div className="mb-3">
            <p><strong>Appointment ID:</strong> {bill.appointment}</p>
            <p><strong>Amount:</strong> ₹{parseFloat(bill.amount).toFixed(2)}</p>
            <p><strong>Bill Date:</strong> {new Date(bill.bill_date).toLocaleString()}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={`badge ${paid ? 'bg-success' : 'bg-danger'}`}>
                {paid ? 'Paid' : 'Unpaid'}
              </span>
            </p>
          </div>

          <form onSubmit={handleUpdateSubmit}>
            <div className="mb-4">
              <label htmlFor="paid" className="form-label">Change Payment Status</label>
              <select
                id="paid"
                className="form-select"
                value={paid ? 'true' : 'false'}
                onChange={(e) => setPaid(e.target.value === 'true')}
              >
                <option value="false">Unpaid</option>
                <option value="true">Paid</option>
              </select>
            </div>

            <div className="d-flex justify-content-between">
              <button type="button" className="btn btn-secondary" onClick={() => router.push('/pages/receptionist/view-bills')}>
                ← Back to Bills
              </button>
              <button type="submit" className="btn btn-primary px-4">
                Update Bill
              </button>
            </div>
          </form>
        </div>
      ) : (
        <p className="text-center">Loading bill details...</p>
      )}
    </div>
  );
}

export default withReceptionistAuth(UpdateBillPage);
