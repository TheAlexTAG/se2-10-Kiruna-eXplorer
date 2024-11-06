import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Alert, Modal } from "react-bootstrap";
import API from "../../API/API";
import "./NewDocument.css";
import { CoordinatesOutOfBoundsError } from "../../../../server/src/errors/documentErrors";
import MapComponent from "../Map/MapComponent";

interface userProps {
  userInfo: { username: string; role: string };
  updateTable: any;
}

export default function NewDocument({ userInfo, updateTable }: userProps) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("../../../public/img/icon.webp");
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
  const [zones, setZones] = useState<{ id: number; name: string }[]>([]);

  const [show, setShow] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

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
    setZones([]);
    setShow(false);
  };
  const handleShow = () => setShow(true);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zonesData = await API.getZones();
        setZones(zonesData);
      } catch (error) {
        console.error("Error fetching zones:", error);
        setErrorMessage("Failed to load zones.");
      }
    };
    fetchZones();
  }, []);

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

    if (!zoneID) {
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

      alert(`Creation of document ${title} successful!`);
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

  const handleZoneIDChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedZoneID = e.target.value ? parseInt(e.target.value) : null;
    setZoneID(selectedZoneID);

    if (selectedZoneID !== null) {
      setLatitude(null);
      setLongitude(null);
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

              <Form.Group as={Col} controlId="formIcon">
                <Form.Label>Icon</Form.Label>
                <Form.Select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  required
                >
                  <option value="../../../public/img/icon.webp">
                    Document Icon
                  </option>
                </Form.Select>
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
              <Form.Group as={Col} controlId="formZoneID">
                <Form.Label>Zone Name</Form.Label>
                <Form.Select
                  value={zoneID ?? ""}
                  onChange={handleZoneIDChange}
                  disabled={latitude !== null || longitude !== null}
                >
                  <option value="">Select a Zone</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

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
              <Form.Group as={Col} controlId="formStakeholders">
                <Form.Label>Stakeholders</Form.Label>
                <Form.Control
                  type="text"
                  value={stakeholders}
                  onChange={(e) => setStakeholders(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formScale">
                <Form.Label>Scale</Form.Label>
                <Form.Control
                  type="text"
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
                  value={issuanceDate}
                  onChange={(e) => setIssuanceDate(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formType">
                <Form.Label>Type</Form.Label>
                <Form.Control
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formLanguage">
                <Form.Label>Language</Form.Label>
                <Form.Control
                  type="text"
                  value={language ?? ""}
                  onChange={(e) => setLanguage(e.target.value || null)}
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formPages">
                <Form.Label>Pages</Form.Label>
                <Form.Control
                  type="text"
                  value={pages ?? ""}
                  onChange={(e) => setPages(e.target.value || null)}
                />
              </Form.Group>
            </Row>
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