import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import MapComponent from "../Map/MapComponent";
import { Feature, MultiPolygon } from "geojson";
import { Alert } from "react-bootstrap";

interface GeoReferenceComponentProps {
  tempCoordinates: { lat: number | null; lng: number | null };
  setTempCoordinates: (coords: {
    lat: number | null;
    lng: number | null;
  }) => void;
  onZoneSelect: (zoneId: number | null) => void;
  selectionMode: string | null;
  setSelectionMode: (
    selectionMode: "point" | "newPoint" | "zone" | "custom" | null
  ) => void;
  highlightedZoneId: number | null;
  setHighlightedZoneId: (zoneId: number | null) => void;
  setTempCustom: (tempCustom: any) => void;
  customArea: any;
  kirunaBoundary: Feature<MultiPolygon> | null;
  setKirunaBoundary: (kirunaBoundary: Feature<MultiPolygon> | null) => void;
  highlightedDocumentId: number | null;
  setHighlightedDocumentId: Dispatch<SetStateAction<number | null>>;
  tempHighlightedDocumentId: number | null;
  setTempHighlightedDocumentId: Dispatch<SetStateAction<number | null>>;
  showZones: boolean;
  setShowZones: Dispatch<SetStateAction<boolean>>;
}

const GeoReferenceComponent: React.FC<GeoReferenceComponentProps> = ({
  tempCoordinates,
  setTempCoordinates,
  onZoneSelect,
  selectionMode,
  setSelectionMode,
  highlightedZoneId,
  setHighlightedZoneId,
  setTempCustom,
  customArea,
  kirunaBoundary,
  setKirunaBoundary,
  highlightedDocumentId,
  setHighlightedDocumentId,
  tempHighlightedDocumentId,
  setTempHighlightedDocumentId,
  showZones,
  setShowZones,
}) => {
  const [polygonExists, setPolygonExists] = useState(false);
  const [editControlKey, setEditControlKey] = useState(0);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearCustomPolygon = () => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      setTempCustom(null);
      setPolygonExists(false);
      setEditControlKey((prev) => prev + 1);
    }
  };

  const handlePointMode = () => {
    clearCustomPolygon();
    setHighlightedZoneId(null);
    onZoneSelect(null);
    setShowZones(false);
    setTempCustom(null);
    setSelectionMode("point");
  };
  const handleNewPointMode = () => {
    setHighlightedDocumentId(null);
    clearCustomPolygon();
    setHighlightedZoneId(null);
    onZoneSelect(null);
    setShowZones(false);
    setTempCustom(null);
    setSelectionMode("newPoint");
  };
  const handleZoneMode = () => {
    setHighlightedDocumentId(null);
    clearCustomPolygon();
    setTempCoordinates({ lat: null, lng: null });
    setShowZones(true);
    setTempCustom(null);
    setSelectionMode("zone");
  };

  const handleCustomDrawMode = () => {
    setHighlightedDocumentId(null);
    clearCustomPolygon();
    setTempCoordinates({ lat: null, lng: null });
    setHighlightedZoneId(null);
    onZoneSelect(null);
    setSelectionMode("custom");
  };
  return (
    <div>
      {selectionMode && (
        <div>
          <button
            onClick={handlePointMode}
            style={{
              margin: "10px",
              padding: "10px",
              cursor: "pointer",
              backgroundColor: selectionMode === "point" ? "blue" : "gray",
              color: "white",
            }}
          >
            Select Existing Point
          </button>
          <button
            onClick={handleNewPointMode}
            style={{
              margin: "10px",
              padding: "10px",
              cursor: "pointer",
              backgroundColor: selectionMode === "newPoint" ? "blue" : "gray",
              color: "white",
            }}
          >
            Add New Point
          </button>
          <button
            onClick={handleZoneMode}
            style={{
              margin: "10px",
              padding: "10px",
              cursor: "pointer",
              backgroundColor: selectionMode === "zone" ? "blue" : "gray",
              color: "white",
            }}
          >
            Select Existing Zone
          </button>
          <button
            onClick={handleCustomDrawMode}
            style={{
              margin: "10px",
              padding: "10px",
              cursor: "pointer",
              backgroundColor: selectionMode === "custom" ? "blue" : "gray",
              color: "white",
            }}
            disabled={polygonExists}
          >
            Draw Custom Area
          </button>
        </div>
      )}
      {errorMessage && (
        <Alert
          variant="danger"
          onClose={() => setErrorMessage(null)}
          dismissible
        >
          {errorMessage}
        </Alert>
      )}
      <MapComponent
        setErrorMessage={setErrorMessage}
        showZones={showZones}
        setShowZones={setShowZones}
        tempCoordinates={tempCoordinates}
        setTempCoordinates={setTempCoordinates}
        selectionMode={selectionMode}
        highlightedZoneId={highlightedZoneId}
        setHighlightedZoneId={setHighlightedZoneId}
        setTempCustom={setTempCustom}
        customArea={customArea}
        kirunaBoundary={kirunaBoundary}
        setKirunaBoundary={setKirunaBoundary}
        clearCustomPolygon={clearCustomPolygon}
        onZoneSelect={onZoneSelect}
        editControlKey={editControlKey}
        highlightedDocumentId={highlightedDocumentId}
        setHighlightedDocumentId={setHighlightedDocumentId}
        tempHighlightedDocumentId={tempHighlightedDocumentId}
        setTempHighlightedDocumentId={setTempHighlightedDocumentId}
      />
    </div>
  );
};

export default GeoReferenceComponent;
