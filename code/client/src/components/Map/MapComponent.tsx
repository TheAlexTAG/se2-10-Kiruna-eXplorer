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
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "react-leaflet-markercluster/dist/styles.min.css";
import L from "leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import * as turf from "@turf/turf";
import booleanWithin from "@turf/boolean-within";
import { Feature, Polygon as GeoJSONPolygon, MultiPolygon } from "geojson"; // Import from GeoJSON spec
import API from "../../API/API";
import { Alert, Button } from "react-bootstrap";
import "./MapComponent.css";
import { BsEye, BsEyeSlash, BsMap, BsMapFill } from "react-icons/bs";
import { DocumentCard } from "../DocumentCard/DocumentCard";

type Document = {
  id: number;
  title: string;
  type: string;
  latitude: number;
  longitude: number;
};

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
  kirunaBoundary: Feature<MultiPolygon> | null;
  setKirunaBoundary: (kirunaBoundary: Feature<MultiPolygon> | null) => void;
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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [zones, setZones] = useState<ZoneProps[]>([]);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const [polygonExists, setPolygonExists] = useState(false);
  const [editControlKey, setEditControlKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSatelliteView, setIsSatelliteView] = useState(true);
  const [showZones, setShowZones] = useState(false);

  const defaultTileLayer = [
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "&copy; OpenStreetMap contributors",
  ];
  const satelliteTileLayer = [
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  ];

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await API.getDocuments();
        setDocuments(
          data.filter((doc: Document) => doc.latitude && doc.longitude)
        );
      } catch (err) {
        console.error("Error fetching documents: ", err);
      }
    };

    const fetchZones = async () => {
      try {
        const zonesData = await API.getZones();
        console.log("zonesdata is ", zonesData);
        setZones(zonesData as ZoneProps[]);
        const kirunaZone = zonesData.find((zone: ZoneProps) => zone.id === 0);
        if (kirunaZone) {
          const boundary: Feature<MultiPolygon> = turf.multiPolygon(
            kirunaZone.coordinates.coordinates
          );
          setKirunaBoundary(boundary);
        }
      } catch (err) {
        console.error("Error fetching zones:", err);
      }
    };
    fetchDocuments();
    fetchZones();
  }, []);

  console.log("kiruna boundary is ", kirunaBoundary);
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
      setShowZones(true);
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
          eventHandlers={{
            click: () => {
              handleZoneClick(null);
            },
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
    if (selectionMode !== "zone") setShowZones((prev) => !prev);
  };

  const renderZones = () => {
    if (!showZones) return null;

    return (
      <FeatureGroup>
        {zones
          .filter((zone) => zone.id !== 0)
          .map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.coordinates.coordinates[0].map(([lng, lat]) => [
                lat,
                lng,
              ])}
              pathOptions={{
                color: highlightedZoneId === zone.id ? "blue" : "green",
                fillOpacity: 0.2,
              }}
              eventHandlers={{
                click: () => {
                  handleZoneClick(zone.id);
                },
              }}
            />
          ))}
      </FeatureGroup>
    );
  };

  const getIconByType = (type: string) => {
    const iconUrls: { [key: string]: string } = {
      Agreement: "/img/agreement-icon.png",
      Conflict: "/img/conflict-icon.png",
      Consultation: "/img/consultation-icon.png",
      "Material effect": "/img/worker.png",
      default: "/img/doc.png",
    };

    return L.icon({
      iconUrl: iconUrls[type] || iconUrls.default,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  };
  console.log("get icon by type gives me ", getIconByType("Conflict"));
  const handleMoreClick = (doc: Document) => {
    setSelectedDocument(doc);
  };
  console.log("selected document is ", selectedDocument);

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
      >
        {isSatelliteView ? (
          <TileLayer
            key="satellite"
            url={satelliteTileLayer[0]}
            attribution={satelliteTileLayer[1]}
          />
        ) : (
          <TileLayer
            key="default"
            url={defaultTileLayer[0]}
            attribution={defaultTileLayer[1]}
          />
        )}

        <MarkerClusterGroup>
          {documents.map((doc) => (
            <Marker
              key={doc.id}
              position={[doc.latitude, doc.longitude]}
              icon={getIconByType(doc.type)}
            >
              <Popup>
                <b>{doc.title}</b>
                <br />
                Type: {doc.type}
                <br />
                <div className="moreBtn" onClick={() => handleMoreClick(doc)}>
                  More
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
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
        {renderZones()}

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
      </MapContainer>{" "}
      {selectedDocument && (
        <DocumentCard
          cardInfo={selectedDocument}
          iconToShow={getIconByType(selectedDocument.type).options.iconUrl}
        />
      )}
    </div>
  );
};

export default MapComponent;
