import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Generate random markers with statuses
const generateRandomMarkers = (count) => {
  const markers = [];
  for (let i = 0; i < count; i++) {
    markers.push({
      name: `AIT_${i + 1}`,
      coordinates: [
        Math.random() * 180 - 90, // Latitude between -90 and +90
        Math.random() * 360 - 180, // Longitude between -180 and +180
      ],
      status: Math.random() > 0.7 ? "good" : "bad",
    });
  }
  return markers;
};

// Generate random lines connecting markers
const generateRandomLines = (markers, count) => {
  const lines = [];
  for (let i = 0; i < count; i++) {
    const fromIndex = Math.floor(Math.random() * markers.length);
    const toIndex = Math.floor(Math.random() * markers.length);
    if (fromIndex !== toIndex) {
      lines.push({
        from: markers[fromIndex].coordinates,
        to: markers[toIndex].coordinates,
      });
    }
  }
  return lines;
};

const WorldMapLeaflet = () => {
  const [markers, setMarkers] = useState([]);
  const [lines, setLines] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const generatedMarkers = generateRandomMarkers(2000);
    setMarkers(generatedMarkers);
    setLines(generateRandomLines(generatedMarkers, 3000)); // Connect random markers with lines
  }, []);

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const matchingMarker = markers.find((marker) =>
      marker.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setSelectedMarker(matchingMarker || null);
  };

  const getConnectedMarkers = (marker) => {
    if (!marker) return [];
    const connectedCoords = lines.reduce((acc, line) => {
      if (
        line.from.toString() === marker.coordinates.toString() ||
        line.to.toString() === marker.coordinates.toString()
      ) {
        acc.push(line.from, line.to);
      }
      return acc;
    }, []);
    return markers.filter((m) =>
      connectedCoords.some(
        (coords) => coords.toString() === m.coordinates.toString()
      )
    );
  };

  // Get markers to show based on search or selected marker
  const markersToShow = selectedMarker
    ? [selectedMarker, ...getConnectedMarkers(selectedMarker)]
    : markers;

  // Reset button to show all markers
  const handleReset = () => {
    setSelectedMarker(null);
    setSearchQuery("");
  };

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      {/* Search Input */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "50px",
          zIndex: 1000,
        }}
      >
        <input
          type="text"
          placeholder="Search for a marker..."
          value={searchQuery}
          onChange={handleSearch}
          style={{
            padding: "8px",
            border: "1px solid #ddd",
            backgroundColor: "white", // White background for search box
            marginRight: "10px",
            color: "black",
          }}
        />
        <button
          onClick={handleReset}
          style={{
            padding: "6px",
            border: "1px solid #ddd",
            backgroundColor: "white", // White background for button
            cursor: "pointer",
            color: "black",
          }}
        >
          Reset
        </button>
      </div>

      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        key={selectedMarker ? selectedMarker.name : "default"}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Render lines with arrows only if a marker is selected */}
        {selectedMarker &&
          lines
            .filter(
              (line) =>
                line.from.toString() ===
                  selectedMarker.coordinates.toString() ||
                line.to.toString() === selectedMarker.coordinates.toString()
            )
            .map((line, index) => (
              <Polyline
                key={`${selectedMarker.name}-${index}`} // Ensure unique key for each line
                positions={[line.from, line.to]}
                color="#FF5533"
                weight={1}
                dashArray="4"
              >
                {/* Add an arrow at the end of each line */}
                <Tooltip direction="top" permanent>
                  <span>&#x2192;</span>
                </Tooltip>
              </Polyline>
            ))}

        {/* Render markers with names above each marker */}
        {markersToShow.map((marker, index) => (
          <Marker
            key={index}
            position={marker.coordinates}
            eventHandlers={{
              click: () => handleMarkerClick(marker),
            }}
            icon={L.divIcon({
              className: "custom-icon",
              html: `<span style="
                background-color: ${
                  marker.status === "good" ? "#28a745" : "#dc3545"
                };
                width: 8px; 
                height: 8px; 
                display: block; 
                border-radius: 50%;
                border: 1px solid white;"></span>`,
            })}
          >
            <Popup>{marker.name}</Popup>
            {/* <Tooltip direction="top" offset={[0, -10]} permanent>
              {marker.name}
            </Tooltip> */}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default WorldMapLeaflet;
