import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import API from "../../API/API";
import "./DocumentsMap.css";
import { DocumentCard } from "../DocumentCard/DocumentCard";

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
  const mapRef = useRef<L.Map | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const customIcon = L.icon({
    iconUrl: "/img/doc.png",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

  // Coordinates for the "whole municipality area" hotspot
  const hotSpotCoordinates = {
    latitude: 67.84905775407694,
    longitude: 20.302734375000004,
  };

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
      mapRef.current = L.map("documents-map").setView([67.85, 20.2253], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      // Clear `selectedDocument` on popup close with a delay
      mapRef.current.on("popupclose", () => {
        timeoutRef.current = setTimeout(() => {
          setSelectedDocument(null);
        }, 100); // Adjust delay if needed
      });
    }
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      // Create marker cluster group with custom iconCreateFunction
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
            // Unique style for the hotspot cluster
            return L.divIcon({
              html: `<div class="hotspot-cluster-icon"><span>${cluster.getChildCount()}</span></div>`,
              className: "hotspot-cluster",
              iconSize: L.point(50, 50, true), // Customize size
            });
          } else {
            // Default style for other clusters
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

      // Add each document as a marker to the cluster group
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
            // Cancel any ongoing timeout to avoid resetting `selectedDocument` unexpectedly
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
    </>
  );
};

export default DocumentsMap;
