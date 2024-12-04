import React, { useRef, useState } from "react";
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
  setSelectionMode: (selectionMode: "point" | "zone" | "custom" | null) => void;
  highlightedZoneId: number | null;
  setHighlightedZoneId: (zoneId: number | null) => void;
  setTempCustom: (tempCustom: any) => void;
  kirunaBoundary: Feature<MultiPolygon> | null;
  setKirunaBoundary: (kirunaBoundary: Feature<MultiPolygon> | null) => void;
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
  kirunaBoundary,
  setKirunaBoundary,
}) => {
  const [showZones, setShowZones] = useState<boolean>(false);
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
    setSelectionMode("point");
  };
  const handleZoneMode = () => {
    clearCustomPolygon();
    setTempCoordinates({ lat: null, lng: null });
    setShowZones(true);
    setSelectionMode("zone");
  };

  const handleCustomDrawMode = () => {
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
            Select Point
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
            Select Zone
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
        kirunaBoundary={kirunaBoundary}
        setKirunaBoundary={setKirunaBoundary}
        clearCustomPolygon={clearCustomPolygon}
        onZoneSelect={onZoneSelect}
        editControlKey={editControlKey}
      />
    </div>
  );
};

export default GeoReferenceComponent;