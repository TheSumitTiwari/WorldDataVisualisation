import React, { useEffect, useState } from "react";
import Papa from "papaparse";

const App = () => {
  const [allData, setAllData] = useState([]);
  const [commonTables, setCommonTables] = useState([]);

  useEffect(() => {
    // Path to the CSV file in the public folder
    const filePath = "/data.csv"; // Replace with your actual file path

    // Fetch and process the CSV file
    fetch(filePath)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true, // Treat the first row as headers
          skipEmptyLines: true,
          complete: (result) => {
            const data = result.data;
            setAllData(data); // Store the entire CSV data for display

            const tableAppMap = {};

            // Build a map of tables and their associated apps
            data.forEach(({ appName, tables }) => {
              if (!tableAppMap[tables]) {
                tableAppMap[tables] = new Set();
              }
              tableAppMap[tables].add(appName);
            });

            // Identify tables used in multiple apps with their respective apps
            const common = Object.entries(tableAppMap)
              .filter(([_, apps]) => apps.size > 1) // Only tables with multiple apps
              .map(([table, apps]) => ({
                table,
                apps: Array.from(apps), // Convert the Set to an array
              }));

            setCommonTables(common);
          },
        });
      })
      .catch((error) => {
        console.error("Error reading the file:", error);
      });
  }, []);

  return (
    <div style={{ display: "flex", padding: "20px" }}>
      {/* Left Side: Display all table data */}
      <div style={{ flex: 1, marginRight: "20px" }}>
        <h2>All Table Data</h2>
        {allData.length > 0 ? (
          <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>App Name</th>
                <th>Upstream Name</th>
                <th>Table</th>
              </tr>
            </thead>
            <tbody>
              {allData.map((row, index) => (
                <tr key={index}>
                  <td>{row.appName}</td>
                  <td>{row.upstreamName}</td>
                  <td>{row.tables}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Loading data...</p>
        )}
      </div>

      {/* Right Side: Display common tables with apps */}
      <div style={{ flex: 1 }}>
        <h2>Common Tables with Associated Apps</h2>
        {commonTables.length > 0 ? (
          <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Table</th>
                <th>Apps</th>
              </tr>
            </thead>
            <tbody>
              {commonTables.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.table}</td>
                  <td>{entry.apps.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No common tables found or error in processing the file.</p>
        )}
      </div>
    </div>
  );
};

export default App;
