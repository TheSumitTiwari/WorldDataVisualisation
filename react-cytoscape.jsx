import React, { useEffect, useState, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import euler from "cytoscape-euler";
import * as XLSX from "xlsx";
import Select from "react-select";
import Modal from "react-modal";
import cytoscape from "cytoscape";

cytoscape.use(euler);

const NodeGraph = () => {
  const [elements, setElements] = useState([]); // All graph data
  const [filteredElements, setFilteredElements] = useState([]); // Filtered graph data
  const [stylesheet, setStylesheet] = useState([]); // Dynamic styling
  const [appOptions, setAppOptions] = useState([]); // Dropdown options for apps
  const [selectedNode, setSelectedNode] = useState(null); // Selected node
  const [connectedGraph, setConnectedGraph] = useState([]); // Graph for modal
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal visibility
  const [upstreamTableMap, setUpstreamTableMap] = useState({});
  const [selectedApps, setSelectedApps] = useState([null, null]);
  const [commonTables, setCommonTables] = useState([]);

  const cyRef = useRef(null); // Reference to Cytoscape instance

  useEffect(() => {
    fetch("./../../data.xlsx")
      .then((response) => response.arrayBuffer())
      .then((data) => {
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const graphElements = [];
        const addedNodes = new Set();
        const upstreamCounts = {};

        const upstreamSet = new Set();
        const appSet = new Set();

        const edgeSet = new Set(); // To track unique edges (combination of source and target)
        const newUpstreamTableMap = {}; // Temporary map to populate upstreamTableMap

        jsonData.forEach((row) => {
          const { appName, upstreamName, tables } = row;

          // Add app node if not already added
          if (!addedNodes.has(appName)) {
            graphElements.push({
              data: { id: appName, label: appName, type: "app" },
            });
            addedNodes.add(appName);
            appSet.add(appName);
          }

          // Add upstream node if not already added
          if (!addedNodes.has(upstreamName)) {
            graphElements.push({
              data: { id: upstreamName, label: upstreamName, type: "upstream" },
            });
            addedNodes.add(upstreamName);
            upstreamCounts[upstreamName] = 1;
            upstreamSet.add(upstreamName);
          } else {
            upstreamCounts[upstreamName]++;
          }

          // Initialize the upstream's map if not present
          if (!newUpstreamTableMap[upstreamName]) {
            newUpstreamTableMap[upstreamName] = {};
          }

          // Initialize the app's table list under the upstream if not present
          if (!newUpstreamTableMap[upstreamName][appName]) {
            newUpstreamTableMap[upstreamName][appName] = [];
          }

          // Add tables to the upstream's map
          newUpstreamTableMap[upstreamName][appName].push(tables);

          // Add edge only if it is not already present
          const edgeKey = `${upstreamName}-${appName}`;
          if (!edgeSet.has(edgeKey)) {
            graphElements.push({
              data: { source: upstreamName, target: appName },
            });
            edgeSet.add(edgeKey); // Mark this edge as added
          }
        });

        setElements(graphElements);
        setFilteredElements(graphElements);
        setUpstreamTableMap(newUpstreamTableMap); // Set the map after population

        setAppOptions(
          Array.from(appSet).map((app) => ({ value: app, label: app }))
        );

        const dynamicStylesheet = [
          {
            selector: "node[type='app']",
            style: {
              backgroundColor: "green",
              label: "data(label)",
              color: "black",
              shape: "pentagon",
            },
          },
          {
            selector: "node[type='upstream']",
            style: {
              backgroundColor: (ele) => {
                const upstreamName = ele.data("id");

                // Find unique applications connected to this upstream
                const connectedApps = new Set(
                  jsonData
                    .filter((row) => row.upstreamName === upstreamName)
                    .map((row) => row.appName)
                );

                // If the upstream is connected to more than one unique app, set it red
                return connectedApps.size > 1 ? "red" : "#0074D9";
              },
              label: "data(label)",
              color: "black",
            },
          },
          {
            selector: "edge",
            style: {
              width: 3,
              targetArrowColor: "#A9A9A9",
              targetArrowShape: "triangle",
              curveStyle: "bezier",
              controlPointWeights: [0.5],
            },
          },
        ];

        setStylesheet(dynamicStylesheet);
      });
  }, []);

  // Reapply the layout after filteredElements are updated
  useEffect(() => {
    if (cyRef.current) {
      const cy = cyRef.current;

      // Remove all elements before applying the filtered set
      cy.elements().remove();

      // Add the filtered elements to the graph
      cy.add(filteredElements);

      // Apply the layout after adding the filtered elements
      const layout = cy.layout({ name: "euler" });
      layout.run();
    }
  }, [filteredElements]);

  const layout = { name: "euler", directed: true };

  const modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "80%",
      height: "80%",
    },
  };

  const handleFilterChange = (selectedOption, type) => {
    if (!selectedOption) {
      setFilteredElements(elements);
      return;
    }

    const selectedId = selectedOption.value;
    const connectedEdges = elements.filter(
      (el) => el.data?.source === selectedId || el.data?.target === selectedId
    );
    const connectedNodes = connectedEdges.flatMap((edge) => [
      edge.data.source,
      edge.data.target,
    ]);
    const uniqueConnectedNodes = Array.from(new Set(connectedNodes)).map(
      (nodeId) =>
        elements.find((el) => el.data.id === nodeId && el.data.type !== "edge")
    );

    const updatedElements = [...uniqueConnectedNodes, ...connectedEdges];
    setFilteredElements(updatedElements); // Update filtered elements
  };

  const handleNodeClick = (event) => {
    const clickedNode = event.target.data();
    if (clickedNode.type === "upstream") {
      const connectedEdges = elements.filter(
        (el) =>
          el.data?.source === clickedNode.id ||
          el.data?.target === clickedNode.id
      );
      const connectedNodes = connectedEdges.flatMap((edge) => [
        edge.data.source,
        edge.data.target,
      ]);
      const uniqueConnectedNodes = Array.from(new Set(connectedNodes)).map(
        (nodeId) =>
          elements.find(
            (el) => el.data.id === nodeId && el.data.type !== "edge"
          )
      );

      setConnectedGraph([...uniqueConnectedNodes, ...connectedEdges]);
      setSelectedNode(clickedNode);
      setModalIsOpen(true);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedNode(null);
    setConnectedGraph([]);
    setSelectedApps([null, null]);
    setCommonTables([]); // Reset common tables when closing the modal
  };

  const handleAppSelectChange = (selectedApp, index) => {
    const newSelectedApps = [...selectedApps];
    newSelectedApps[index] = selectedApp;
    setSelectedApps(newSelectedApps);

    // If both apps are selected, compare tables
    if (newSelectedApps[0] && newSelectedApps[1]) {
      const upstreamName = selectedNode.id;
      const app1 = newSelectedApps[0].value;
      const app2 = newSelectedApps[1].value;

      const tablesApp1 = upstreamTableMap[upstreamName]?.[app1] || [];
      const tablesApp2 = upstreamTableMap[upstreamName]?.[app2] || [];

      // Find common tables
      const common = tablesApp1.filter((table) => tablesApp2.includes(table));
      setCommonTables(common);
    }
  };

  // Function to highlight common tables in both lists
  const highlightTable = (table, commonTables) => {
    return commonTables.includes(table) ? { backgroundColor: "yellow" } : {};
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <h2>AITs Data Flow</h2>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <div style={{ flex: 1 }}>
          <label>Applications</label>
          <Select
            options={appOptions}
            isClearable
            placeholder="Search Applications"
            onChange={(option) => handleFilterChange(option, "app")}
          />
        </div>
      </div>
      {filteredElements.length > 0 && (
        <CytoscapeComponent
          elements={filteredElements}
          layout={layout}
          stylesheet={stylesheet}
          style={{ width: "100%", height: "100%" }}
          cy={(cy) => {
            cyRef.current = cy;
            cy.on("tap", "node", handleNodeClick); // Listen for node clicks
          }}
        />
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={modalStyles}
      >
        <h3>Connections for: {selectedNode?.label}</h3>
        <div>
          <label>Select App 1</label>
          <Select
            options={appOptions}
            onChange={(option) => handleAppSelectChange(option, 0)}
            value={selectedApps[0]}
          />
        </div>
        <div>
          <label>Select App 2</label>
          <Select
            options={appOptions}
            onChange={(option) => handleAppSelectChange(option, 1)}
            value={selectedApps[1]}
          />
        </div>
        {commonTables.length > 0 && (
          <div>
            <h4>Common Tables</h4>
            <ul>
              {commonTables.map((table, index) => (
                <li key={index}>{table}</li>
              ))}
            </ul>
          </div>
        )}
        {connectedGraph.length > 0 && (
          <CytoscapeComponent
            elements={connectedGraph}
            layout={{ name: "breadthfirst", directed: true }}
            stylesheet={stylesheet}
            style={{ width: "100%", height: "50vh" }}
          />
        )}
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default NodeGraph;
