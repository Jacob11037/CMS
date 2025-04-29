import React from 'react';
import PharmacistDashboard from './PharmacistDashboard';
import Dashboard from "./Dashboard/page.js"


function App() {
  return (
    <Router>
    
      <Route path="/dashboard" element={<Dashboard/>}/>
    </Router>
  );
}

export default App;
