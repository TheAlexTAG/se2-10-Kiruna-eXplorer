import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ onLocationSelect }) => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current === null) {
      // Initialize map
      const map = L.map("map").setView([67.8558, 20.2253], 13);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      // Click event to capture location
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng);

        // Clear existing markers and add a new one
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            map.removeLayer(layer);
          }
        });

        L.marker([lat, lng]).addTo(map);
        L.marker([67.8558, 20.2253]).addTo(map);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onLocationSelect]);

  return <div id="map" style={{ height: "80vh", width: "100%" }}></div>;
};

export default MapComponent;
