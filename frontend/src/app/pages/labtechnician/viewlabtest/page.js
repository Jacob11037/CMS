"use client";

import { useEffect, useState } from "react";
import { fetchLabTests, updateLabTestResult } from "@/app/services/labServices";
import { Button, Card, Input, Table } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import UpdateLabTestModal from "@/app/components/UpdateModal";



export default function ViewLabTestsPage() {
  const [labTests, setLabTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // ⬅️ Modal open state
  const [selectedLabTest, setSelectedLabTest] = useState(null); // ⬅️ Selected lab test for update
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);


  useEffect(() => {
    async function getLabTests() {
      try {
        const data = await fetchLabTests();
        setLabTests(data);
      } catch (error) {
        console.error(error);
      }
    }
    getLabTests();
  }, []);

  const handleOpenUpdate = (labTest) => {
    setSelectedLabTest(labTest);
    setIsModalOpen(true);
  };

  const handleCloseUpdate = () => {
    setIsModalOpen(false);
    setSelectedLabTest(null);
  };

  const handleCancelLabTest = async (labTestId) => {
    if (!confirm("Are you sure you want to cancel this lab test?")) return;
  
    try {
      await updateLabTestResult(labTestId, { status: "Cancelled" });
      await refreshLabTests(); // Refresh after update
    } catch (error) {
      console.error("Failed to cancel lab test", error);
    }
  };
  

  // Optional: refresh after update
  const refreshLabTests = async () => {
    try {
      const data = await fetchLabTests();
      setLabTests(data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredTests = labTests.filter((test) =>
    test.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.test_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-4">
      <h2 className="mb-4">Lab Tests</h2>

      <div className="d-flex justify-content-between align-items-center mb-4">
  <Input
    type="text"
    placeholder="Search by Patient or Test Name"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{ maxWidth: "300px" }}
  />
  <Button color="success" onClick={() => setIsAddModalOpen(true)}>
    + Add Lab Test
  </Button>
</div>


      <Card body>
        <div className="table-responsive">
          <Table bordered hover>
            <thead className="thead-dark">
              <tr>
                <th>Test ID</th>
                <th>Patient Name</th>
                <th>Test Name</th>
                <th>Prescribed By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.length > 0 &&
                filteredTests.map((test, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{test.patient}</td>
                    <td>{test.test_name}</td>
                    <td>{test.doctor}</td>
                    <td>{test.prescribed_date}</td>
                    <td>
  <span
    className={`badge ${
      test.status === "Pending"
        ? "bg-warning text-dark"
        : test.status === "Completed"
        ? "bg-success"
        : "bg-danger"
    }`}
  >
    {test.status}
  </span>
</td>

                    <td>
  <Button
    color="primary"
    size="sm"
    className="me-2"
    onClick={() => handleOpenUpdate(test)} // ⬅️ Open modal with selected test
  >
    Update
  </Button>
  <Button
    color="danger"
    size="sm"
    onClick={() => handleCancelLabTest(test.id)} // ✅ Call cancel function
  >
    Cancel
  </Button>
</td>

                  </tr>
                ))}

              {filteredTests.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">
                    No Lab Tests Found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* ⬇️ Include the Update Modal */}
      <UpdateLabTestModal
        isOpen={isModalOpen}
        onClose={handleCloseUpdate}
        labTestData={selectedLabTest}
        onSuccess={refreshLabTests} // refresh list after updating
      />
      {isAddModalOpen && (
  <UpdateLabTestModal
    isOpen={isAddModalOpen}
    onClose={() => setIsAddModalOpen(false)}
    labTestData={null} // pass null for new test
    onSuccess={refreshLabTests}
    isNew={true} // flag for new
  />
)}

    </div>
  );
}
