import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Alert,
  Modal,
  InputGroup,
} from "react-bootstrap";
import API from "../../API/API";
import "./NewDocument.css";
import Select, { MultiValue } from "react-select";
import { Feature, MultiPolygon } from "geojson";
import { CoordinatesOutOfBoundsError } from "../../errors/general";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";
import GeoReferenceComponent from "../GeoreferenceComponent/GeoreferenceComponent";

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
  const [coordinates, setCoordinates] = useState(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [show, setShow] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showZones, setShowZones] = useState<boolean>(false);

  const [showCalendar, setShowCalendar] = useState(false);
  const datePickerRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowCalendar(false); // Close calendar if click is outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup listener on unmount
    };
  }, []);

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
    "point" | "zone" | "custom" | "newPoint" | null
  >("point");
  const [highlightedZoneId, setHighlightedZoneId] = useState<number | null>(
    null
  );
  const [highlightedDocumentId, setHighlightedDocumentId] = useState<
    number | null
  >(null);
  const [tempHighlightedDocumentId, setTempHighlightedDocumentId] = useState<
    number | null
  >(null);
  const [tempCustom, setTempCustom] = useState<any>(null);
  const [customArea, setCustomArea] = useState<any>(null);
  const [kirunaBoundary, setKirunaBoundary] =
    useState<Feature<MultiPolygon> | null>(null);
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
      latitude: latitude === null && zoneID === null && customArea === null,
      longitude: longitude === null && zoneID === null && customArea === null,
    };

    setFieldErrors(errors);

    if (Object.values(errors).some((hasError) => hasError)) {
      setErrorMessage("One or more required field(s) are missing.");
      return;
    }

    if (
      zoneID === null &&
      customArea === null &&
      latitude === null &&
      longitude === null
    ) {
      setErrorMessage(
        "Please provide valid coordinates if no zone is selected."
      );
      return;
    }
    setCoordinates(customArea);
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
        coordinates,
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
    setHighlightedDocumentId(tempHighlightedDocumentId);
    setZoneID(tempZoneId);
    setCustomArea(tempCustom);
    setShowMapModal(false);
  };

  console.log("in newdoc tempcustom is", tempCustom);
  console.log("in newdoc custom is", customArea);

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

  const [demoVar, setDemoVar] = useState<string>("");
  console.log("Test - tempCustom is ", tempCustom);
  const handleMockFill = (i: string) => {
    setTitle(`Demo title ${i}`);
    setDescription(`Demo description ${i}`);
    setScale(`1:1,000`);
    setIssuanceDate(`1${i}/0${i}/201${i}`);
    setType("Informative doc.");
  };
  return (
    <div
      className="document-container"
      style={{ backgroundColor: "transparent" }}
    >
      <Button variant="primary" onClick={handleShow} className="fab">
        <i className="bi bi-plus-lg fs-2"></i>
      </Button>

      <Modal
        className="new-doc"
        show={show}
        onHide={handleClose}
        data-bs-theme="dark"
      >
        <Modal.Header closeButton>
          <Modal.Title className="title main-text">Insert Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              type="text"
              value={demoVar}
              onChange={(e) => setDemoVar(e.target.value)}
            />
            <Button onClick={() => handleMockFill(demoVar)}>
              Press for demo fill
            </Button>
          </Form>
          <Form data-bs-theme="dark">
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
              <Form.Group as={Col} controlId="formTitle" data-bs-theme="dark">
                <Form.Label className="main-text">Title*</Form.Label>
                <Form.Control
                  className="custom-input"
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
                <Form.Label className="main-text">Stakeholders*</Form.Label>
                <Select
                  options={stakeholderOptions}
                  isMulti={true}
                  onChange={handleStakeholderSelect}
                  placeholder="Select Stakeholders"
                  className="custom-input"
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
              <Form.Label className="main-text">Description*</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              {fieldErrors.description && (
                <div className="text-danger">
                  <i className="bi bi-x-circle-fill text-danger"></i> This field
                  is required
                </div>
              )}
            </Form.Group>
            <Row className="main-text mb-2">
              <strong>Location Details*</strong>
              {(fieldErrors.latitude || fieldErrors.longitude) && (
                <div className="text-danger">
                  <i className="bi bi-x-circle-fill text-danger"></i> This field
                  is required
                </div>
              )}
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formLatitude">
                <Form.Label className="main-text">Latitude</Form.Label>
                <Form.Control
                  type="number"
                  step="0.0001"
                  value={latitude ?? ""}
                  onChange={handleLatitudeChange}
                  disabled={zoneID !== null || customArea !== null}
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formLongitude">
                <Form.Label className="main-text">Longitude</Form.Label>
                <Form.Control
                  type="number"
                  step="0.0001"
                  value={longitude ?? ""}
                  onChange={handleLongitudeChange}
                  disabled={zoneID !== null || customArea !== null}
                />
              </Form.Group>
              <Form.Group
                as={Col}
                controlId="formLongitude"
                style={{ marginTop: "28px" }}
              >
                <Button
                  variant="secondary"
                  onClick={() => setShowMapModal(true)}
                  size="lg"
                >
                  <i className="bi bi-geo-alt mx-2"></i>
                  Choose Location on Map
                </Button>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group controlId="formAssignToKiruna">
                <Form.Switch
                  className="main-text"
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
                <Form.Label className="main-text">Scale*</Form.Label>
                <Form.Select
                  value={scale ?? ""}
                  onChange={(e) => setScale(e.target.value)}
                >
                  <option value="">Select Scale</option>
                  <option value="Blueprints/effects">Blueprints/effects</option>
                  <option value="1:1,000">1:1,000</option>
                  <option value="1:5,000">1:5,000</option>
                  <option value="1:10,000">1:10,000</option>
                  <option value="1:100,000">1:100,000</option>
                  <option value="Concept">Concept</option>
                  <option value="Text">Text</option>
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
                <Form.Label style={{ display: "block" }} className="main-text">
                  Date of Issue*
                </Form.Label>
                <div className="d-flex">
                  <div
                    className="custom-date-picker"
                    ref={datePickerRef}
                    style={{ width: "0" }}
                  >
                    <DatePicker
                      selected={parsedDate()}
                      onChange={handleDateChange}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      className="form-control "
                      required
                      open={showCalendar}
                    />
                  </div>

                  <InputGroup className="search-bar" data-bs-theme="dark">
                    <InputGroup.Text
                      style={{
                        background: "none",
                        borderRight: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      <i
                        className="bi bi-calendar3"
                        style={{ color: "#085FB2" }}
                      ></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Optional manual input (dd/mm/yyyy, mm/yyyy, yyyy)"
                      value={issuanceDate}
                      onChange={handleManualDateChange}
                    />
                  </InputGroup>
                </div>
                {fieldErrors.issuanceDate && (
                  <div className="text-danger">
                    <i className="bi bi-x-circle-fill text-danger"></i> This
                    field is required
                  </div>
                )}
              </Form.Group>

              <Form.Group as={Col} controlId="formType">
                <Form.Label className="main-text">Type*</Form.Label>
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
                <Form.Label className="main-text">Language</Form.Label>
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
                <Form.Label className="main-text">Pages</Form.Label>
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
        centered
        size="lg"
        style={{ left: "-8px" }} //find a real fix
        data-bs-theme="dark"
      >
        <Modal.Header closeButton>
          <Modal.Title className="main-text">Select Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <GeoReferenceComponent
            tempCoordinates={tempCoordinates}
            setTempCoordinates={setTempCoordinates}
            onZoneSelect={handleZoneSelect}
            selectionMode={selectionMode}
            setSelectionMode={setSelectionMode}
            highlightedZoneId={highlightedZoneId}
            setHighlightedZoneId={setHighlightedZoneId}
            setTempCustom={setTempCustom}
            kirunaBoundary={kirunaBoundary}
            setKirunaBoundary={setKirunaBoundary}
            highlightedDocumentId={highlightedDocumentId}
            setHighlightedDocumentId={setHighlightedDocumentId}
            tempHighlightedDocumentId={tempHighlightedDocumentId}
            setTempHighlightedDocumentId={setTempHighlightedDocumentId}
            customArea={customArea}
            showZones={showZones}
            setShowZones={setShowZones}
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
