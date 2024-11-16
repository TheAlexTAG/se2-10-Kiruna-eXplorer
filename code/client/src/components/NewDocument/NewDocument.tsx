import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Alert, Modal } from "react-bootstrap";
import API from "../../API/API";
import "./NewDocument.css";
import { CoordinatesOutOfBoundsError } from "../../../../server/src/errors/documentErrors";
import MapComponent from "../Map/MapComponent";
import Select, { MultiValue } from "react-select";

interface userProps {
  userInfo: { username: string; role: string };
  updateTable: any;
}

export default function NewDocument({ userInfo, updateTable }: userProps) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [zoneID, setZoneID] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [stakeholders, setStakeholders] = useState("");
  const [scale, setScale] = useState("");
  const [issuanceDate, setIssuanceDate] = useState("");
  const [type, setType] = useState("");
  const [language, setLanguage] = useState<string | null>(null);
  const [pages, setPages] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [show, setShow] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const options = [
    { label: "Design doc.", value: "../../../public/img/design-icon.png" },
    { label: "Informative doc.", value: "../../../public/img/informative-icon.png" },
    { label: "Prescriptive doc.", value: "../../../public/img/prescriptive-icon.png" },
    { label: "Technical doc.", value: "../../../public/img/technical-icon.png" },
    { label: "Agreement", value: "../../../public/img/agreement-icon.png" },
    { label: "Conflict", value: "../../../public/img/conflict-icon.png" },
    { label: "Consultation", value: "../../../public/img/consultation-icon.png" },
    { label: "Material effect", value: "../../../public/img/material-effect-icon.png" },
  ];

  type OptionType = {
    value: string;
    label: string;
  };

  const stakeholderOptions: OptionType[] = [
    { value: "LKAB", label: "LKAB" },
    { value: "Municipalty", label: "Municipalty" },
    { value: "Regional authority", label: "Regional authority" },
    { value: "Architecture firms", label: "Architecture firms" },
    { value: "Citizens", label: "Citizens" },
    { value: "Kiruna kommun", label: "Kiruna kommun" },
    { value: "Others", label: "Others" }
  ];

  const [tempCoordinates, setTempCoordinates] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: null,
    lng: null,
  });
  const handleClose = () => {
    setTitle("");
    setIcon("");
    setDescription("");
    setZoneID(null);
    setLatitude(null);
    setLongitude(null);
    setStakeholders("");
    setScale("");
    setIssuanceDate("");
    setType("");
    setLanguage(null);
    setPages(null);
    setErrorMessage(null);
    setShow(false);
  };
  const handleShow = () => setShow(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !title ||
      !icon ||
      !description ||
      !stakeholders ||
      !scale ||
      !issuanceDate ||
      !type
    ) {
      setErrorMessage(
        "The fields Title, Icon, Description, Stakeholders, Scale, Issuance Date, and Type are mandatory."
      );
      return;
    }

    if (zoneID === null) {
      if (latitude === null || longitude === null) {
        setErrorMessage(
          "Please provide valid coordinates if no zone is selected."
        );
        return;
      }
    }

    const documentData = {
      title,
      icon,
      description,
      zoneID,
      latitude,
      longitude,
      stakeholders,
      scale,
      issuanceDate,
      type,
      language,
      pages,
    };

    try {
      await API.createDocumentNode(documentData);
      updateTable();
      handleClose();

      setSuccessMessage(`Creation of document "${title}" successful!`);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error during creation of document:", error);
      if (CoordinatesOutOfBoundsError) {
        setErrorMessage("Enter the coordinates inside the zone");
      } else {
        setErrorMessage("An error occurred while creating the document");
      }
    }
  };

  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLatitude = e.target.value ? parseFloat(e.target.value) : null;
    setLatitude(newLatitude);

    if (newLatitude !== null) {
      setZoneID(null);
    }
  };

  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLongitude = e.target.value ? parseFloat(e.target.value) : null;
    setLongitude(newLongitude);

    if (newLongitude !== null) {
      setZoneID(null);
    }
  };

  const handleLocationSelect = () => {
    if (tempCoordinates.lat !== null && tempCoordinates.lng !== null) {
      setLatitude(tempCoordinates.lat);
      setLongitude(tempCoordinates.lng);
    }
    setShowMapModal(false); // Close the modal when "OK" is clicked
  };

  const handleStakeholderSelect = (selectedStakeholders: MultiValue<OptionType>) => {
    // Convert selected options to a string of comma-separated values
    const valuesString = [...selectedStakeholders].map(option => option.value).join(", ");
    setStakeholders(valuesString);
  };

  return (
    <div className="document-container">
      <Button variant="primary" onClick={handleShow}>
        <i className="bi bi-plus-lg"></i> Insert Document
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className="title">Insert Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="document-form">
            {errorMessage && (
              <Alert
                variant="danger"
                onClose={() => setErrorMessage(null)}
                dismissible
              >
                {errorMessage}
              </Alert>
            )}

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formStakeholders">
                  <Form.Label>Stakeholders</Form.Label>
                <Select
                  options={stakeholderOptions}
                  isMulti = {true}
                  onChange={handleStakeholderSelect}
                  placeholder="Select Stakeholders"
                />
                <input
                  type="hidden"
                  name="stakeholders"
                  value={stakeholders}
                />
              </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formLatitude">
                <Form.Label>Latitude</Form.Label>
                <Form.Control
                  type="number"
                  step="0.0001"
                  value={latitude ?? ""}
                  onChange={handleLatitudeChange}
                  disabled={zoneID !== null}
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formLongitude">
                <Form.Label>Longitude</Form.Label>
                <Form.Control
                  type="number"
                  step="0.0001"
                  value={longitude ?? ""}
                  onChange={handleLongitudeChange}
                  disabled={zoneID !== null}
                />
              </Form.Group>
              <Form.Group as={Col} controlId="formLongitude">
                <Button
                  variant="secondary"
                  onClick={() => setShowMapModal(true)}
                  disabled={zoneID !== null}
                >
                  Choose Location on Map
                </Button>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formScale">
                <Form.Label>Scale</Form.Label>
                <Form.Control
                  type="text"
                  className="light-placeholder"
                  placeholder = "1:1000"
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                  required
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formIssuanceDate">
                <Form.Label>Date of Issue</Form.Label>
                <Form.Control
                  type="text"
                  className="light-placeholder"
                  placeholder="DD/MM/YYYY"
                  value={issuanceDate}
                  onChange={(e) => setIssuanceDate(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formType">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={type}
                  onChange={(e) => {
                    const selectedOption = options.find((opt) => opt.label === e.target.value);
                    if (selectedOption) {
                      setIcon(selectedOption.value);
                      setType(selectedOption.label);
                    }
                  }}
                  required
                >
                  <option value="">Select Type</option>
                  {options.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Row>

            <Row className="mb-3">
            <Form.Group as={Col} controlId="formLanguage">
              <Form.Label>Language</Form.Label>
              <Form.Select
                value={language ?? ""}
                onChange={(e) => setLanguage(e.target.value || null)}
              >
                <option value="">Select Language</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="Swedish">Swedish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Italian">Italian</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
                <option value="Russian">Russian</option>
                <option value="Arabic">Arabic</option>
                {/* Add more languages as needed */}
              </Form.Select>
            </Form.Group>

            <Form.Group as={Col} controlId="formPages">
              <Form.Label>Pages</Form.Label>
              <Form.Control
                type="text"
                className="light-placeholder"
                placeholder="1-100"
                value={pages ?? ""}
                onChange={(e) => setPages(e.target.value || null)}
              />
            </Form.Group>
            </Row>
            <Form.Group controlId="formAssignToKiruna">
              <Form.Check 
                type="checkbox" 
                label="Assign document to entire Kiruna area" 
                checked={zoneID === 0}
                onChange={(e) => {
                  setZoneID(e.target.checked ? 0 : null);
                  if (e.target.checked) {
                    setLatitude(null);
                    setLongitude(null);
                  }
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={(e) => handleSubmit(e)}>
            Create Document
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Map Modal */}
      <Modal
        show={showMapModal}
        onHide={() => setShowMapModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MapComponent
            onLocationSelect={handleLocationSelect}
            tempCoordinates={tempCoordinates}
            setTempCoordinates={setTempCoordinates}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMapModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleLocationSelect}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
