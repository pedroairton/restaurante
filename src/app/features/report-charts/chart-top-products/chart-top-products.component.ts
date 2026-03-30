import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-chart-top-products',
  imports: [BaseChartDirective],
  templateUrl: './chart-top-products.component.html',
  styleUrl: './chart-top-products.component.scss',
})
export class ChartTopProductsComponent {
  @Input() products: {
    name: string;
    total_sold: string;
    total_revenue: string;
  }[] = [];

  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y', // ← Barras horizontais
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          afterLabel: (context) => {
            const product = this.products[context.dataIndex];
            return `Receita: R$ ${Number(product.total_revenue).toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: (value) => `${value} un.`,
        },
      },
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products'] && this.products.length) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    this.chartData = {
      labels: this.products.map((p) => p.name),
      datasets: [
        {
          data: this.products.map((p) => Number(p.total_sold)),
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
          borderRadius: 4,
        },
      ],
    };
  }
}
