import React, { useState } from "react";
import { Feature, MultiPolygon } from "geojson";
import MapComponent from "../Map/MapComponent";
import { Alert } from "react-bootstrap";
import "./DocumentsMap.css";
import { TbPencilPin, TbPencilX } from "react-icons/tb";
import { useAuth } from "../../contexts/GlobalStateProvider";

const DocumentsMap: React.FC = () => {
  const { user } = useAuth();
  const [kirunaBoundary, setKirunaBoundary] =
    useState<Feature<MultiPolygon> | null>(null);
  const [showZones, setShowZones] = useState(false);
  const [showDocs, setShowDocs] = useState(true);
  const [highlightedDocumentId, setHighlightedDocumentId] = useState<
    number | null
  >(null);
  const [tempHighlightedDocumentId, setTempHighlightedDocumentId] = useState<
    number | null
  >(null);

  const [editMode, setEditMode] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [editZoneActive, setEditZoneActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handleManageZones = () => {
    setEditMode((prev) => {
      setShowDocs(prev);
      return !prev;
    });
    setShowZones(true); // Ensure zones are shown
    setSelectedZoneId(null); // Reset selected zone
    setEditZoneActive(false); // Reset editing state
  };

  const handleZoneSelect = (zoneId: number | null) => {
    setSelectedZoneId(zoneId);
    setEditZoneActive(true);
  };

  return (
    <>
      {user && user.role === "Urban Planner" && (
        <>
          <div
            tabIndex={0} // Makes the element focusable
            role="button"
            className="manage-zones-btn"
            style={{
              position: "absolute",
              bottom: "20px",
              left: "160px",
              zIndex: 1000,
            }}
            onClick={handleManageZones}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                console.log("Clicked via keyboard");
                event.preventDefault(); // Prevent scrolling on Space
                event.currentTarget.click();
              }
            }}
          >
            {editMode ? <TbPencilX size={20} /> : <TbPencilPin size={20} />}
            <span className="tooltip">
              {editMode ? "Exit Manage Zones" : "Manage Zones"}
            </span>
          </div>
          {errorMessage && (
            <Alert
              variant="danger"
              onClose={() => setErrorMessage(null)}
              dismissible
            >
              {errorMessage}
            </Alert>
          )}
        </>
      )}

      <MapComponent
        showZones={showZones}
        setShowZones={setShowZones}
        kirunaBoundary={kirunaBoundary}
        setKirunaBoundary={setKirunaBoundary}
        highlightedDocumentId={highlightedDocumentId}
        setHighlightedDocumentId={setHighlightedDocumentId}
        tempHighlightedDocumentId={tempHighlightedDocumentId}
        setTempHighlightedDocumentId={setTempHighlightedDocumentId}
        editMode={editMode}
        selectedZoneId={selectedZoneId}
        onZoneSelect={handleZoneSelect}
        editZoneActive={editZoneActive}
        showDocs={showDocs}
        setShowDocs={setShowDocs}
        setErrorMessage={setErrorMessage}
      />
    </>
  );
};

export default DocumentsMap;
