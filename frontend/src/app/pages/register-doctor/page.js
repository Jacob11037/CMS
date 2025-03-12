'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';  // Import useRouter for redirection
import axiosPrivate from '../../../../utils/axiosPrivate';
import { useAuth } from '../../context/AuthContext';

export default function RegisterDoctor() {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
  });
  const { isAuthenticated } = useAuth(); // Get authentication state
  const router = useRouter(); // Initialize the router for redirection
  const [isLoading, setIsLoading] = useState(true); // New loading state

  // Fetch the departments and check authentication
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isAuthenticated === null) {
        return;
      }

      if (!isAuthenticated) {
        router.push('/pages/login'); // Redirect to login if not authenticated
        return;
      }

      const fetchDepartments = async () => {
        try {
          const response = await axiosPrivate.get('departments/');
          setDepartments(response.data);  // Set the departments from the API response
        } catch (error) {
          console.error('Error fetching departments:', error);
        }
      };

      fetchDepartments();  // Call the function when the component mounts
      setIsLoading(false); // After waiting, set loading to false
    }, 50); // Wait 50ms (0.05 second) before checking the authentication

    return () => clearTimeout(timeoutId); // Clear timeout on component unmount
  }, [isAuthenticated]); // Run the effect again if authentication state changes

  // Show a loading screen while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;  // Show loading screen during authentication check
  }

  if (isAuthenticated === null) {
    return <div>Loading...</div>;  // Prevent content rendering until authentication is checked
  }

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosPrivate.post('doctor/register/', formData);
      console.log(response.data);  // Log the response data from the API
      alert('Doctor registered successfully');
    } catch (error) {
      console.error('Error during form submission:', error.response || error.message);
    }
  };

  return (
    <div>
      <h1>Register Doctor</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Department</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">Select a department</option>
            {departments.map((department) => (
              <option key={department.pk} value={department.pk}>
                {department.department_name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
