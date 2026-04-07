import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-chart-sales-by-category',
  imports: [BaseChartDirective],
  templateUrl: './chart-sales-by-category.component.html',
  styleUrl: './chart-sales-by-category.component.scss',
})
export class ChartSalesByCategoryComponent {
  @Input() salesByCategory: {
    id: number;
    name: string;
    total_revenue: string;
    total_quantity: string;
    percentage: string;
  }[] = [];

  chartData: ChartData<'pie'> = {
    labels: [],
    datasets: [],
  };

  chartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 16,
          usePointStyle: true,
          color: '#000000',
          font: {
            size: 16,
          }
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (sum: number, val: any) =>
                sum + (typeof val === 'number' ? val : 0),
              0,
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return ` ${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['salesByCategory'] && this.salesByCategory.length) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    this.chartData = {
      labels: this.salesByCategory.map((cat) => cat.name),
      datasets: [
        {
          data: this.salesByCategory.map((cat) => Number(cat.total_revenue)),
          backgroundColor: [
            '#3B82F6',
            '#EF4444',
            '#10B981',
            '#F59E0B',
            '#8B5CF6',
            '#EC4899',
            '#06B6D4',
            '#F97316',
            '#84CC16',
            '#6366F1',
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }
}
