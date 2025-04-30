"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import {
  updateLabTestResult,
  createLabTest,
} from "@/app/services/labServices";

export default function UpdateLabTestModal({
  isOpen,
  onClose,
  labTestData,
  onSuccess,
  isNew = false,
}) {
  const [formData, setFormData] = useState({
    id: "",
    patient: "",
    test_name: "",
    prescribed_by: "",
    doctor: "",
    prescribed_date: "",
    status: "Pending",
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (labTestData) {
      setFormData({
        id: labTestData.id || "",
        patient: labTestData.patient || "",
        test_name: labTestData.test_name || "",
        prescribed_by: labTestData.prescribed_by || "",
        doctor: labTestData.doctor || "",
        prescribed_date: labTestData.prescribed_date || "",
        status: labTestData.status || "Pending",
      });
    } else {
      setFormData({
        id: "",
        patient: "",
        test_name: "",
        prescribed_by: "",
        doctor: "",
        prescribed_date: "",
        status: "Pending",
      });
    }
  }, [labTestData]);

  useEffect(() => {
    async function fetchDropdownData() {
      try {
        const [patientRes, doctorRes] = await Promise.all([
          fetch("/api/patients/"),
          fetch("/api/doctors/"),
        ]);
        const patientData = await patientRes.json();
        const doctorData = await doctorRes.json();
        setPatients(patientData);
        setDoctors(doctorData);
      } catch (error) {
        console.error("Failed to fetch dropdown data", error);
      }
    }

    if (isNew) fetchDropdownData(); // Only needed for new entries
  }, [isNew]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isNew) {
        await createLabTest(formData);
      } else {
        await updateLabTestResult(formData.id, {
          status: formData.status,
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to submit lab test form", error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose}>
      <ModalHeader toggle={onClose}>
        {isNew ? "Add New Lab Test" : "Update Lab Test"}
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          {!isNew && (
            <FormGroup>
              <Label for="test_id">Test ID</Label>
              <Input id="test_id" name="id" value={formData.id} disabled />
            </FormGroup>
          )}

          <FormGroup>
            <Label for="patient">Patient</Label>
            {isNew ? (
              <Input
                type="select"
                id="patient"
                name="patient"
                value={formData.patient}
                onChange={handleChange}
                required
              >
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Input>
            ) : (
              <Input value={formData.patient} disabled />
            )}
          </FormGroup>

          <FormGroup>
            <Label for="test_name">Test Name</Label>
            <Input
              id="test_name"
              name="test_name"
              value={formData.test_name}
              onChange={handleChange}
              disabled={!isNew}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label for="doctor">Prescribed By</Label>
            {isNew ? (
              <Input
                type="select"
                id="doctor"
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Input>
            ) : (
              <Input value={formData.doctor} disabled />
            )}
          </FormGroup>

          <FormGroup>
            <Label for="prescribed_date">Date</Label>
            <Input
              type="date"
              id="prescribed_date"
              name="prescribed_date"
              value={formData.prescribed_date}
              onChange={handleChange}
              disabled={!isNew}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label for="status">Status</Label>
            <Input
              type="select"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Input>
          </FormGroup>

          <ModalFooter>
            <Button color="primary" type="submit">
              {isNew ? "Add Lab Test" : "Save Changes"}
            </Button>{" "}
            <Button color="secondary" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </Form>
      </ModalBody>
    </Modal>
  );
}
