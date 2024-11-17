import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  FeatureGroup,
  useMapEvent,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import API from "../../API/API";

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
    geometry: GeoJSON.Geometry;
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

  const handleCustomDrawMode = () => {
    setTempCoordinates({ lat: null, lng: null });
    setHighlightedZoneId(null);
    onZoneSelect(null);
    setSelectionMode("custom");
  };

  const handleCreated = (e: any) => {
    const { layer } = e;
    const geoJson = layer.toGeoJSON();
    console.log("Custom Zone GeoJSON:", geoJson);
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
        >
          Draw Custom Area
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

        {selectionMode === "custom" && (
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topright"
              onCreated={handleCreated}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: {
                  allowIntersection: false,
                  showArea: true,
                },
              }}
            />
          </FeatureGroup>
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
            style={getZoneStyle(zone.id)}
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
