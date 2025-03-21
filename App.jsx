import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent {
  lineChartType: ChartType = 'line';

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: {},
      y: { beginAtZero: true },
    },
  };

  lineChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        borderColor: 'blue',
        tension: 0.4,
      },
      {
        label: 'Revenue',
        data: [30, 40, 60, 75, 50, 90],
        fill: false,
        borderColor: 'green',
        tension: 0.4,
      },
    ],
  };
}



<div class="chart-container">
  <canvas
    baseChart
    [data]="lineChartData"
    [options]="lineChartOptions"
    [type]="lineChartType"
  >
  </canvas>
</div>


.chart-container {
  width: 100%;
  max-width: 600px;
  margin: auto;
}


import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
  ],
};
