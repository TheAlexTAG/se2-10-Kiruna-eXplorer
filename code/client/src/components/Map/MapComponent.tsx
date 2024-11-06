import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  onLocationSelect: () => void;
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
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([67.8558, 20.2253], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      const kirunaUrbanPolygonCoords: [number, number][] = [
        [67.8795522, 20.0884348],
        [67.8461752, 20.0777938],
        [67.8137874, 20.0959903],
        [67.8009557, 20.1313601],
        [67.789142, 20.20173],
        [67.780064, 20.2526948],
        [67.8017275, 20.3284129],
        [67.820848, 20.3586137],
        [67.8372408, 20.3775067],
        [67.8659746, 20.3644607],
        [67.8805869, 20.2542569],
        [67.8834303, 20.2082529],
        [67.8795522, 20.0884348],
      ];
      /*const kirunaUrbanPolygonCoords: [number, number][] = [
        [67.8223, 20.157],
        [67.8223, 20.1701],
        [67.8238, 20.19],
        [67.828, 20.2235],
        [67.8325, 20.2235],
        [67.8372, 20.278],
        [67.8554, 20.278],
        [67.8516, 20.2111],
        [67.8556, 20.2111],
        [67.8223, 20.157],
      ];*/

      // Add the polygon layer to highlight the urban area
      const polygon = L.polygon(kirunaUrbanPolygonCoords, {
        color: "blue",
        weight: 2,
        fillColor: "blue",
        fillOpacity: 0.2, // Semi-transparent fill
      }).addTo(mapRef.current);

      // Fit the map to the polygon bounds for visibility
      //mapRef.current.fitBounds(polygon.getBounds());

      mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setTempCoordinates({ lat, lng });

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(
            mapRef.current as L.Map
          );
        }
      });
    }
  }, [setTempCoordinates]);

  return <div id="map" style={{ height: "400px", width: "100%" }}></div>;
};

export default MapComponent;
