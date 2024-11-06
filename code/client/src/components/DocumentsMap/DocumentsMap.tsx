import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
      documents.forEach((item) => {
        const { latitude, longitude, title, type } = item.document;
        if (latitude && longitude) {
          const marker = L.marker([latitude, longitude]) as L.Marker;

          marker.addTo(mapRef.current as L.Map).bindPopup(
            `<b>${title}</b><br/>Type: ${type}<br/>
               <div class="moreBtn" data-id="${item.id}">more</div>`
          );

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
