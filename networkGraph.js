import React, { useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";

const CytoscapeGraph = ({ elements }) => {
  const [selectedNode, setSelectedNode] = useState(null);

  const layout = { name: "grid" };

  const style = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "background-color": "#0074D9",
        "text-valign": "center",
        "text-halign": "center",
        color: "#fff",
        "font-size": "12px",
      },
    },
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#ccc",
        "target-arrow-color": "#ccc",
        "target-arrow-shape": "triangle",
      },
    },
  ];

  const handleNodeClick = (event) => {
    const node = event.target;
    setSelectedNode({
      id: node.id(),
      label: node.data("label"),
      details: node.data("details") || "No details available",
    });
  };

  return (
    <div style={{ display: "flex" }}>
      <CytoscapeComponent
        elements={elements}
        style={{ width: "80vw", height: "80vh", border: "1px solid #ddd" }}
        layout={layout}
        stylesheet={style}
        cy={(cy) => {
          cy.on("tap", "node", handleNodeClick);
        }}
      />
      {selectedNode && (
        <div style={{ marginLeft: "20px", padding: "10px", border: "1px solid #ddd", background: "#f9f9f9" }}>
          <h3>Node Details</h3>
          <p><b>ID:</b> {selectedNode.id}</p>
          <p><b>Label:</b> {selectedNode.label}</p>
          <p><b>Details:</b> {selectedNode.details}</p>
        </div>
      )}
    </div>
  );
};

export default CytoscapeGraph;
