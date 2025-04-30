'use client';

import PatientForm from '@/app/components/PatientForm';
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';


const RegisterPatient = () => {
  return <PatientForm />;
};

export default withReceptionistAuth(RegisterPatient);
