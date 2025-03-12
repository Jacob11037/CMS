'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import axiosPrivate from '../../../../../utils/axiosPrivate';

export default function ReceptionistProfilePage() {
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
    return <p>Loading...</p>; // Show loading while checking authentication
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Receptionist Profile</h2>
      {receptionistData ? (
        <div>
          <h3>{receptionistData.first_name} {receptionistData.last_name}</h3>
          <p>Email: {receptionistData.email}</p>
          <p>Phone: {receptionistData.phone}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
