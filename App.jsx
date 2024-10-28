import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

// import WorldMap from "./worldMap";

import "./App.css";
import WorldMapLeaflet from "./WorldMapLeaflet";

function App() {
  return (
    <Box>
      <Paper sx={{ width: "100vw", height: "100vh" }}>
        {/* <WorldMap /> */}
        <WorldMapLeaflet />
      </Paper>
    </Box>
  );
}

export default App;
