import React, { useState } from "react";
import { Feature, MultiPolygon } from "geojson";
import MapComponent from "../Map/MapComponent";

const DocumentsMap: React.FC = () => {
  const [kirunaBoundary, setKirunaBoundary] =
    useState<Feature<MultiPolygon> | null>(null);
  const [showZones, setShowZones] = useState(false);
  const [highlightedDocumentId, setHighlightedDocumentId] = useState<
    number | null
  >(null);
  const [tempHighlightedDocumentId, setTempHighlightedDocumentId] = useState<
    number | null
  >(null);

  return (
    <>
      <MapComponent
        showZones={showZones}
        setShowZones={setShowZones}
        kirunaBoundary={kirunaBoundary}
        setKirunaBoundary={setKirunaBoundary}
        highlightedDocumentId={highlightedDocumentId}
        setHighlightedDocumentId={setHighlightedDocumentId}
        tempHighlightedDocumentId={tempHighlightedDocumentId}
        setTempHighlightedDocumentId={setTempHighlightedDocumentId}
      />
    </>
  );
};

export default DocumentsMap;
