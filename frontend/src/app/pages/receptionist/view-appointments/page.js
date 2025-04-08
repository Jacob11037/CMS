"use client";
import withReceptionistAuth from "../../../middleware/withReceptionistAuth";
import ViewAppointmentsPage from "../../../components/ViewAppointmentsPage";


function Appointments() {
  return <ViewAppointmentsPage />;
}

export default withReceptionistAuth(Appointments)
