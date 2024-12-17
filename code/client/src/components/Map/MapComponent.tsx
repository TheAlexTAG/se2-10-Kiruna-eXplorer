import React, {
  useEffect,
  useState,
  useRef,
  SetStateAction,
  Dispatch,
} from "react";
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
import KirunaDocs from "./KirunaDocs/KirunaDocs";
import { PiBird } from "react-icons/pi";
import { IoDocumentOutline, IoDocumentSharp } from "react-icons/io5";

import { Button, InputGroup, Form } from "react-bootstrap";

declare module "leaflet" {
  interface MarkerOptions {
    docId?: number;
  }
}

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
  customArea?: any;
  kirunaBoundary: Feature<MultiPolygon> | null;
  setKirunaBoundary: (kirunaBoundary: Feature<MultiPolygon> | null) => void;
  clearCustomPolygon?: () => void;
  showZones: boolean;
  setShowZones: React.Dispatch<SetStateAction<boolean>>;
  setErrorMessage?: React.Dispatch<SetStateAction<string | null>>;
  editControlKey?: number;
  highlightedDocumentId: number | null;
  setHighlightedDocumentId: Dispatch<SetStateAction<number | null>>;
  tempHighlightedDocumentId: number | null;
  setTempHighlightedDocumentId: Dispatch<SetStateAction<number | null>>;
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
  customArea,
  kirunaBoundary,
  setKirunaBoundary,
  clearCustomPolygon,
  showZones,
  setShowZones,
  setErrorMessage,
  editControlKey,
  highlightedDocumentId,
  setHighlightedDocumentId,
  tempHighlightedDocumentId,
  setTempHighlightedDocumentId,
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
  const [showDocs, setShowDocs] = useState(true);
  const [hoveredZoneId, setHoveredZoneId] = useState<number | null>(null);
  const [selectedHoveredZoneId, setSelectedHoveredZoneId] = useState<
    number | null
  >(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDocuments(documents);
    } else {
      setFilteredDocuments(
        documents.filter((doc) =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, documents]);

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
        // console.log("data is ", data);
        const kirunaDocs = data.filter(
          (doc: KirunaDocument) => doc.zoneID === 0
        );

        setKirunaDocuments(kirunaDocs);
        const validDocs = data.filter(
          (doc: Document) => doc.latitude && doc.longitude
        );
        setDocuments(validDocs);
        setFilteredDocuments(validDocs);
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
    setTempHighlightedDocumentId(highlightedDocumentId);
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
    // console.log("ciao");
    if (setHighlightedZoneId && onZoneSelect && selectionMode === "zone") {
      // console.log("ciaone");
      setHighlightedZoneId(zoneId);
      onZoneSelect(zoneId);
    }
  };

  // console.log("selection mode is ", selectionMode);
  const PointClickHandler: React.FC = () => {
    useMapEvent("click", (e) => {
      setSelectedDocument(null);
      setTempHighlightedDocumentId(null);
      setSelectedHoveredZoneId(null);
      handleDocumentLeave();

      if (setTempCoordinates) {
        if (selectionMode === "point") {
          setTempCoordinates({ lat: null, lng: null });
        } else if (selectionMode === "newPoint") {
          setTempCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
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
  const toggleDocsView = () => {
    setShowDocs((prev) => !prev);
  };

  const renderCustomPolygon = () => {
    // console.log("helli", customArea);
    if (selectionMode !== "custom" || !selectionMode) {
      return null;
    }

    if (customArea) {
      // console.log("hell");
      return (
        <FeatureGroup>
          {zones
            .filter((zone) => zone.id === 1)
            .map((zone) => (
              <Polygon
                key={zone.id}
                positions={customArea.map(([lng, lat]: [number, number]) => [
                  lat,
                  lng,
                ])}
                pathOptions={{
                  color: "blue",
                  fillOpacity: 0.2,
                }}
              />
            ))}
        </FeatureGroup>
      );
    }
  };
  // console.log("zones is ", zones);
  // console.log("custom area is ", customArea);

  const renderSelectedHoveredZone = () => {
    if (!selectedHoveredZoneId) return null;

    const selectedHoveredZone = zones.find(
      (zone) => zone.id === selectedHoveredZoneId
    );
    if (!selectedHoveredZone) return null;

    return (
      <Polygon
        key={selectedHoveredZone.id}
        positions={selectedHoveredZone.coordinates.coordinates[0].map(
          ([lng, lat]) => [lat, lng]
        )}
        pathOptions={{ color: "red", fillOpacity: 0.5 }}
      />
    );
  };

  const renderHoveredZone = () => {
    if (!hoveredZoneId) return null;

    const hoveredZone = zones.find((zone) => zone.id === hoveredZoneId);
    if (!hoveredZone) return null;

    return (
      <Polygon
        key={hoveredZone.id}
        positions={hoveredZone.coordinates.coordinates[0].map(([lng, lat]) => [
          lat,
          lng,
        ])}
        pathOptions={{
          color: "pink",
          fillOpacity: 0.5,
        }}
      />
    );
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
                color:
                  highlightedZoneId === zone.id
                    ? "blue"
                    : hoveredZoneId === zone.id
                    ? "orange"
                    : "green",
                fillOpacity: hoveredZoneId === zone.id ? 0.5 : 0.2,
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
  const iconSize = 20;

  const getIconByType = (type: string, isHighlighted: boolean) => {
    const iconComponents: { [key: string]: JSX.Element } = {
      Agreement: <AgreementIcon width={iconSize} height={iconSize} />,
      Conflict: <ConflictIcon width={iconSize} height={iconSize} />,
      Consultation: <ConsultationIcon width={iconSize} height={iconSize} />,
      "Material effect": (
        <MaterialEffectIcon width={iconSize} height={iconSize} />
      ),
      "Technical doc.": <TechnicalIcon width={iconSize} height={iconSize} />,
      "Design doc.": <DesignIcon width={iconSize} height={iconSize} />,
      "Prescriptive doc.": (
        <PrescriptiveIcon width={iconSize} height={iconSize} />
      ),
      default: <PrescriptiveIcon width={iconSize} height={iconSize} />,
    };
    const selectedIcon = iconComponents[type] || iconComponents.default;
    return L.divIcon({
      html: `<div>${ReactDOMServer.renderToString(selectedIcon)}</div>`,
      className: isHighlighted ? "custom-icon highlighted" : "custom-icon",
      iconSize: isHighlighted ? [42, 42] : [40, 40],
      iconAnchor: [15, 15],
      /*popupAnchor: [0, -15],*/
    });
  };
  const handleMoreClick = (doc: Document | KirunaDocument) => {
    if (selectionMode === null || selectionMode === undefined) {
      setSelectedHoveredZoneId(doc.zoneID);
      setSelectedDocument(doc);
      setHighlightedDocumentId(doc.id);
      setTempHighlightedDocumentId(doc.id);
      setHoveredZoneId(null);
    }
  };

  const handleOpenKirunaModal = () => {
    setSelectedDocument(null);
    setHighlightedDocumentId(null);
    setTempHighlightedDocumentId(null);
    setShowKirunaDocuments(true);
  };

  // console.log("Test - tempCoords are ", tempCoordinates);
  // console.log("Test - zone id is ", highlightedZoneId);
  // console.log("Test - highlighted documetn id ", highlightedDocumentId);
  // console.log("Test - selectedDocument is ", selectedDocument);
  // console.log("Test - selectionMode is ", selectionMode);

  const handleDocumentHover = (doc: Document | KirunaDocument) => {
    if (selectedHoveredZoneId !== doc.zoneID) setHoveredZoneId(doc.zoneID);
  };

  const handleDocumentLeave = () => {
    setHoveredZoneId(null);
  };

  const markerRefs = useRef<Record<number, L.Marker>>({});

  const handleSelectedDocument = (document: any) => {
    setSelectedDocument(document);
    setHighlightedDocumentId(document.id);
    setTempHighlightedDocumentId(document.id);
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
        <MarkerClusterGroup
          key={`${tempHighlightedDocumentId}-${filteredDocuments
            .map((doc) => doc.id)
            .join(",")}`}
          spiderfyOnMaxZoom={true} // Keep spiderfying behavior
          zoomToBoundsOnClick={true} // Allow zoom on cluster click
          showCoverageOnHover={false} // Disable coverage hover
          iconCreateFunction={(cluster) => {
            const childMarkers = cluster.getAllChildMarkers();
            // console.log("childmarkers are: ", childMarkers);
            const containsHighlightedDoc = childMarkers.some((marker) => {
              // console.log("temp high is ", tempHighlightedDocumentId);
              // console.log("temp mark option id is ", marker.options.docId);
              return marker.options.docId === tempHighlightedDocumentId;
            });
            // console.log("containshigghlighteddoc: ", containsHighlightedDoc);
            const className = containsHighlightedDoc
              ? "hotspot-cluster-icon"
              : "custom-cluster-icon";
            const size =
              childMarkers.length < 10
                ? "small-cluster"
                : childMarkers.length < 50
                ? "medium-cluster"
                : "large-cluster";
            return L.divIcon({
              html: `<div class="${className} ${size}">${childMarkers.length}</div>`,
              className: "",
              iconSize: L.point(40, 40, true),
            });
          }}
        >
          {/*for now we ignore MarkerClusterGroup type error, since everything works*/}
          {showDocs &&
            filteredDocuments.map((doc) => (
              <Marker
                key={doc.id}
                position={[doc.latitude, doc.longitude]}
                icon={getIconByType(
                  doc.type,
                  doc.id === tempHighlightedDocumentId
                )}
                eventHandlers={
                  selectionMode === "point" && setTempCoordinates
                    ? {
                        click: () => {
                          setTempHighlightedDocumentId(doc.id);
                          setTempCoordinates({
                            lat: doc.latitude,
                            lng: doc.longitude,
                          });
                        },
                        mouseover: (e) => {
                          e.target.openPopup();
                        },
                        mouseout: (e) => {
                          e.target.closePopup();
                        },
                      }
                    : {
                        click: () => {
                          setTempHighlightedDocumentId(doc.id);
                          handleMoreClick(doc);
                        },
                        mouseover: (e) => {
                          e.target.openPopup();
                          handleDocumentHover(doc);
                        },
                        mouseout: (e) => {
                          handleDocumentLeave();
                          e.target.closePopup(); /*just a guess lol*/
                        },
                      }
                }
                ref={(markerInstance) => {
                  if (markerInstance) {
                    markerRefs.current[doc.id] = markerInstance;
                    markerInstance.options.docId = doc.id;
                  }
                }}
              >
                <Popup className="custom-popup" offset={[0, -20]}>
                  <div className="custom-tooltip">
                    <b>{doc.title}</b>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>

        <PointClickHandler />
        {renderKirunaBoundary()}
        {tempCoordinates &&
          tempCoordinates.lat &&
          tempCoordinates.lng &&
          selectionMode === "newPoint" && (
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
        {renderCustomPolygon()}
        {renderHoveredZone()}
        {renderSelectedHoveredZone()}
      </MapContainer>
      {selectedDocument && (
        <DocumentCard
          cardInfo={selectedDocument}
          setSelectedDocument={handleSelectedDocument}
          inDiagram={false}
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
      <div
        onClick={toggleDocsView}
        className="map-toggle-btn"
        style={{
          position: "absolute",
          bottom: selectionMode ? "30px" : "20px",
          left: selectionMode ? "125px" : "110px",
          zIndex: 1000,
        }}
      >
        {showDocs ? (
          <IoDocumentSharp size={20} />
        ) : (
          <IoDocumentOutline size={20} />
        )}
        <span className="tooltip">{showDocs ? "Hide Docs" : "Show Docs"}</span>
      </div>
      {!selectionMode && (
        <>
          <InputGroup
            style={{
              position: "absolute",
              top: "69px",
              right: "10px",
              zIndex: 1000,
              width: "300px",
            }}
          >
            <Form.Control
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="secondary" onClick={() => setSearchTerm("")}>
              Clear
            </Button>
          </InputGroup>

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
            <PiBird />
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
