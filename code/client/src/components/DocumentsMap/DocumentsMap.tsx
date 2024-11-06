import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../../API/API";

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
  const mapRef = useRef<L.Map | null>(null);

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
    }
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      documents.forEach((item) => {
        const { latitude, longitude, title, type } = item.document;
        if (latitude && longitude) {
          L.marker([latitude, longitude])
            .addTo(mapRef.current as L.Map)
            .bindPopup(`<b>${title}</b><br/>Type: ${type}`);
        }
      });
    }
  }, [documents]);

  return (
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
  );
};

export default DocumentsMap;
