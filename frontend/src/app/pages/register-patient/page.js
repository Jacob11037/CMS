'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import PatientForm from '../..//components/PatientForm';
import axiosPrivate from '/utils/axiosPrivate';


const RegisterPatient = () => {
  const { isAuthenticated } = useAuth();
  const [isReceptionist, setIsReceptionist] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === null) return; // Wait for auth check

    if (!isAuthenticated) {
      router.push('/pages/login'); // Redirect if not logged in
      return;
    }

    const checkRole = async () => {
      try {
        const response = await axiosPrivate.get('/auth/check-role/');
        setIsReceptionist(response.data.role === 'receptionist');
      } catch (error) {
        console.error('Error checking role:', error);
        setIsReceptionist(false); // Default to no access on error
      }
    };

    checkRole();
  }, [isAuthenticated, router]);

  if (isAuthenticated === null || isReceptionist === null) {
    return <p>Loading...</p>; // Show loading while checking
  }

  if (!isReceptionist) {
    return <p>Unauthorized. You do not have access to this page.</p>;
  }

  return <PatientForm />;
};

export default RegisterPatient;
