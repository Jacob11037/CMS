'use client';
import { useState } from "react";
import axiosPrivate from "../../../utils/axiosPrivate";

const PatientForm = () => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        phone: "",
        email: "",
        address: ""
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);

    const validateForm = (formdata) => {
        const formErrors = {};
        const today = new Date();

        // First Name Validation
        if (!formdata.first_name.trim()) {
            formErrors.first_name = "First name cannot be empty.";
        } else if (formdata.first_name.trim().length < 2) {
            formErrors.first_name = "First name must be at least two characters.";
        }

        // Last Name Validation
        if (!formdata.last_name.trim()) {
            formErrors.last_name = "Last name cannot be empty.";
        } else if (formdata.last_name.trim().length < 2) {
            formErrors.last_name = "Last name must be at least two characters.";
        }

        // Email Validation
        if (!formdata.email.trim()) {
            formErrors.email = "Email cannot be empty.";
        } else if (!/\S+@\S+\.\S+/.test(formdata.email)) {
            formErrors.email = "Please enter a valid email address.";
        }

        // Date of Birth Validation
        const birthDate = new Date(formdata.date_of_birth);
        if (!formdata.date_of_birth) {
            formErrors.date_of_birth = "Date of birth cannot be empty.";
        } else if (birthDate >= today) {
            formErrors.date_of_birth = "Date of birth must be in the past.";
        }

        // Phone Validation
        if (!formdata.phone.trim()) {
            formErrors.phone = "Phone number cannot be empty.";
        } else if (!/^\d{7,15}$/.test(formdata.phone)) {
            formErrors.phone = "Enter a valid phone number (7-15 digits).";
        }

        // Address Validation
        if (!formdata.address.trim()) {
            formErrors.address = "Address cannot be empty.";
        }

        setFieldErrors(formErrors);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors("");
        setFieldErrors({});
        validateForm(formData);

        // Check if there are any errors in form
        if (Object.keys(fieldErrors).length > 0) {
            setLoading(false);
            return;
        }

        try {
            const response = await axiosPrivate.post('register-patient/', formData);
            console.log("Patient Registered:", response.data);
            alert("Patient Successfully Registered!")
        } catch (error) {
            setErrors("An error occurred while registering the patient.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Register Patient</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    First Name:
                    <input
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        value={formData.first_name}
                        onChange={handleChange}
                    />
                    {fieldErrors.first_name && <p>{fieldErrors.first_name}</p>}
                </label>

                <label>
                    Last Name:
                    <input
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        value={formData.last_name}
                        onChange={handleChange}
                    />
                    {fieldErrors.last_name && <p>{fieldErrors.last_name}</p>}
                </label>

                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {fieldErrors.email && <p>{fieldErrors.email}</p>}
                </label>

                <label>
                    Date of Birth:
                    <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                    />
                    {fieldErrors.date_of_birth && <p>{fieldErrors.date_of_birth}</p>}
                </label>

                <label>
                    Phone:
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    {fieldErrors.phone && <p>{fieldErrors.phone}</p>}
                </label>

                <label>
                    Address:
                    <textarea
                        name="address"
                        placeholder="Enter Address"
                        value={formData.address}
                        onChange={handleChange}
                    />
                    {fieldErrors.address && <p>{fieldErrors.address}</p>}
                </label>

                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>

                {errors && <p>{errors}</p>}
            </form>
        </div>
    );
};

export default PatientForm;
