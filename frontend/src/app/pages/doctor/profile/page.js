"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import axiosPrivate from "../../../../../utils/axiosPrivate";
import "../../../styles/doctorprofilepage.css"; // Import the CSS file
import withDoctorAuth from "@/app/middleware/withDoctorAuth";

const DoctorPage = () => {
    const [doctorData, setDoctorData] = useState(null);
    const [error, setError] = useState("");
    const router = useRouter(); // Initialize useRouter

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

    // Function to handle the "Appointments" button click
    const handleAppointmentsClick = () => {
        router.push("/pages/doctor/appointments");
    };

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="container">
            <h1 className="header">Doctor's Profile</h1>
            {doctorData ? (
                <div className="profileContainer">
                    <h3 className="profileHeader">{doctorData.first_name} {doctorData.last_name}</h3>
                    <p className="profileDetail"><strong>Email:</strong> {doctorData.email}</p>
                    <p className="profileDetail"><strong>Phone:</strong> {doctorData.phone}</p>
                    <p className="profileDetail"><strong>Department:</strong> {doctorData.department_name}</p>

                    {/* Add a button to navigate to /doctor/appointments */}
                    <button
                        className="button"
                        onClick={handleAppointmentsClick}
                    >
                        Appointments
                    </button>
                </div>
            ) : (
                <p className="loading">Loading...</p>
            )}
        </div>
    );
};

export default withDoctorAuth(DoctorPage);