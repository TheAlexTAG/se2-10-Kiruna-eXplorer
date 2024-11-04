import React, { useState } from "react";
import MapComponent from "../Map/Map";

interface Coordinates {
  lat: number | null;
  lng: number | null;
}

const GeoreferenceDocument: React.FC = () => {
  const [coordinates, setCoordinates] = useState<Coordinates>({
    lat: null,
    lng: null,
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
  };

  const saveLocation = () => {
    if (coordinates.lat !== null && coordinates.lng !== null) {
      console.log("Saving coordinates:", coordinates);
      // Perform API call to save coordinates
    } else {
      console.error("No coordinates selected.");
    }
  };

  return (
    <div>
      <h2>Georeference Document</h2>
      <MapComponent onLocationSelect={handleLocationSelect} />
      {coordinates.lat !== null && (
        <p>
          Selected Location: Latitude: {coordinates.lat}, Longitude:{" "}
          {coordinates.lng}
        </p>
      )}
      <button
        onClick={saveLocation}
        disabled={coordinates.lat === null || coordinates.lng === null}
      >
        Save Location
      </button>
    </div>
  );
};

export default GeoreferenceDocument;
