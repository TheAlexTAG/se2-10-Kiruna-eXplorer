import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMapEvent,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import API from "../../API/API";

interface MapComponentProps {
  onLocationSelect: () => void;
  tempCoordinates: { lat: number | null; lng: number | null };
  setTempCoordinates: (coords: {
    lat: number | null;
    lng: number | null;
  }) => void;
  onZoneSelect: (zoneId: number | null) => void;
}

type ZoneProps = {
  id: number;
  coordinates: {
    geometry: GeoJSON.Geometry;
  };
};

const MapComponent: React.FC<MapComponentProps> = ({
  onLocationSelect,
  tempCoordinates,
  setTempCoordinates,
  onZoneSelect,
}) => {
  const [zones, setZones] = useState<ZoneProps[]>([]);
  const [highlightedZoneId, setHighlightedZoneId] = useState<number | null>(
    null
  );
  const [selectionMode, setSelectionMode] = useState<"point" | "zone">("point");

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zonesData = await API.getZones();
        setZones(zonesData as ZoneProps[]);
      } catch (err) {
        console.error("Error fetching zones:", err);
      }
    };
    fetchZones();
  }, []);

  const PointClickHandler: React.FC = () => {
    useMapEvent("click", (e) => {
      if (selectionMode === "point") {
        setTempCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });
    return null;
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

  const handlePointMode = () => {
    setHighlightedZoneId(null);
    onZoneSelect(null);
    setSelectionMode("point");
  };

  const handleZoneMode = () => {
    setTempCoordinates({ lat: null, lng: null });
    setSelectionMode("zone");
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
          Select zone
        </button>
      </div>

      {/* Map Container */}
      <MapContainer
        center={[67.8558, 20.2253]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        {/* Base Layer */}
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

        {zones.map((zone) => (
          <GeoJSON
            key={zone.id}
            data={
              {
                type: "Feature",
                geometry: zone.coordinates.geometry,
                properties: {},
              } as GeoJSON.Feature
            }
            style={() => getZoneStyle(zone.id)}
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
