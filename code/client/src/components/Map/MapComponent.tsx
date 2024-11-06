import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  onLocationSelect: (lat: number, lng: number) => void;
  tempCoordinates: { lat: number | null; lng: number | null };
  setTempCoordinates: (coords: { lat: number; lng: number }) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  onLocationSelect,
  tempCoordinates,
  setTempCoordinates,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // Check if the map has already been initialized
    if (mapRef.current === null) {
      // Initialize the map and save it to the ref
      mapRef.current = L.map("map").setView([67.8558, 20.2253], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      // Add click event listener to map
      mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setTempCoordinates({ lat, lng });

        // Remove the previous marker, if it exists
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Add a new marker at the clicked location
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current as L.Map);
      });
    }

    // Cleanup on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null; // Reset mapRef to null
      }
    };
  }, [setTempCoordinates]);

  return <div id="map" style={{ height: "400px", width: "100%" }}></div>;
};

export default MapComponent;
