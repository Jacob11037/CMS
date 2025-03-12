'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import axiosPrivate from '../../../../../utils/axiosPrivate';

export default function DoctorProfilePage() {
  const [doctorData, setDoctorData] = useState(null);
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

    const fetchDoctorProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken'); 
        const response = await axiosPrivate.get('doctor/profile/');
        setDoctorData(response.data);
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          setError('Error fetching doctor profile: ' + error.response.data.detail);
        } else {
          console.error(error);
          setError('An error occurred while fetching doctor profile');
        }
      }
    };
    

    fetchDoctorProfile();
  }, [isAuthenticated, router]);

  if (isAuthenticated === null) {
    return <p>Loading...</p>; // Show loading while checking authentication
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Doctor Profile</h2>
      {doctorData ? (
        <div>
          <h3>{doctorData.first_name} {doctorData.last_name}</h3>
          <p>Email: {doctorData.email}</p>
          <p>Phone: {doctorData.phone}</p>
          <p>Department: {doctorData.department_id}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
