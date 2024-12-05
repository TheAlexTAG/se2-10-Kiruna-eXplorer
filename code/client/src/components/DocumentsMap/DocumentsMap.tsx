import React, { useState } from "react";
/*import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import API from "../../API/API";
import "./DocumentsMap.css";
import { DocumentCard } from "../DocumentCard/DocumentCard";
import {
  BsEye,
  BsEyeSlash, x
  BsGeoAltFill,
  BsMap,
  BsMapFill,
} from "react-icons/bs";*/
import { Feature, MultiPolygon } from "geojson"; /*
import ReactDOMServer from "react-dom/server";*/
import MapComponent from "../Map/MapComponent";

const DocumentsMap: React.FC = () => {
  const [kirunaBoundary, setKirunaBoundary] =
    useState<Feature<MultiPolygon> | null>(null);
  const [showZones, setShowZones] = useState(false);
  const [highlightedDocumentId, setHighlightedDocumentId] = useState<
    number | null
  >(null);
  const [tempHighlightedDocumentId, setTempHighlightedDocumentId] = useState<
    number | null
  >(null);

  /*const reactIconHTML = ReactDOMServer.renderToString(
    <div /*className="custom-icon"*/ /*>
      <BsEye size={20} style={{ color: "green" }} />
    </div>
  );*/
  //to take into consideration for the future
  /* const workerIconHTML = ReactDOMServer.renderToString(
    <div className="custom-icon">
      <img src="/img/worker.png" style={{ width: "30px" }} />
    </div>
  );*/
  /*
  const iconsByType: { [key: string]: L.Icon | L.DivIcon } = {
    /*Conflict: L.divIcon({
      html: reactIconHTML,
      className: "custom-icon-border",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    }),*/
  /*Consultation: L.icon({
      iconUrl: "/img/consultation-icon.png",
      className: "custom-icon-border",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    }),
    Agreement: L.icon({
      iconUrl: "/img/agreement-icon.png",
      className: "custom-icon-border",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    }),
    Conflict: L.icon({
      iconUrl: "/img/conflict-icon.png",
      className: "custom-icon-border",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    }),
    "Material effect": L.icon({
      iconUrl: "/img/worker.png",
      className: "custom-icon-border",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    }),
    "Design doc.": L.icon({
      iconUrl: "/img/design-icon.png",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    }),
    "Informative doc.": L.icon({
      iconUrl: "/img/informative-icon.png",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    }),
    "Prescriptive doc.": L.icon({
      iconUrl: "/img/prescriptive-icon.png",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    }),
    "Technical doc.": L.icon({
      iconUrl: "/img/technical-icon.png",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    }),
    default: L.icon({
      iconUrl: "/img/doc.png",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    }),
  };

  const hotSpotCoordinates = {
    latitude: 67.84905775407694,
    longitude: 20.302734375000004,
  };

  const bounds = L.latLngBounds([
    [67.77, 20],
    [67.93, 20.5],
  ]);

 */

  return (
    <>
      <MapComponent
        showZones={showZones}
        setShowZones={setShowZones}
        kirunaBoundary={kirunaBoundary}
        setKirunaBoundary={setKirunaBoundary}
        highlightedDocumentId={highlightedDocumentId}
        setHighlightedDocumentId={setHighlightedDocumentId}
        tempHighlightedDocumentId={tempHighlightedDocumentId}
        setTempHighlightedDocumentId={setTempHighlightedDocumentId}
      />
    </>
  );
};

export default DocumentsMap;
