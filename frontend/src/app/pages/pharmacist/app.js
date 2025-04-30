import React from 'react';
import PharmacistDashboard from './PharmacistDashboard';
import Dashboard from "./Dashboard/page.js"
import EditMedicines from './Dashboard/EditMedicine';


function App() {
  return (
    <Router>
    
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route path="/EditMedicine" element={<EditMedicines/>}/>

    </Router>
  );
}

export default App;
