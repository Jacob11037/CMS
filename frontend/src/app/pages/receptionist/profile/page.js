'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import "../../../styles/ReceptionistProfilePage.css"; // Import the CSS file
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';

function ReceptionistProfilePage() {
  const [receptionistData, setReceptionistData] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth(); // Get authentication state

  // Check if isAuthenticated is not null before proceeding
  useEffect(() => {
    if (isAuthenticated === null) {
      return; // Do not proceed until isAuthenticated is determined
    }

    if (!isAuthenticated) {
      router.push('/pages/login'); // Redirect to login if not authenticated
      return;
    }

    const fetchReceptionistProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken'); 
        const response = await axiosPrivate.get('receptionist/profile/');
        setReceptionistData(response.data);
      } catch (error) {
        console.log(error)
        if (error.response) {
          // Check if the error is due to the user not having receptionist access
          if (error.response.status === 403) {
            // Redirect or show a permission error message
            router.push('/pages/forbidden'); // Redirect to a "Forbidden" page
          } else {
            setError('An error occurred while fetching receptionist profile');
          }
        } else {
          console.error(error);
          setError('An error occurred while fetching receptionist profile');
        }
      }
    };

    fetchReceptionistProfile();
  }, [isAuthenticated, router]);

  if (isAuthenticated === null) {
    return <p className="loading">Loading...</p>; // Show loading while checking authentication
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="container">
      <h1 className="header">Receptionist Profile</h1>
      {receptionistData ? (
        <div className="profileContainer">
          <h3 className="profileHeader">{receptionistData.first_name} {receptionistData.last_name}</h3>
          <p className="profileDetail"><strong>Email:</strong> {receptionistData.email}</p>
          <p className="profileDetail"><strong>Phone:</strong> {receptionistData.phone}</p>

          <button
            className="button"
            onClick={() => router.push('/pages/receptionist/view-appointments')}
          >
            Appointments
          </button>
          <br />
          <button
            className="button"
            onClick={() => router.push('/pages/receptionist/appointment')}
          >
            Create an Appointment
          </button>
          <br />
          <button
            className="button"
            onClick={() => router.push('/pages/register-patient')}
          >
            Register Patient
            </button>
        </div>
      ) : (
        <p className="loading">Loading...</p>
      )}
    </div>
  );
};

export default withReceptionistAuth(ReceptionistProfilePage);
