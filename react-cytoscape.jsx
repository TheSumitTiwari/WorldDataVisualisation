import React, { useEffect, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import * as XLSX from "xlsx";

const App = () => {
  const [elements, setElements] = useState([]); // State to hold graph data
  const [stylesheet, setStylesheet] = useState([]); // State for dynamic styling

  useEffect(() => {
    // Load the static Excel file
    fetch("/data.xlsx")
      .then((response) => response.arrayBuffer())
      .then((data) => {
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const graphElements = [];
        const addedNodes = new Set();
        const upstreamCounts = {}; // To track upstream occurrences

        jsonData.forEach((row) => {
          const { appName, upstreamName, tableName } = row;

          // Add Application Node
          if (!addedNodes.has(appName)) {
            graphElements.push({ data: { id: appName, label: appName, type: "app" } });
            addedNodes.add(appName);
          }

          // Add Upstream Node
          if (!addedNodes.has(upstreamName)) {
            graphElements.push({ data: { id: upstreamName, label: upstreamName, type: "upstream" } });
            addedNodes.add(upstreamName);
            upstreamCounts[upstreamName] = 1;
          } else {
            upstreamCounts[upstreamName]++;
          }

          // Add Table Node
          if (!addedNodes.has(tableName)) {
            graphElements.push({ data: { id: tableName, label: tableName, type: "table" } });
            addedNodes.add(tableName);
          }

          // Add Edges
          graphElements.push({ data: { source: appName, target: upstreamName } });
          graphElements.push({ data: { source: upstreamName, target: tableName } });
        });

        // Dynamic Stylesheet
        const dynamicStylesheet = [
          {
            selector: "node[type='app']",
            style: { backgroundColor: "green", label: "data(label)", color: "#fff" },
          },
          {
            selector: "node[type='upstream']",
            style: (ele) => {
              const id = ele.data("id");
              return {
                backgroundColor: upstreamCounts[id] > 1 ? "blue" : "#0074D9",
                label: "data(label)",
                color: "#fff",
              };
            },
          },
          {
            selector: "node[type='table']",
            style: { backgroundColor: "#0074D9", label: "data(label)", color: "#fff" },
          },
          {
            selector: "edge",
            style: {
              lineColor: "#A9A9A9",
              width: 2,
              targetArrowColor: "#A9A9A9",
              targetArrowShape: "triangle",
            },
          },
        ];

        setElements(graphElements);
        setStylesheet(dynamicStylesheet);
      });
  }, []);

  const layout = { name: "breadthfirst", directed: true, padding: 10 };

  return (
    <div>
      <h2>Excel to Graph Visualization</h2>
      {elements.length > 0 && (
        <CytoscapeComponent
          elements={elements}
          layout={layout}
          stylesheet={stylesheet}
          style={{ width: "100%", height: "500px", marginTop: "20px" }}
        />
      )}
    </div>
  );
};

export default App;
