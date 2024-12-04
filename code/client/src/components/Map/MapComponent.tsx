import React, { useEffect, useState, useRef, SetStateAction } from "react";
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
import "./MapComponent.css";
import { BsEye, BsEyeSlash, BsMap, BsMapFill } from "react-icons/bs";
import { DocumentCard } from "../DocumentCard/DocumentCard";
import ReactDOMServer from "react-dom/server";
import AgreementIcon from "../../assets/icons/agreement-icon";
import ConflictIcon from "../../assets/icons/conflict-icon";
import ConsultationIcon from "../../assets/icons/consultation-icon";
import MaterialEffectIcon from "../../assets/icons/material-effect-icon";
import TechnicalIcon from "../../assets/icons/technical-icon";
import DesignIcon from "../../assets/icons/design-icon";
import PrescriptiveIcon from "../../assets/icons/prescriptive-icon";
import { GrDocumentText } from "react-icons/gr";
import KirunaDocs from "./KirunaDocs/KirunaDocs";

export type Document = {
  id: number;
  title: string;
  type: string;
  latitude: number;
  longitude: number;
  zoneID: number;
};
export type KirunaDocument = {
  id: number;
  title: string;
  type: string;
  latitude: null;
  longitude: null;
  zoneID: number;
};

interface MapComponentProps {
  tempCoordinates?: { lat: number | null; lng: number | null };
  setTempCoordinates?: (coords: {
    lat: number | null;
    lng: number | null;
  }) => void;
  onZoneSelect?: (zoneId: number | null) => void;
  selectionMode?: string | null;
  highlightedZoneId?: number | null;
  setHighlightedZoneId?: (zoneId: number | null) => void;
  setTempCustom?: (tempCustom: any) => void;
  kirunaBoundary: Feature<MultiPolygon> | null;
  setKirunaBoundary: (kirunaBoundary: Feature<MultiPolygon> | null) => void;
  clearCustomPolygon?: () => void;
  showZones: boolean;
  setShowZones: React.Dispatch<SetStateAction<boolean>>;
  setErrorMessage?: React.Dispatch<SetStateAction<string | null>>;
  editControlKey?: number;
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
  highlightedZoneId,
  setHighlightedZoneId,
  setTempCustom,
  kirunaBoundary,
  setKirunaBoundary,
  clearCustomPolygon,
  showZones,
  setShowZones,
  setErrorMessage,
  editControlKey,
}) => {
  const [kirunaDocuments, setKirunaDocuments] = useState<
    KirunaDocument[] | null
  >(null);
  const [showKirunaDocuments, setShowKirunaDocuments] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<
    Document | KirunaDocument | null
  >(null);
  const [zones, setZones] = useState<ZoneProps[]>([]);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const [polygonExists, setPolygonExists] = useState(false);
  const [isSatelliteView, setIsSatelliteView] = useState(true);

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
        console.log("data is ", data);
        const kirunaDocs = data.filter(
          (doc: KirunaDocument) => doc.zoneID === 0
        );
        setKirunaDocuments(kirunaDocs);
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

  const handleCreated = (e: any) => {
    const { layer } = e;
    const geoJson = layer.toGeoJSON();
    const drawnPolygon: Feature<GeoJSONPolygon> = turf.polygon(
      geoJson.geometry.coordinates
    );
    if (setErrorMessage) {
      if (
        setTempCustom !== undefined &&
        kirunaBoundary &&
        booleanWithin(drawnPolygon, kirunaBoundary)
      ) {
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
    }
  };

  const handleDeleted = () => {
    if (clearCustomPolygon) clearCustomPolygon();
  };

  const handleZoneClick = (zoneId: number | null) => {
    console.log("ciao");
    if (setHighlightedZoneId && onZoneSelect && selectionMode === "zone") {
      console.log("ciaone");
      setHighlightedZoneId(zoneId);
      onZoneSelect(zoneId);
    }
  };

  console.log("selection mode is ", selectionMode);
  const PointClickHandler: React.FC = () => {
    useMapEvent("click", (e) => {
      if (selectedDocument) {
        setSelectedDocument(null);
      }
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
            color: "red",
            weight: 2,
            dashArray: "5,10",
            fillOpacity: 0.03,
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
    const iconComponents: { [key: string]: JSX.Element } = {
      Agreement: <AgreementIcon width={30} height={30} />,
      Conflict: <ConflictIcon width={30} height={30} />,
      Consultation: <ConsultationIcon width={30} height={30} />,
      "Material effect": <MaterialEffectIcon width={30} height={30} />,
      "Technical doc.": <TechnicalIcon width={30} height={30} />,
      "Design doc.": <DesignIcon width={30} height={30} />,
      "Prescriptive doc.": <PrescriptiveIcon width={30} height={30} />,
      default: <PrescriptiveIcon width={30} height={30} />,
    };
    const selectedIcon = iconComponents[type] || iconComponents.default;
    return L.divIcon({
      html: ReactDOMServer.renderToString(selectedIcon),
      className: "custom-icon",
      iconSize: [40, 40],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  };
  const handleMoreClick = (doc: Document | KirunaDocument) => {
    setSelectedDocument(doc);
  };

  const handleOpenKirunaModal = () => {
    setSelectedDocument(null);
    setShowKirunaDocuments(true);
  };
  return (
    <div>
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
        {/*@ts-ignore*/}
        <MarkerClusterGroup>
          {/*for now we ignore MarkerClusterGroup type error, since everything works*/}
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
                {selectionMode ? (
                  ""
                ) : (
                  <div className="moreBtn" onClick={() => handleMoreClick(doc)}>
                    More
                  </div>
                )}
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

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
        {renderZones()}
      </MapContainer>
      {selectedDocument && (
        <DocumentCard
          cardInfo={selectedDocument}
          setSelectedDocument={setSelectedDocument}
        />
      )}
      <div
        onClick={toggleSatelliteView}
        className="map-toggle-btn"
        style={{
          position: "absolute",
          bottom: selectionMode ? "30px" : "20px",
          left: selectionMode ? "25px" : "10px",
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
          bottom: selectionMode ? "30px" : "20px",
          left: selectionMode ? "75px" : "60px",
          zIndex: 1000,
        }}
      >
        {showZones ? <BsEye size={20} /> : <BsEyeSlash size={20} />}
        <span className="tooltip">
          {showZones ? "Hide Zones" : "Show Zones"}
        </span>
      </div>
      {!selectionMode && (
        <>
          <div
            onClick={handleOpenKirunaModal}
            className="kiruna-doc-btn"
            style={{
              position: "absolute",
              top: "160px",
              left: "10px",
              zIndex: 1000,
            }}
          >
            <GrDocumentText />
            <span className="tooltip">Show Kiruna Municipality Documents</span>
          </div>
          <KirunaDocs
            show={showKirunaDocuments}
            onClose={() => setShowKirunaDocuments(false)}
            kirunaDocuments={kirunaDocuments}
            handleMoreClick={handleMoreClick}
          />
        </>
      )}
    </div>
  );
};

export default MapComponent;
