import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { DataGrid } from "@mui/x-data-grid";

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

  // Prepare columns and rows for the allData Data Grid
  const allDataColumns = [
    { field: "appName", headerName: "App Name", width: 150 },
    { field: "upstreamName", headerName: "Upstream Name", width: 150 },
    { field: "tables", headerName: "Table", width: 150 },
  ];

  const allDataRows = allData.map((row, index) => ({
    id: index, // Add a unique `id` field for each row (required by Data Grid)
    ...row,
  }));

  // Prepare columns and rows for the commonTables Data Grid
  const commonTablesColumns = [
    { field: "table", headerName: "Table", width: 150 },
    {
      field: "apps",
      headerName: "Apps",
      width: 300,
      renderCell: (params) => params.value.join(", "), // Join the array of apps into a string
    },
  ];

  const commonTablesRows = commonTables.map((entry, index) => ({
    id: index, // Add a unique `id` field for each row (required by Data Grid)
    ...entry,
  }));

  return (
    <div style={{ display: "flex", padding: "20px", gap: "20px" }}>
      {/* Left Side: Display all table data */}
      <div style={{ flex: 1 }}>
        <h2>All Table Data</h2>
        <DataGrid
          rows={allDataRows}
          columns={allDataColumns}
          autoHeight
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </div>

      {/* Right Side: Display common tables with apps */}
      <div style={{ flex: 1 }}>
        <h2>Common Tables with Associated Apps</h2>
        <DataGrid
          rows={commonTablesRows}
          columns={commonTablesColumns}
          autoHeight
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </div>
    </div>
  );
};

export default App;
