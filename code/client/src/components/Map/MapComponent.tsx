import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  FeatureGroup,
  useMapEvent,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import * as turf from "@turf/turf";
import booleanWithin from "@turf/boolean-within";
import { Feature, Polygon as GeoJSONPolygon } from "geojson"; // Import from GeoJSON spec
import API from "../../API/API";
import { Alert } from "react-bootstrap";

interface MapComponentProps {
  onLocationSelect: () => void;
  tempCoordinates: { lat: number | null; lng: number | null };
  setTempCoordinates: (coords: {
    lat: number | null;
    lng: number | null;
  }) => void;
  onZoneSelect: (zoneId: number | null) => void;
  setTempZoneId: (zoneId: number | null) => void;
  selectionMode: string;
  setSelectionMode: (selectionMode: "point" | "zone" | "custom") => void;
  highlightedZoneId: number | null;
  setHighlightedZoneId: (zoneId: number | null) => void;
  tempCustom: any;
  setTempCustom: (tempCustom: any) => void;
}

type ZoneProps = {
  id: number;
  coordinates: {
    type: "Polygon";
    coordinates: number[][][]; // Array of polygons, each with an array of [lng, lat]
  };
};

const MapComponent: React.FC<MapComponentProps> = ({
  onLocationSelect,
  tempCoordinates,
  setTempCoordinates,
  onZoneSelect,
  setTempZoneId,
  selectionMode,
  setSelectionMode,
  highlightedZoneId,
  setHighlightedZoneId,
  tempCustom,
  setTempCustom,
}) => {
  const [zones, setZones] = useState<ZoneProps[]>([]);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const [polygonExists, setPolygonExists] = useState(false);
  const [kirunaBoundary, setKirunaBoundary] =
    useState<Feature<GeoJSONPolygon> | null>(null);
  const [editControlKey, setEditControlKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zonesData = await API.getZones();
        setZones(zonesData as ZoneProps[]);
        const kirunaZone = zonesData.find((zone: ZoneProps) => zone.id === 0);
        if (kirunaZone) {
          const boundary: Feature<GeoJSONPolygon> = turf.polygon(
            kirunaZone.coordinates.coordinates
          );
          setKirunaBoundary(boundary);
        }
      } catch (err) {
        console.error("Error fetching zones:", err);
      }
    };
    fetchZones();
  }, []);

  const clearCustomPolygon = () => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      setTempCustom(null);
      setPolygonExists(false);
      setEditControlKey((prev) => prev + 1);
    }
  };

  const handleCreated = (e: any) => {
    const { layer } = e;
    const geoJson = layer.toGeoJSON();
    const drawnPolygon: Feature<GeoJSONPolygon> = turf.polygon(
      geoJson.geometry.coordinates
    );

    if (kirunaBoundary && booleanWithin(drawnPolygon, kirunaBoundary)) {
      console.log("Polygon is valid and within Kiruna!");
      setErrorMessage(null);
      setTempCustom(geoJson.geometry.coordinates[0]);
      setPolygonExists(true);
    } else {
      console.error("Polygon is outside the Kiruna boundary!");
      setErrorMessage("Polygon is outside the Kiruna boundary!");
      if (featureGroupRef.current) {
        featureGroupRef.current.removeLayer(layer); // Remove invalid polygon
      }
    }
  };

  const handleDeleted = () => {
    clearCustomPolygon();
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
    setSelectionMode("zone");
  };

  const handleCustomDrawMode = () => {
    clearCustomPolygon();
    setTempCoordinates({ lat: null, lng: null });
    setHighlightedZoneId(null);
    onZoneSelect(null);
    setSelectionMode("custom");
  };

  const getZoneStyle = (zoneId: number) => ({
    color: highlightedZoneId === zoneId ? "blue" : "green",
    weight: 2,
    fillColor: highlightedZoneId === zoneId ? "blue" : "green",
    fillOpacity: highlightedZoneId === zoneId ? 0.4 : 0.2,
  });

  const handleZoneClick = (zoneId: number) => {
    if (selectionMode === "zone") {
      setHighlightedZoneId(zoneId);
      onZoneSelect(zoneId);
    }
  };

  const PointClickHandler: React.FC = () => {
    useMapEvent("click", (e) => {
      if (selectionMode === "point") {
        setTempCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });
    return null;
  };

  return (
    <div>
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
      {errorMessage && (
        <Alert
          variant="danger"
          onClose={() => setErrorMessage(null)}
          dismissible
        >
          {errorMessage}
        </Alert>
      )}
      <MapContainer
        center={[67.8558, 20.2253]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <PointClickHandler />

        {tempCoordinates.lat && tempCoordinates.lng && (
          <Marker position={[tempCoordinates.lat, tempCoordinates.lng]}>
            <Popup>You selected this point.</Popup>
          </Marker>
        )}

        {selectionMode === "custom" && (
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              key={editControlKey} //apparently I need this to force re rendering after delete
              position="topright"
              onCreated={handleCreated}
              onDeleted={handleDeleted}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: polygonExists
                  ? false
                  : {
                      allowIntersection: false,
                      showArea: false,
                    },
              }}
              edit={{ remove: true }} //sometimes also removing this works (better not to take chances though)
            />
          </FeatureGroup>
        )}

        {zones.map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.coordinates.coordinates[0].map(([lng, lat]) => [
              lat,
              lng,
            ])}
            pathOptions={getZoneStyle(zone.id)}
            eventHandlers={{
              click: () => handleZoneClick(zone.id),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
