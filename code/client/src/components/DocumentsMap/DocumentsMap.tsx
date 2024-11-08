import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import API from "../../API/API";
import "./DocumentsMap.css";
import { DocumentCard } from "../DocumentCard/DocumentCard";
import { Button } from "react-bootstrap";

interface DocumentData {
  title: string;
  type: string;
  latitude: number;
  longitude: number;
}

interface Document {
  id: number;
  document: DocumentData;
}

const DocumentsMap: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const customIcon = L.icon({
    iconUrl: "/img/doc.png",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

  const hotSpotCoordinates = {
    latitude: 67.84905775407694,
    longitude: 20.302734375000004,
  };

  const bounds = L.latLngBounds([
    [67.8, 20.1], // Southwest corner
    [67.9, 20.4], // Northeast corner
  ]);

  const defaultTileLayer = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const satelliteTileLayer =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  useEffect(() => {
    const fetchDocuments = async () => {
      const data = await API.getDocuments();
      setDocuments(
        data.filter(
          (item: Document) => item.document.latitude && item.document.longitude
        )
      );
    };

    fetchDocuments();

    if (mapRef.current === null) {
      mapRef.current = L.map("documents-map", {
        maxBounds: bounds,
        maxBoundsViscosity: 1,
        minZoom: 13,
        maxZoom: 18,
        zoomControl: true,
      }).setView([67.85, 20.2253], 13);

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

  const toggleSatelliteView = () => {
    if (mapRef.current && tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
      const newTileLayerUrl = isSatelliteView
        ? defaultTileLayer
        : satelliteTileLayer;
      tileLayerRef.current = L.tileLayer(newTileLayerUrl, {
        attribution: isSatelliteView
          ? "&copy; OpenStreetMap contributors"
          : "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
      }).addTo(mapRef.current);

      setIsSatelliteView(!isSatelliteView);
    }
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

      documents.forEach((item) => {
        const { latitude, longitude, title, type } = item.document;
        if (latitude && longitude) {
          const marker = L.marker([latitude, longitude], {
            icon: customIcon,
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
  }, [documents]);

  const handleMoreClick = (item: Document) => {
    setSelectedDocument(item);
  };

  return (
    <>
      <div
        id="documents-map"
        style={{
          position: "fixed",
          top: "60px",
          left: 0,
          height: "calc(100vh - 60px)",
          width: "100vw",
          zIndex: 0,
        }}
      ></div>
      {selectedDocument && <DocumentCard cardInfo={selectedDocument} />}
      <Button
        onClick={toggleSatelliteView}
        style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}
      >
        {isSatelliteView
          ? "Switch to Default View"
          : "Switch to Satellite View"}
      </Button>
    </>
  );
};

export default DocumentsMap;
