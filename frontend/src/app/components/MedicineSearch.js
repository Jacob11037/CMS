import React, { useState, useEffect } from 'react';
import axiosPrivate from './services/axiosPrivate';  // Correct import path

const MedicineSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (searchTerm.length > 2) {  // Only search when term is more than 2 characters
        setLoading(true);
        console.log('🔍 Searching:', searchTerm);  // For debugging
        console.log('📡 Requesting:', '/api/pharmacist/medicines/?search=' + searchTerm);  // For debugging

        try {
          // Make an authenticated request using axiosPrivate
          const response = await axiosPrivate.get(
            '/api/pharmacist/medicines/',  // API endpoint
            { params: { search: searchTerm } }  // Send search term as query parameter
          );
          setMedicines(response.data);  // Store the fetched medicines
        } catch (error) {
          console.error('Search error:', error);
          setMedicines([]);  // Clear the medicine list on error
        } finally {
          setLoading(false);  // Stop loading
        }
      } else {
        setMedicines([]);  // Clear medicines if searchTerm length is less than 2
      }
    };

    // Set a delay before initiating the search (debouncing)
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);  // Clean up the timer when the component unmounts or searchTerm changes
  }, [searchTerm]);  // Effect runs every time searchTerm changes

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}  // Update searchTerm on input change
        placeholder="Search Medicines..."
      />
      {loading && <p>Loading...</p>}
      <ul>
        {medicines.map((medicine) => (
          <li key={medicine.id}>{medicine.name}</li>  // Display medicine names
        ))}
      </ul>
    </div>
  );
};

export default MedicineSearch;
