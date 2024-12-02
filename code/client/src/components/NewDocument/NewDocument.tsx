import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Alert, Modal } from "react-bootstrap";
import API from "../../API/API";
import "./NewDocument.css";
import MapComponent from "../Map/MapComponent";
import Select, { MultiValue } from "react-select";
import { Feature, Polygon as GeoJSONPolygon } from "geojson";
import { CoordinatesOutOfBoundsError } from "../../errors/general";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";

interface NewDocumentProps {
  userInfo: { username: string; role: string };
  updateTable: any;
  setSuccessMessage: (successMessage: string | null) => void;
}

const NewDocument: React.FC<NewDocumentProps> = ({
  updateTable,
  setSuccessMessage,
}) => {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [zoneID, setZoneID] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [stakeholders, setStakeholders] = useState("");
  const [scale, setScale] = useState("");
  const [issuanceDate, setIssuanceDate] = useState<string>("");
  const [type, setType] = useState("");
  const [language, setLanguage] = useState<string | null>(null);
  const [pages, setPages] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [show, setShow] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const options = [
    { label: "Design doc.", value: "../../../public/img/design-icon.png" },
    {
      label: "Informative doc.",
      value: "../../../public/img/informative-icon.png",
    },
    {
      label: "Prescriptive doc.",
      value: "../../../public/img/prescriptive-icon.png",
    },
    {
      label: "Technical doc.",
      value: "../../../public/img/technical-icon.png",
    },
    { label: "Agreement", value: "../../../public/img/agreement-icon.png" },
    { label: "Conflict", value: "../../../public/img/conflict-icon.png" },
    {
      label: "Consultation",
      value: "../../../public/img/consultation-icon.png",
    },
    {
      label: "Material effect",
      value: "../../../public/img/material-effect-icon.png",
    },
  ];

  type OptionType = {
    value: string;
    label: string;
  };

  const stakeholderOptions: OptionType[] = [
    { value: "LKAB", label: "LKAB" },
    { value: "Municipality", label: "Municipalty" },
    { value: "Regional authority", label: "Regional authority" },
    { value: "Architecture firms", label: "Architecture firms" },
    { value: "Citizens", label: "Citizens" },
    { value: "Kiruna kommun", label: "Kiruna kommun" },
    { value: "Others", label: "Others" },
  ];

  const [tempCoordinates, setTempCoordinates] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: latitude,
    lng: longitude,
  });

  const [tempZoneId, setTempZoneId] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState<
    "point" | "zone" | "custom"
  >("point");
  const [highlightedZoneId, setHighlightedZoneId] = useState<number | null>(
    null
  );
  const [tempCustom, setTempCustom] = useState<any>(null);
  const [kirunaBoundary, setKirunaBoundary] =
    useState<Feature<GeoJSONPolygon> | null>(null);

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
    setFieldErrors({});
    setShow(false);
  };
  const handleShow = () => setShow(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = {
      title: !title,
      description: !description,
      stakeholders: !stakeholders,
      scale: !scale,
      issuanceDate: !issuanceDate,
      type: !type,
      latitude: latitude === null && zoneID === null,
      longitude: longitude === null && zoneID === null,
    };

    setFieldErrors(errors);

    if (Object.values(errors).some((hasError) => hasError)) {
      setErrorMessage("One or more required field(s) are missing.");
      return;
    }

    if (zoneID === null && tempCustom === null) {
      if (latitude === null || longitude === null) {
        setErrorMessage(
          "Please provide valid coordinates if no zone is selected."
        );
        return;
      }
    } else if (zoneID === null && tempCustom !== null) {
      const newZone = await API.createZone(tempCustom);
      setZoneID(newZone);
    }

    setErrorMessage(null);
    setIsReady(true);
  };

  useEffect(() => {
    const realSubmit = async () => {
      setIsReady(false);
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
    if (isReady) {
      realSubmit();
    }
  }, [isReady]);

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
    setLatitude(tempCoordinates.lat);
    setLongitude(tempCoordinates.lng);

    setZoneID(tempZoneId);

    setShowMapModal(false);
  };

  const handleStakeholderSelect = (
    selectedStakeholders: MultiValue<OptionType>
  ) => {
    const valuesString = [...selectedStakeholders]
      .map((option) => option.value)
      .join(", ");
    setStakeholders(valuesString);
  };
  const handleZoneSelect = (zoneId: number | null) => {
    setTempZoneId(zoneId);
    if (zoneId !== null) {
      setTempCoordinates({ lat: null, lng: null });
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = format(date, "dd/MM/yyyy");
      setIssuanceDate(formattedDate);
    } else {
      setIssuanceDate("");
    }
  };

  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.trim();
    setIssuanceDate(input);

    const fullDateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    const monthYearRegex = /^\d{2}\/\d{4}$/;
    const yearRegex = /^\d{4}$/;

    if (
      !fullDateRegex.test(input) &&
      !monthYearRegex.test(input) &&
      !yearRegex.test(input)
    ) {
      console.warn(
        "Invalid date format. Supported formats: dd/mm/yyyy, mm/yyyy, yyyy."
      );
    }
  };

  const parsedDate = () => {
    try {
      if (/^\d{4}$/.test(issuanceDate)) {
        return parse(`01/01/${issuanceDate}`, "dd/MM/yyyy", new Date());
      } else if (/^\d{2}\/\d{4}$/.test(issuanceDate)) {
        return parse(`01/${issuanceDate}`, "dd/MM/yyyy", new Date());
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(issuanceDate)) {
        return parse(issuanceDate, "dd/MM/yyyy", new Date());
      } else {
        return null;
      }
    } catch {
      return null;
    }
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
                <Form.Label>Title*</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {fieldErrors.title && (
                  <div className="text-danger">
                    <i className="bi bi-x-circle-fill text-danger"></i> This
                    field is required
                  </div>
                )}
              </Form.Group>

              <Form.Group as={Col} controlId="formStakeholders">
                <Form.Label>Stakeholders*</Form.Label>
                <Select
                  options={stakeholderOptions}
                  isMulti={true}
                  onChange={handleStakeholderSelect}
                  placeholder="Select Stakeholders"
                />
                <input type="hidden" name="stakeholders" value={stakeholders} />
                {fieldErrors.stakeholders && (
                  <div className="text-danger">
                    <i className="bi bi-x-circle-fill text-danger"></i> This
                    field is required
                  </div>
                )}
              </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Description*</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              {fieldErrors.description && (
                  <div className="text-danger">
                    <i className="bi bi-x-circle-fill text-danger"></i> This
                    field is required
                  </div>
                )}
            </Form.Group>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formLatitude">
                <Form.Label>Latitude*</Form.Label>
                <Form.Control
                  type="number"
                  step="0.0001"
                  value={latitude ?? ""}
                  onChange={handleLatitudeChange}
                  disabled={zoneID !== null || tempCustom !== null}
                />
                {fieldErrors.latitude && (
                  <div className="text-danger">
                    <i className="bi bi-x-circle-fill text-danger"></i> This
                    field is required
                  </div>
                )}
              </Form.Group>

              <Form.Group as={Col} controlId="formLongitude">
                <Form.Label>Longitude*</Form.Label>
                <Form.Control
                  type="number"
                  step="0.0001"
                  value={longitude ?? ""}
                  onChange={handleLongitudeChange}
                  disabled={zoneID !== null || tempCustom !== null}
                />
                {fieldErrors.longitude && (
                  <div className="text-danger">
                    <i className="bi bi-x-circle-fill text-danger"></i> This
                    field is required
                  </div>
                )}
              </Form.Group>
              <Form.Group as={Col} controlId="formLongitude">
                <Button
                  variant="secondary"
                  onClick={() => setShowMapModal(true)}
                  size="lg"
                >
                  Choose Location on Map
                </Button>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group controlId="formAssignToKiruna">
                <Form.Switch
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
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formScale">
                <Form.Label>Scale*</Form.Label>
                <Form.Select
                  value={scale ?? ""}
                  onChange={(e) => setScale(e.target.value)}
                >
                  <option value="">Select Scale</option>
                  <option value="1:1,000">1:1,000</option>
                  <option value="1:5,000">1:5,000</option>
                  <option value="1:10,000">1:10,000</option>
                  <option value="1:100,000">1:100,000</option>
                  <option value="Blueprints/effects">Blueprints/effects</option>
                  <option value="Text">Text</option>
                  <option value="Concept">Concept</option>
                </Form.Select>
                {fieldErrors.scale && (
                  <div className="text-danger">
                    <i className="bi bi-x-circle-fill text-danger"></i> This
                    field is required
                  </div>
                )}
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formIssuanceDate">
                <Form.Label style={{ display: "block" }}>
                  Date of Issue*
                </Form.Label>
                <DatePicker
                  selected={parsedDate()}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  className="form-control"
                  required
                />
                <Form.Control
                  type="text"
                  className="mt-2"
                  placeholder="Optional manual input (dd/mm/yyyy, mm/yyyy, yyyy)"
                  value={issuanceDate}
                  onChange={handleManualDateChange}
                />
                {fieldErrors.issuanceDate && (
                  <div className="text-danger">
                    <i className="bi bi-x-circle-fill text-danger"></i> This
                    field is required
                  </div>
                )}
              </Form.Group>

              <Form.Group as={Col} controlId="formType">
                <Form.Label>Type*</Form.Label>
                <Form.Select
                  value={type}
                  onChange={(e) => {
                    const selectedOption = options.find(
                      (opt) => opt.label === e.target.value
                    );
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
                {fieldErrors.type && (
                  <div className="text-danger">
                    <i className="bi bi-x-circle-fill text-danger"></i> This
                    field is required
                  </div>
                )}
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
            <Row>
              <div className="required-fields-note" style={{ color: "gray" }}>
                *Required fields
              </div>
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
    </div>
  );
};

export default NewDocument;
