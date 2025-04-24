"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosPrivate from "../../../../../utils/axiosPrivate";
import withDoctorAuth from "@/app/middleware/withDoctorAuth";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../styles/doctorprofilepage.css";

const DoctorPage = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const response = await axiosPrivate.get("/doctor/profile/");
        setDoctorData(response.data);
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
        setError("Failed to fetch doctor profile");
      }
    };

    fetchDoctorProfile();
  }, []);

  const handleAppointmentsClick = () => {
    router.push("/pages/doctor/appointments");
  };

  if (error) {
    return <div className="alert alert-danger text-center mt-5">{error}</div>;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white text-center py-5">
        <div className="container">
          <h1 className="display-5 fw-bold">Doctor Profile</h1>
          {doctorData ? (
          <p className="lead">Welcome, Dr. {doctorData.first_name} {doctorData.last_name}</p>
          ):(<p className="lead">Welcome</p>)}
        </div>
      </section>

      {/* Profile Card */}
      <div className="container py-5">
        {doctorData ? (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow-lg border-0 rounded-4 p-4 profile-card">
                <div className="row g-0 align-items-center">
                  {/* Placeholder image or avatar */}
                  <div className="col-md-4 text-center">
                    <img
                      src="/img/team-3.jpg" 
                      alt="Doctor"
                      className="img-fluid rounded-circle border border-3 border-primary p-1 doctor-avatar"
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <h3 className="card-title text-primary mb-2">
                        Dr. {doctorData.first_name} {doctorData.last_name}
                      </h3>
                      <p className="text-muted mb-1">{doctorData.department_name}</p>
                      <hr />
                      <p className="mb-2"><strong>Email:</strong> {doctorData.email}</p>
                      <p className="mb-2"><strong>Phone:</strong> {doctorData.phone}</p>

                      <div className="mt-4">
                        <button
                          className="btn btn-outline-primary btn-lg rounded-pill px-4"
                          onClick={handleAppointmentsClick}
                        >
                          View Appointments
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3">Loading your profile...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default withDoctorAuth(DoctorPage);
