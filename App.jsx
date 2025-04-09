import React from 'react';
import BarGraph from './components/BarGraph';
import PieChart from './components/PieChart';

const sampleBarData = {
  labels: ['Red', 'Blue', 'Yellow'],
  datasets: [
    {
      label: 'Votes',
      data: [12, 19, 3],
      backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
    },
  ],
};

const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

const samplePieData = {
  labels: ['Apple', 'Banana', 'Cherry'],
  datasets: [
    {
      label: 'Fruits',
      data: [10, 20, 30],
      backgroundColor: ['#FF6384', '#FFCE56', '#36A2EB'],
    },
  ],
};

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right',
    },
  },
};

const App = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Bar Graph</h2>
      <BarGraph data={sampleBarData} options={barOptions} style={{ height: '300px' }} />

      <h2>Pie Chart</h2>
      <PieChart data={samplePieData} options={pieOptions} style={{ height: '300px' }} />
    </div>
  );
};

export default App;
