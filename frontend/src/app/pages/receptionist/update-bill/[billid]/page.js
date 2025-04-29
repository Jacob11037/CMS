'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import axiosPrivate from '../../../../../../utils/axiosPrivate';
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';
import { toast } from 'react-toastify';
import '../../../../styles/ViewAppointmentsPage.css'

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
        toast.error('Failed to fetch bill details');
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
      toast.success('Bill status updated successfully!');
      router.push('/pages/receptionist/view-bills');
    } catch (error) {
      setError('Failed to update bill');
      toast.error(error.response?.data?.message || 'Failed to update bill');
    }
  };

  if (isAuthenticated === null) {
    return <p className="loading">Loading...</p>;
  }

  return (
    <div className="container">
      <h1 className="header">Update Bill Status</h1>
      {error && <p className="error">{error}</p>}
      {bill ? (
        <form onSubmit={handleUpdateSubmit}>
          <div className="details">
            <p><strong>Appointment ID:</strong> {bill.appointment}</p>
            <p><strong>Amount:</strong> ${parseFloat(bill.amount).toFixed(2)}</p>
            <p><strong>Date:</strong> {new Date(bill.bill_date).toLocaleString()}</p>
          </div>
          <div className="form-group">
            <label htmlFor="paid">Payment Status</label>
            <select
              id="paid"
              value={paid ? 'true' : 'false'}
              onChange={(e) => setPaid(e.target.value === 'true')}
            >
              <option value="false">Unpaid</option>
              <option value="true">Paid</option>
            </select>
          </div>
          <div className="button-group">
            <button type="submit" className="button updateButton">Update Bill</button>
          </div>
        </form>
      ) : (
        <p>Loading bill details...</p>
      )}
    </div>
  );
}

export default withReceptionistAuth(UpdateBillPage);
