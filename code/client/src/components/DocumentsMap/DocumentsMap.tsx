import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../../API/API";

interface Document {
  document: {
    id: number;
    title: string;
    type: string;
    latitude: number;
    longitude: number;
  };
}

const DocumentsMap: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Fetch documents with location data
    const fetchDocuments = async () => {
      try {
        const data = await API.getDocuments();
        console.log("data is ", data);
        setDocuments(
          data.filter(
            (doc: any) => doc.document.latitude && doc.document.longitude
          )
        ); // Filter for docs with coordinates
        //setDocuments(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();

    // Initialize map only if it hasn't been initialized before
    if (mapRef.current === null) {
      mapRef.current = L.map("documents-map").setView([67.8558, 20.2253], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    // Check that mapRef.current is not null before using it
    if (mapRef.current) {
      console.log("hwllo prde");
      console.log("documents are ", documents);
      documents.forEach((doc) => {
        if (doc.document.latitude && doc.document.longitude) {
          console.log("hello");
          L.marker([doc.document.latitude, doc.document.longitude]) // Directly add marker without assignment
            .addTo(mapRef.current as L.Map) // Assert mapRef.current as L.Map
            .bindPopup(
              `<b>${doc.document.title}</b><br/>Type: ${doc.document.type}`
            );
        }
      });
    }
  }, [documents]);

  return (
    <div id="documents-map" style={{ height: "500px", width: "100%" }}></div>
  );
};

export default DocumentsMap;
