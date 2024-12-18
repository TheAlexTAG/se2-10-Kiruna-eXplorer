import React, { useEffect, useState, useRef } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Alert,
  Modal,
  InputGroup,
} from "react-bootstrap";

import API from "../../../API/API";
import "./EditDocumentsModal.css";
import { Feature, MultiPolygon } from "geojson";
import GeoReferenceComponent from "../../GeoreferenceComponent/GeoreferenceComponent";
import CustomSelectBox from "../../NewDocument/CustomSelectBox/CustomSelectBox";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";

interface EditDocumentProps {
  currentDocument: any;
  show: boolean;
  onHide: () => void;
  updateTable: () => void;
}

export default function EditDocumentModal({
  currentDocument,
  show,
  onHide,
  updateTable,
}: EditDocumentProps) {
  const [editableDocument, setEditableDocument] = useState({
    ...currentDocument,
    title: currentDocument.title || "",
    description: currentDocument.description || "",
    issuanceDate: currentDocument.issuanceDate || "",
    type: currentDocument.type || "",
    language: currentDocument.language || "",
    pages: currentDocument.pages || "",
    scale: currentDocument.scale || "",
  });
  const parsedDate = () => {
    try {
      if (/^\d{4}$/.test(editableDocument.issuanceDate)) {
        return parse(
          `01/01/${editableDocument.issuanceDate}`,
          "dd/MM/yyyy",
          new Date()
        );
      } else if (/^\d{2}\/\d{4}$/.test(editableDocument.issuanceDate)) {
        return parse(
          `01/${editableDocument.issuanceDate}`,
          "dd/MM/yyyy",
          new Date()
        );
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(editableDocument.issuanceDate)) {
        return parse(editableDocument.issuanceDate, "dd/MM/yyyy", new Date());
      } else {
        return null;
      }
    } catch {
      return null;
    }
  };
  const datePickerRef = useRef(null);
  const [stakeholders, setStakeholders] = useState("");
  const [scale, setScale] = useState("");
  const [latitude, setLatitude] = useState<number | null>(
    currentDocument.latitude
  );
  const [longitude, setLongitude] = useState<number | null>(
    currentDocument.longitude
  );
  const [zoneID, setZoneID] = useState<number | null>(currentDocument.zoneID);
  const [showMapModal, setShowMapModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
  const [showZones, setShowZones] = useState<boolean>(false);

  const [tempCoordinates, setTempCoordinates] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: null,
    lng: null,
  });
  const [isReady, setIsReady] = useState(false);
  const [kirunaBoundary, setKirunaBoundary] =
    useState<Feature<MultiPolygon> | null>(null);

  const staticStakeholderOptions: OptionType[] = [
    { value: "LKAB", label: "LKAB" },
    { value: "Municipality", label: "Municipalty" },
    { value: "Regional authority", label: "Regional authority" },
    { value: "Architecture firms", label: "Architecture firms" },
    { value: "Citizens", label: "Citizens" },
    { value: "Kiruna kommun", label: "Kiruna kommun" },
    // { value: "Others", label: "Others" },
  ];
  const [stakeholderOptions, setStakeholderOptions] = useState<OptionType[]>(
    []
  );
  const scaleOptions: OptionType[] = [
    { value: "Blueprints/effects", label: "Blueprints/effects" },
    { value: "1:1,000", label: "1:1,000" },
    { value: "1:5,000", label: "1:5,000" },
    { value: "1:10,000", label: "1:10,000" },
    { value: "1:100,000", label: "1:100,000" },
    { value: "Concept", label: "Concept" },
    { value: "Text", label: "Text" },
  ];

  const handleLocationSelect = () => {
    setLatitude(tempCoordinates.lat);
    setLongitude(tempCoordinates.lng);
    setEditableDocument({
      ...editableDocument,
      latitude: tempCoordinates.lat,
      longitude: tempCoordinates.lng,
      zoneID: tempZoneId,
    });

    setHighlightedDocumentId(tempHighlightedDocumentId);
    setZoneID(tempZoneId);
    setEditableDocument({
      ...editableDocument,
      zoneID: tempZoneId,
    });
    setCustomArea(tempCustom);
    setShowMapModal(false);
  };

  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLatitude = e.target.value ? parseFloat(e.target.value) : null;
    setEditableDocument({
      ...editableDocument,
      latitude: newLatitude,
    });
    setLatitude(newLatitude);
    if (newLatitude !== null) {
      setZoneID(null);
      setEditableDocument({
        ...editableDocument,
        zoneID: null,
      });
    }
  };

  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLongitude = e.target.value ? parseFloat(e.target.value) : null;
    setEditableDocument({
      ...editableDocument,
      longitude: newLongitude,
    });
    setLongitude(newLongitude);
    if (newLongitude !== null) {
      setZoneID(null);
      setEditableDocument({
        ...editableDocument,
        zoneID: null,
      });
    }
  };
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = {
      title: !editableDocument.title,
      description: !editableDocument.description,
      stakeholders: !editableDocument.stakeholders,
      scale: !editableDocument.scale,
      issuanceDate: !editableDocument.issuanceDate,
      type: !editableDocument.type,
      latitude:
        !editableDocument.latitude &&
        zoneID == null &&
        editableDocument.customArea == null,
      longitude:
        !editableDocument.longitude &&
        zoneID == null &&
        editableDocument.customArea == null,
    };

    setFieldErrors(errors);
    if (!editableDocument.title) {
      setErrorMessage("Title is required");
      return;
    }
    if (!editableDocument.description) {
      setErrorMessage("Description is required");
      return;
    }
    if (!editableDocument.stakeholders) {
      setErrorMessage("Stakeholders are required");
      return;
    }
    if (
      editableDocument.latitude === null &&
      editableDocument.longitude === null &&
      zoneID === null &&
      customArea === null
    ) {
      setErrorMessage(
        "Please provide valid coordinates if no zone is selected."
      );
      return;
    }
    if (zoneID || customArea) {
      if (!editableDocument.latitude || !editableDocument.longitude) {
        setErrorMessage("Please provide valid coordinates");
        return;
      }
    }
    if (!editableDocument.scale) {
      setErrorMessage("Scale is required");
      return;
    }
    if (!editableDocument.issuanceDate) {
      setErrorMessage("Issuance date is required");
      return;
    }
    if (!editableDocument.type) {
      setErrorMessage("Type is required");
      return;
    }
    setErrorMessage(null);
    setIsReady(true);
  };

  useEffect(() => {
    const realSubmit = async () => {
      setIsReady(false);
      try {
        await API.updateDocument(
          currentDocument.id,
          zoneID !== null && zoneID !== undefined ? zoneID : null,
          editableDocument.longitude ? editableDocument.longitude : null,
          editableDocument.latitude ? editableDocument.latitude : null,
          editableDocument.stakeholders ? editableDocument.stakeholders : null,
          editableDocument.scale ? editableDocument.scale : null,
          editableDocument.title ? editableDocument.title : undefined,
          editableDocument.description
            ? editableDocument.description
            : undefined,
          editableDocument.issuanceDate
            ? editableDocument.issuanceDate
            : undefined,
          editableDocument.type ? editableDocument.type : undefined,
          editableDocument.language ? editableDocument.language : undefined
        );
        updateTable();
        onHide();
      } catch (error: any) {
        setErrorMessage(
          error.message ||
            "An error occurred while updating the currentDocument."
        );
      }
    };
    if (isReady) {
      realSubmit();
    }
  }, [isReady]);
  useEffect(() => {
    API.getStakeholders().then((res: any) => {
      const customStakeholders = res.map((stakeholder: any) => ({
        value: stakeholder,
        label: stakeholder,
      }));
      setStakeholderOptions([
        ...staticStakeholderOptions,
        ...customStakeholders,
      ]);
    });
  }, [show]);
  const handleScaleSelect = (selectedScale: any) => {
    const scalePattern = /^1:\d{1,3}(?:,\d{3})*$/;

    if (selectedScale) {
      if (scalePattern.test(selectedScale.label)) {
        setScale(selectedScale.label);
        setErrorMessage(null);
      } else if (
        selectedScale.label === "Blueprints/effects" ||
        selectedScale.label === "Concept" ||
        selectedScale.label === "Text"
      ) {
        setScale(selectedScale.label);
        setErrorMessage(null);
      } else {
        setScale("");
        setErrorMessage(
          "Invalid format. Please enter the scale as '1:1,000' or select a valid option."
        );
      }
    }
  };

  const handleZoneSelect = (zoneId: number | null) => {
    setTempZoneId(zoneId);
    setEditableDocument({
      ...editableDocument,
      zoneID: zoneId,
    });
    if (zoneId !== null) {
      setTempCoordinates({ lat: null, lng: null });
      setEditableDocument({
        ...editableDocument,
        latitude: null,
        longitude: null,
      });
    }
  };
  const handleStakeholderSelect = (selectedStakeholders: any) => {
    const valuesString = [...selectedStakeholders]
      .map((option) => option.value)
      .join(", ");

    setEditableDocument({
      ...editableDocument,
      stakeholders: valuesString,
    });
    setStakeholders(valuesString);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = format(date, "dd/MM/yyyy");
      setIssuanceDate(formattedDate);
      setEditableDocument({
        ...editableDocument,
        issuanceDate: formattedDate,
      });
    } else {
      setIssuanceDate("");
    }
  };
  const [showCalendar, setShowCalendar] = useState(false);
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
  const [issuanceDate, setIssuanceDate] = useState<string>("");
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

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      data-bs-theme="dark"
      className="new-doc"
    >
      <Modal.Header closeButton>
        <Modal.Title className="main-text">Edit Document</Modal.Title>
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
              <Form.Label className="main-text">Title*</Form.Label>
              <Form.Control
                type="text"
                value={editableDocument.title}
                onChange={(e) =>
                  setEditableDocument({
                    ...editableDocument,
                    title: e.target.value,
                  })
                }
              />
              {fieldErrors.title && (
                <div className="text-danger">
                  <i className="bi bi-x-circle-fill text-danger"></i> This field
                  is required
                </div>
              )}
            </Form.Group>

            <Form.Group as={Col} controlId="formStakeholders">
              <Form.Label className="main-text">Stakeholders*</Form.Label>
              <CustomSelectBox
                options={stakeholderOptions}
                handleSelect={handleStakeholderSelect}
                isMulti={true}
                value={currentDocument.stakeholders.split(",").map((item) => ({
                  value: item.trim(),
                  label: item.trim(),
                }))}
              />
              {fieldErrors.stakeholders && (
                <div className="text-danger">
                  <i className="bi bi-x-circle-fill text-danger"></i> This field
                  is required
                </div>
              )}
            </Form.Group>
          </Row>

          <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label className="main-text">Description*</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={editableDocument.description}
              onChange={(e) =>
                setEditableDocument({
                  ...editableDocument,
                  description: e.target.value,
                })
              }
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
              controlId="formMapButton"
              className="d-flex align-items-end"
            >
              <Button variant="secondary" onClick={() => setShowMapModal(true)}>
                Choose Location on Map
              </Button>
            </Form.Group>
          </Row>
          <Row>
            <Form.Group controlId="formAssignToKiruna">
              <Form.Switch
                className="main-text"
                label="Assign document to entire Kiruna area"
                checked={zoneID === 0}
                onChange={(e) => {
                  setZoneID(e.target.checked ? 0 : null);
                  setEditableDocument({
                    ...editableDocument,
                    zoneID: e.target.checked ? 0 : null,
                  });
                  if (e.target.checked) {
                    setLatitude(null);
                    setLongitude(null);
                    setEditableDocument({
                      ...editableDocument,
                      latitude: null,
                      longitude: null,
                    });
                  }
                }}
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formScale">
              <Form.Label className="main-text">Scale*</Form.Label>
              <CustomSelectBox
                options={scaleOptions}
                handleSelect={handleScaleSelect}
                isMulti={false}
                value={{
                  value: currentDocument.scale,
                  label: currentDocument.scale,
                }}
              />
              {fieldErrors.scale && (
                <div className="text-danger">
                  <i className="bi bi-x-circle-fill text-danger"></i> This field
                  is required
                </div>
              )}
            </Form.Group>

            <Form.Group as={Col} controlId="formIssuanceDate">
              <Form.Label className="main-text" style={{ display: "block" }}>
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
                    value={editableDocument.issuanceDate}
                    onChange={handleManualDateChange}
                  />
                </InputGroup>
              </div>
              {fieldErrors.issuanceDate && (
                <div className="text-danger">
                  <i className="bi bi-x-circle-fill text-danger"></i> This field
                  is required
                </div>
              )}
            </Form.Group>

            <Form.Group as={Col} controlId="formType">
              <Form.Label className="main-text">Type*</Form.Label>
              <Form.Control
                type="text"
                value={editableDocument.type}
                onChange={(e) => {
                  setEditableDocument({
                    ...editableDocument,
                    type: e.target.value,
                  });
                }}
              />
              {fieldErrors.type && (
                <div className="text-danger">
                  <i className="bi bi-x-circle-fill text-danger"></i> This field
                  is required
                </div>
              )}
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formLanguage">
              <Form.Label className="main-text">Language</Form.Label>
              <Form.Select
                value={editableDocument.language} // Bind to state
                onChange={(e) =>
                  setEditableDocument({
                    ...editableDocument,
                    language: e.target.value,
                  })
                }
              >
                <option value="English">English</option>
                <option value="Swedish">Swedish</option>
              </Form.Select>
            </Form.Group>

            <Form.Group as={Col} controlId="formPages">
              <Form.Label className="main-text">Pages</Form.Label>
              <Form.Control
                type="text"
                value={editableDocument.pages || ""}
                onChange={(e) =>
                  setEditableDocument({
                    ...editableDocument,
                    pages: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Row>
          {/* <Row>
            <div className="required-fields-note" style={{ color: "gray" }}>
              *Required fields
            </div>
          </Row> */}

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
    </Modal>
  );
}
