import React, { useEffect, useState, useRef } from "react";
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
import {
  Feature,
  FeatureCollection,
  Geometry,
  Polygon as GeoJSONPolygon,
} from "geojson"; /*
import ReactDOMServer from "react-dom/server";*/
import MapComponent from "../Map/MapComponent";

interface Document {
  id: number;
  title: string;
  type: string;
  latitude: number;
  longitude: number;
}

interface Zone {
  id: number;
  coordinates: GeoJSON.Geometry;
}

const DocumentsMap: React.FC = () => {
  const [kirunaBoundary, setKirunaBoundary] =
    useState<Feature<GeoJSONPolygon> | null>(null);
  /*const [documents, setDocuments] = useState<Document[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  // const [kirunaBoundary, setKirunaBoundary] = useState<L.GeoJSON | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [showZones, setShowZones] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const defaultTileLayer = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const satelliteTileLayer =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  useEffect(() => {
    const fetchDocuments = async () => {
      const data = await API.getDocuments();
      setDocuments(
        data.filter((item: Document) => item.latitude && item.longitude)
      );
    };

    fetchDocuments();

    if (mapRef.current === null) {
      mapRef.current = L.map("documents-map", {
        maxBounds: bounds,
        maxBoundsViscosity: 1,
        minZoom: 12,
        maxZoom: 18,
        zoomControl: true,
      }).setView([67.84, 20.2253], 12);

      tileLayerRef.current = L.tileLayer(defaultTileLayer, {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      mapRef.current.on("popupclose", () => {
        timeoutRef.current = setTimeout(() => {
          setSelectedDocument(null);
        }, 100);
      });
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = L.tileLayer(
        isSatelliteView ? satelliteTileLayer : defaultTileLayer,
        {
          attribution: isSatelliteView
            ? "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
            : "&copy; OpenStreetMap contributors",
        }
      ).addTo(mapRef.current);
    }
  }, [isSatelliteView]);

  useEffect(() => {
    if (mapRef.current && showZones) {
      const featureCollection: FeatureCollection<Geometry> = {
        type: "FeatureCollection",
        features: zones
          .filter((zone) => zone.id !== 0) // Exclude Kiruna boundary
          .map((zone) => ({
            type: "Feature",
            geometry: zone.coordinates,
            properties: {}, // You can add properties if needed
          })),
      };
      const zoneLayer = L.geoJSON(featureCollection, {
        style: {
          color: "blue",
          weight: 2,
          fillOpacity: 0.2,
        },
      });

      mapRef.current.addLayer(zoneLayer);

      return () => {
        mapRef.current?.removeLayer(zoneLayer);
      };
    }
  }, [showZones, zones]);

  const toggleSatelliteView = () => {
    setIsSatelliteView((prev) => !prev);
  };

  const toggleZonesView = () => {
    setShowZones((prev) => !prev);
  };

  const handleMoreClick = (item: Document) => {
    setSelectedDocument(item);
  };

  useEffect(() => {
    if (mapRef.current) {
      const markers = L.markerClusterGroup({
        iconCreateFunction: (cluster) => {
          const childMarkers = cluster.getAllChildMarkers();
          const isHotSpotCluster = childMarkers.some((marker) => {
            const latLng = marker.getLatLng();
            return (
              latLng.lat === hotSpotCoordinates.latitude &&
              latLng.lng === hotSpotCoordinates.longitude
            );
          });

          if (isHotSpotCluster) {
            return L.divIcon({
              html: `<div class="hotspot-cluster-icon"><span>${cluster.getChildCount()}</span></div>`,
              className: "hotspot-cluster",
              iconSize: L.point(50, 50, true),
            });
          } else {
            const count = cluster.getChildCount();
            let sizeClass = "small-cluster";
            if (count > 10) sizeClass = "medium-cluster";
            if (count > 50) sizeClass = "large-cluster";

            return L.divIcon({
              html: `<div class="custom-cluster-icon ${sizeClass}"><span>${count}</span></div>`,
              className: "custom-cluster",
              iconSize: L.point(40, 40, true),
            });
          }
        },
      });
      console.log("documents are", documents);
      documents.forEach((item) => {
        const { latitude, longitude, title, type } = item;
        if (latitude && longitude) {
          const icon = iconsByType[type] || iconsByType.default;
          const marker = L.marker([latitude, longitude], {
            icon,
          }).bindPopup(
            `<b>${title}</b><br/>Type: ${type}<br/>
             <div class="moreBtn" data-id="${item.id}">more</div>`
          );
          markers.addLayer(marker);

          marker.on("popupopen", () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            const moreBtn = document.querySelector(
              `.moreBtn[data-id="${item.id}"]`
            );
            moreBtn?.addEventListener("click", () => {
              handleMoreClick(item);
            });
          });
        }
      });

      mapRef.current.addLayer(markers);
    }
  }, [documents]);*/

  return (
    <>
      <MapComponent
        kirunaBoundary={kirunaBoundary}
        setKirunaBoundary={setKirunaBoundary}
      />
      {/*
      {selectedDocument && (
        <DocumentCard
          cardInfo={selectedDocument}
          iconToShow={iconsByType[selectedDocument.type].options.iconUrl}
        />
      )}
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
      </div>*/}
    </>
  );
};

export default DocumentsMap;
