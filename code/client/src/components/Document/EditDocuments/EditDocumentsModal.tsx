import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button, Alert, Modal } from "react-bootstrap";
import MapComponent from "../../Map/MapComponent";
import Select from "react-select";
import API from "../../../API/API";
import "./EditDocumentsModal.css";
import { Feature, Polygon as GeoJSONPolygon } from "geojson";

interface EditDocumentProps {
  document: any;
  show: boolean;
  onHide: () => void;
  updateTable: () => void;
}

export default function EditDocumentModal({
  document,
  show,
  onHide,
  updateTable,
}: EditDocumentProps) {
  const [latitude, setLatitude] = useState<number | null>(document.latitude);
  const [longitude, setLongitude] = useState<number | null>(document.longitude);
  const [zoneID, setZoneID] = useState<number | null>(document.zoneID);
  const [showMapModal, setShowMapModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tempZoneId, setTempZoneId] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState<
    "point" | "zone" | "custom"
  >("point");
  const [highlightedZoneId, setHighlightedZoneId] = useState<number | null>(
    null
  );
  const [tempCustom, setTempCustom] = useState<any>(null);

  const [tempCoordinates, setTempCoordinates] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: null,
    lng: null,
  });
  const [isReady, setIsReady] = useState(false);
  const [kirunaBoundary, setKirunaBoundary] =
    useState<Feature<GeoJSONPolygon> | null>(null);

  const stakeholderOptions = [
    { value: "LKAB", label: "LKAB" },
    { value: "Municipalty", label: "Municipalty" },
    { value: "Regional authority", label: "Regional authority" },
    { value: "Architecture firms", label: "Architecture firms" },
    { value: "Citizens", label: "Citizens" },
    { value: "Others", label: "Others" },
  ];

  const handleLocationSelect = () => {
    setLatitude(tempCoordinates.lat);
    setLongitude(tempCoordinates.lng);

    setZoneID(tempZoneId);

    setShowMapModal(false);
  };

  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLatitude = e.target.value ? parseFloat(e.target.value) : null;
    setLatitude(newLatitude);
    if (newLatitude !== null) setZoneID(null);
  };

  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLongitude = e.target.value ? parseFloat(e.target.value) : null;
    setLongitude(newLongitude);
    if (newLongitude !== null) setZoneID(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      latitude === null &&
      longitude === null &&
      zoneID === null &&
      tempCustom === null
    ) {
      setErrorMessage("Please provide valid coordinates or select a zone.");
      return;
    }

    if (tempCustom) {
      const newZone = await API.createZone(tempCustom);
      setZoneID(newZone);
    }
    setIsReady(true);

    console.log(document.id, zoneID, longitude, latitude);
  };

  useEffect(() => {
    const realSubmit = async () => {
      setIsReady(false);
      try {
        await API.updateGeoreference(document.id, zoneID, longitude, latitude);
        updateTable();
        onHide();
      } catch (error: any) {
        setErrorMessage(
          error.message || "An error occurred while updating the document."
        );
      }
    };
    if (isReady) {
      realSubmit();
    }
  }, [isReady]);

  const handleZoneSelect = (zoneId: number | null) => {
    setTempZoneId(zoneId);
    if (zoneId !== null) {
      setTempCoordinates({ lat: null, lng: null });
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Document</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && (
          <Alert
            variant="danger"
            onClose={() => setErrorMessage(null)}
            dismissible
          >
            {errorMessage}
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" value={document.title} disabled />
            </Form.Group>

            <Form.Group as={Col} controlId="formStakeholders">
              <Form.Label>Stakeholders</Form.Label>
              <Select
                options={stakeholderOptions}
                isMulti
                value={stakeholderOptions.filter((opt) =>
                  document.stakeholders.split(", ").includes(opt.value)
                )}
                isDisabled
              />
            </Form.Group>
          </Row>

          <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={document.description}
              disabled
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
            <Form.Group
              as={Col}
              controlId="formMapButton"
              className="d-flex align-items-end"
            >
              <Button variant="secondary" onClick={() => setShowMapModal(true)}>
                Choose Location on Map
              </Button>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formScale">
              <Form.Label>Scale</Form.Label>
              <Form.Control type="text" value={document.scale} disabled />
            </Form.Group>

            <Form.Group as={Col} controlId="formIssuanceDate">
              <Form.Label>Date of Issue</Form.Label>
              <Form.Control
                type="text"
                value={document.issuanceDate}
                disabled
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formType">
              <Form.Label>Type</Form.Label>
              <Form.Control type="text" value={document.type} disabled />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formLanguage">
              <Form.Label>Language</Form.Label>
              <Form.Control
                type="text"
                value={document.language || ""}
                disabled
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formPages">
              <Form.Label>Pages</Form.Label>
              <Form.Control type="text" value={document.pages || ""} disabled />
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

          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>

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
            tempCoordinates={tempCoordinates}
            setTempCoordinates={setTempCoordinates}
            onZoneSelect={handleZoneSelect}
            setTempZoneId={setTempZoneId}
            selectionMode={selectionMode}
            setSelectionMode={setSelectionMode}
            highlightedZoneId={highlightedZoneId}
            setHighlightedZoneId={setHighlightedZoneId}
            setTempCustom={setTempCustom}
            kirunaBoundary={kirunaBoundary}
            setKirunaBoundary={setKirunaBoundary}
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
    </Modal>
  );
}
