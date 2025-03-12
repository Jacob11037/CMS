'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';  // Import useRouter for redirection
import axiosPrivate from '../../../../utils/axiosPrivate';
import { useAuth } from '../../context/AuthContext';

export default function RegisterReceptionist() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const { isAuthenticated } = useAuth(); // Get authentication state
  const router = useRouter(); // Initialize the router for redirection
  const [isLoading, setIsLoading] = useState(true); // New loading state

  // Fetch and check authentication state with a delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isAuthenticated === null) {
        return;
      }

      if (!isAuthenticated) {
        router.push('/pages/login'); // Redirect to login if not authenticated
        return;
      }

      setIsLoading(false); // After waiting, set loading to false
    }, 50); // Wait 500ms (0.05 second) before checking the authentication

    return () => clearTimeout(timeoutId); // Clear timeout on component unmount
  }, [isAuthenticated, router]);

  // Show a loading screen while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;  // Show loading screen during authentication check
  }

  if (isAuthenticated === null) {
    return <div>Loading...</div>;  // Prevent content rendering until authentication is checked
  }

  if (!isAuthenticated) {
    return <div>You are not authorized to view this page.</div>;  // If not authenticated, show message
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
    // Handle form submission using axiosPrivate
    try {
      const response = await axiosPrivate.post('receptionist/register/', formData);
      console.log(response.data);  // Log the response data from the API
      alert('Receptionist registered successfully');
    } catch (error) {
      console.error('Error during form submission:', error.response || error.message);
    }
  };

  return (
    <div>
      <h1>Register Receptionist</h1>
    
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
