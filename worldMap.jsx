import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Sphere,
  Marker,
  Line,
  ZoomableGroup,
} from "react-simple-maps";

import { geoMercator } from "d3-geo";

const worldGeoUrl =
  "https://raw.githubusercontent.com/lotusms/world-map-data/main/world.json";

const generateRandomMarkers = (count) => {
  const markers = [];
  for (let i = 0; i < count; i++) {
    markers.push({
      name: `AIT_${i + 1}`,
      coordinates: [
        Math.random() * 360 - 180, // Longitude between -180 and +180
        Math.random() * 180 - 90, // Latitude between -90 and +90
      ],
      status: Math.random() < 0.8 ? "good" : "bad",
    });
  }
  return markers;
};

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

const WorldMap = () => {
  const [markers, setMarkers] = useState([]);
  const [lines, setLines] = useState([]);
  const [tooltipContent, setTooltipContent] = useState("");
  const [position, setPosition] = useState({ coordinate: [0, 0], zoom: 1 });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const generatedMarkers = generateRandomMarkers(20);
    setMarkers(generatedMarkers);
    setLines(generateRandomLines(generatedMarkers, 30)); // Connect random markers with lines
  }, []);

  // Find markers connected by lines to the searched marker
  const getConnectedMarkers = (targetMarker) => {
    const connectedCoords = lines.reduce((acc, line) => {
      if (
        line.from.toString() === targetMarker.coordinates.toString() ||
        line.to.toString() === targetMarker.coordinates.toString()
      ) {
        acc.push(line.from, line.to);
      }
      return acc;
    }, []);

    return markers.filter((marker) =>
      connectedCoords.some(
        (coords) => coords.toString() === marker.coordinates.toString()
      )
    );
  };

  // Determine markers to display based on search query
  const mainMarker = markers.find((marker) =>
    marker.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If there's a search query, show only the searched marker and its connected markers
  // Otherwise, show all markers
  const filteredMarkers =
    searchQuery && mainMarker
      ? [mainMarker, ...getConnectedMarkers(mainMarker)]
      : markers;

  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  return (
    <div style={{ width: "95vw", height: "50vh", margin: "auto" }}>
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search for a AIT..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          padding: "8px",
          marginTop: "10px",
          border: "1px solid #ddd",
        }}
      />
      {tooltipContent && (
        <div
          style={{
            position: "absolute",
            background: "#FFF",
            padding: "5px",
            marginTop: "15px",
            borderRadius: "4px",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          }}
        >
          {tooltipContent}
        </div>
      )}
      <ComposableMap width={900} height={400} projectionConfig={{ scale: 147 }}>
        <ZoomableGroup
          zoom={position.zoom}
          center={[0, 0]} // Keep map center fixed
          onMoveEnd={handleMoveEnd}
          minZoom={1}
          maxZoom={8}
        >
          <Sphere stroke="#000" strokeWidth={0.1} />
          <Graticule stroke="#000" strokeWidth={0.1} />
          <Geographies geography={worldGeoUrl}>
            {({ geographies }) =>
              geographies.map((geo, index) => (
                <Geography
                  key={index}
                  geography={geo}
                  stroke="#111111"
                  strokeWidth={0.4}
                  style={{
                    default: { fill: "#6495ED" },
                    hover: { fill: "#a2bff4" },
                    pressed: { fill: "#E42" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Define arrowhead for lines */}
          <defs>
            <marker
              id="arrow"
              markerWidth="4"
              markerHeight="4"
              refX="4"
              refY="2"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,6 L9,3 Z"
                fill="#FF5533"
                stroke="white"
                strokeWidth={0.5}
              />
            </marker>
          </defs>

          {/* Draw lines only for visible markers */}
          {lines
            .filter(
              (line) =>
                filteredMarkers.some(
                  (marker) =>
                    marker.coordinates.toString() === line.from.toString()
                ) &&
                filteredMarkers.some(
                  (marker) =>
                    marker.coordinates.toString() === line.to.toString()
                )
            )
            .map((line, index) => (
              <Line
                key={index}
                from={line.from}
                to={line.to}
                stroke="#FF5533"
                strokeWidth={1 / position.zoom} // Adjust line thickness based on zoom
                strokeLinecap="round"
                markerEnd="url(#arrow)"
              />
            ))}

          {/* Display filtered markers */}
          {filteredMarkers.map(({ name, coordinates, status }, index) => {
            return (
              <Marker
                key={index}
                coordinates={coordinates}
                onMouseEnter={() => setTooltipContent(name)}
                onMouseLeave={() => setTooltipContent("")}
              >
                <circle
                  r={2 / position.zoom} // Marker size scales with zoom level
                  fill={status === "good" ? "#28a745" : "#dc3545"}
                  stroke="#FFF"
                  strokeWidth={1 / position.zoom} // Border thickness adjusts with zoom level
                />
                <text
                  textAnchor="middle"
                  y={-5 / position.zoom} // Adjust text position based on zoom
                  style={{
                    fill: "#111111",
                    fontSize: `${5 / position.zoom}px`,
                    fontWeight: "bold",
                  }}
                >
                  {name}
                </text>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
      /
    </div>
  );
};

export default WorldMap;
