// app/labtechnician/page.js
"use client";
import { useState, useEffect } from 'react';
import { Card, Button, Badge, Table, Spinner, Alert, ProgressBar, Modal, Form } from 'react-bootstrap';
import { 
  getDashboardStats, 
  getPendingTests,
  submitTestResult,
  generateLabReport,
  downloadReport
} from '@/app/services/labServices';
import { useAuth } from '@/app/context/AuthContext';

export default function LabTechnicianDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingTests, setPendingTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [resultData, setResultData] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardStats, tests] = await Promise.all([
          getDashboardStats(),
          getPendingTests()
        ]);
        setStats(dashboardStats);
        setPendingTests(tests);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmitResult = async () => {
    try {
      await submitTestResult(currentTest.id, resultData);
      setPendingTests(pendingTests.filter(test => test.id !== currentTest.id));
      setShowResultModal(false);
      // Refresh stats
      const updatedStats = await getDashboardStats();
      setStats(updatedStats);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerateReport = async (prescriptionId) => {
    try {
      const testResults = pendingTests
        .filter(test => test.prescription === prescriptionId)
        .map(test => ({
          prescription_lab_test_id: test.id,
          result_data: test.result_data || "Normal" // Default if not entered
        }));
      
      const report = await generateLabReport(
        prescriptionId,
        testResults,
        user.id
      );
      
      // Download the generated report
      const pdfBlob = await downloadReport(report.id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lab_report_${report.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Spinner animation="border" className="my-5" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container-fluid">
      <h2 className="my-4">Lab Technician Dashboard</h2>
      
      {/* Stats Overview */}
      <div className="row mb-4">
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Pending Tests</Card.Title>
              <h3 className="text-warning">{stats?.pending_tests || 0}</h3>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Completed Today</Card.Title>
              <h3 className="text-success">{stats?.completed_today || 0}</h3>
            </Card.Body>
          </Card>
        </div>
      </div>
      
      {/* Pending Tests Table */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <h5>Pending Laboratory Tests</h5>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Test</th>
                <th>Prescribed By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingTests.length > 0 ? (
                pendingTests.map(test => (
                  <tr key={test.id}>
                    <td>
  {test.prescription?.patient?.first_name || ''} {test.prescription?.patient?.last_name || ''}
</td>
<td>
  Dr. {test.prescription?.doctor?.user?.first_name || ''} {test.prescription?.doctor?.user?.last_name || ''}
</td>
                    
                    <td>{new Date(test.created_at).toLocaleDateString()}</td>
                    <td>
                      <Badge bg="warning">Pending</Badge>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => {
                          setCurrentTest(test);
                          setResultData(test.result_data || '');
                          setShowResultModal(true);
                        }}
                      >
                        Enter Results
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No pending tests found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Completed Prescriptions (Grouped by prescription) */}
      {pendingTests.length > 0 && (
        <Card className="shadow-sm">
          <Card.Header className="bg-white">
            <h5>Ready for Report Generation</h5>
          </Card.Header>
          <Card.Body>
            {Array.from(new Set(pendingTests.map(test => test.prescription))).map(prescriptionId => {
              const prescriptionTests = pendingTests.filter(test => test.prescription === prescriptionId);
              const completedCount = prescriptionTests.filter(t => t.status === 'Completed').length;
              
              return (
                <div key={prescriptionId} className="mb-3 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <strong>Prescription #:</strong> {prescriptionId}
                      <br />
                      <strong>Patient:</strong> {prescriptionTests[0]?.prescription?.patient?.full_name || 'Unknown Patient'}
                    </div>
                    <div>
                      <ProgressBar 
                        now={(completedCount / prescriptionTests.length) * 100} 
                        label={`${completedCount}/${prescriptionTests.length}`}
                        className="mb-2"
                        style={{ width: '200px' }}
                      />
                      <Button 
                        variant="success"
                        size="sm"
                        disabled={completedCount !== prescriptionTests.length}
                        onClick={() => handleGenerateReport(prescriptionId)}
                      >
                        Generate Report
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </Card.Body>
        </Card>
      )}
      
      {/* Result Entry Modal */}
      <Modal show={showResultModal} onHide={() => setShowResultModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Test Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTest && (
            <>
              <p>
                <strong>Patient:</strong> {currentTest.prescription.patient.full_name}<br />
                <strong>Test:</strong> {currentTest.lab_test.name}
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Test Results</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={resultData}
                  onChange={(e) => setResultData(e.target.value)}
                  placeholder="Enter test results..."
                />
                {currentTest.lab_test.reference_range && (
                  <Form.Text className="text-muted">
                    Reference Range: {currentTest.lab_test.reference_range}
                  </Form.Text>
                )}
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResultModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitResult}>
            Submit Results
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}