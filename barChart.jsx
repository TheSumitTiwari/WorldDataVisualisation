// components/BarGraph.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const BarGraph = ({ data, options, style }) => {
  return (
    <div style={{ width: '100%', ...style }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarGraph;
