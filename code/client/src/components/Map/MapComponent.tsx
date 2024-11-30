import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  FeatureGroup,
  useMapEvent,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import * as turf from "@turf/turf";
import booleanWithin from "@turf/boolean-within";
import { Feature, Polygon as GeoJSONPolygon } from "geojson"; // Import from GeoJSON spec
import API from "../../API/API";
import { Alert } from "react-bootstrap";
import "./MapComponent.css";
import { BsEye, BsEyeSlash, BsMap, BsMapFill } from "react-icons/bs";

interface MapComponentProps {
  tempCoordinates?: { lat: number | null; lng: number | null };
  setTempCoordinates?: (coords: {
    lat: number | null;
    lng: number | null;
  }) => void;
  onZoneSelect?: (zoneId: number | null) => void;
  setTempZoneId?: (zoneId: number | null) => void;
  selectionMode?: string | null;
  setSelectionMode?: (
    selectionMode: "point" | "zone" | "custom" | null
  ) => void;
  highlightedZoneId?: number | null;
  setHighlightedZoneId?: (zoneId: number | null) => void;
  setTempCustom?: (tempCustom: any) => void;
  kirunaBoundary: Feature<GeoJSONPolygon> | null;
  setKirunaBoundary: (kirunaBoundary: Feature<GeoJSONPolygon> | null) => void;
}

type ZoneProps = {
  id: number;
  coordinates: {
    type: "Polygon";
    coordinates: number[][][]; // Array of polygons, each with an array of [lng, lat]
  };
};

const MapComponent: React.FC<MapComponentProps> = ({
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
  const mapRef = useRef<L.Map | null>(null);
  const [zones, setZones] = useState<ZoneProps[]>([]);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const [polygonExists, setPolygonExists] = useState(false);
  const [editControlKey, setEditControlKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [showZones, setShowZones] = useState(false);
  /*const defaultTileLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "&copy; OpenStreetMap contributors" }
  );*/
  const defaultTileLayer = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const satelliteTileLayer =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  useEffect(() => {
    if (mapRef.current) {
      const newLayer = L.tileLayer(
        isSatelliteView ? satelliteTileLayer : defaultTileLayer,
        {
          attribution: isSatelliteView
            ? "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
            : "&copy; OpenStreetMap contributors",
        }
      );
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) mapRef.current?.removeLayer(layer);
      });
      newLayer.addTo(mapRef.current);
    }
  }, [isSatelliteView]);

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
    if (setTempCustom !== undefined && featureGroupRef.current) {
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
    console.log("drawn polygon is ", drawnPolygon);
    console.log("drawn kirunaBoundary is ", kirunaBoundary);

    if (
      setTempCustom !== undefined &&
      kirunaBoundary &&
      booleanWithin(drawnPolygon, kirunaBoundary)
    ) {
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
  console.log("drawn kiruna outside", kirunaBoundary);

  const handleDeleted = () => {
    clearCustomPolygon();
  };

  const handlePointMode = () => {
    if (
      setSelectionMode &&
      setHighlightedZoneId &&
      onZoneSelect &&
      setSelectionMode
    ) {
      clearCustomPolygon();
      setHighlightedZoneId(null);
      onZoneSelect(null);
      setSelectionMode("point");
    }
  };
  const handleZoneMode = () => {
    if (setTempCoordinates && setTempCoordinates && setSelectionMode) {
      clearCustomPolygon();
      setTempCoordinates({ lat: null, lng: null });
      setSelectionMode("zone");
    }
  };

  const handleCustomDrawMode = () => {
    if (
      setTempCoordinates &&
      setHighlightedZoneId &&
      onZoneSelect &&
      setSelectionMode
    ) {
      clearCustomPolygon();
      setTempCoordinates({ lat: null, lng: null });
      setHighlightedZoneId(null);
      onZoneSelect(null);
      setSelectionMode("custom");
    }
  };

  const getZoneStyle = (zoneId: number) => ({
    color: highlightedZoneId === zoneId ? "blue" : "green",
    weight: 2,
    fillColor: highlightedZoneId === zoneId ? "blue" : "green",
    fillOpacity: highlightedZoneId === zoneId ? 0.4 : 0.2,
  });

  const handleZoneClick = (zoneId: number | null) => {
    if (setHighlightedZoneId && onZoneSelect && selectionMode === "zone") {
      setHighlightedZoneId(zoneId);
      onZoneSelect(zoneId);
    }
  };

  const PointClickHandler: React.FC = () => {
    useMapEvent("click", (e) => {
      if (setTempCoordinates && selectionMode === "point") {
        setTempCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });
    return null;
  };

  const renderKirunaBoundary = () => {
    if (kirunaBoundary) {
      return (
        <GeoJSON
          key={kirunaBoundary.id}
          data={
            {
              type: "Feature",
              geometry: kirunaBoundary.geometry,
              properties: {},
            } as GeoJSON.Feature
          }
          style={{
            color: "green",
            weight: 2,
            dashArray: "5,10",
            fillOpacity: 0.05,
          }}
        />
      );
    }
    return null;
  };
  console.log("zones are ", zones);
  console.log("kiruna boundary is ", kirunaBoundary);
  const toggleSatelliteView = () => {
    setIsSatelliteView((prev) => !prev);
  };
  const toggleZonesView = () => {
    setShowZones((prev) => !prev);
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

      <MapContainer
        center={[67.8558, 20.2253]}
        zoom={13}
        style={
          selectionMode
            ? {
                height: "400px",
                width: "100%",
              }
            : {
                position: "fixed",
                top: "60px",
                left: 0,
                height: "calc(100vh - 60px)",
                width: "100vw",
                zIndex: 0,
              }
        }
        whenReady={(mapInstance) => {
          mapRef.current = mapInstance;
          L.tileLayer(defaultTileLayer, {
            attribution: "&copy; OpenStreetMap contributors",
          }).addTo(mapInstance);
        }}
      >
        <div
          onClick={toggleSatelliteView}
          className="map-toggle-btn"
          style={{
            position: "absolute",
            bottom: "20px",
            left: "10px",
            zIndex: 1000,
          }}
        >
          {isSatelliteView ? <BsMapFill size={20} /> : <BsMap size={20} />}
          <span className="tooltip">
            {isSatelliteView
              ? "Switch to Default View"
              : "Switch to Satellite View"}
          </span>
        </div>
        <div
          onClick={toggleZonesView}
          className="map-toggle-btn"
          style={{
            position: "absolute",
            bottom: "20px",
            left: "60px",
            zIndex: 1000,
          }}
        >
          {showZones ? <BsEye size={20} /> : <BsEyeSlash size={20} />}
          <span className="tooltip">
            {showZones ? "Hide Zones" : "Show Zones"}
          </span>
        </div>
        */
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PointClickHandler />
        {renderKirunaBoundary()}
        {tempCoordinates && tempCoordinates.lat && tempCoordinates.lng && (
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
        {setHighlightedZoneId &&
          onZoneSelect &&
          zones.map((zone) => {
            if (zone.id === 0) {
              return (
                <Polygon
                  key={0}
                  positions={zone.coordinates.coordinates[0].map(
                    ([lng, lat]) => [lat, lng]
                  )}
                  pathOptions={{ opacity: 0, fillOpacity: 0 }}
                  eventHandlers={{
                    click: () => handleZoneClick(null),
                  }}
                />
              );
            }
            return (
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
            );
          })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
