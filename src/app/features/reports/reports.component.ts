import { Component, SimpleChanges, OnChanges } from '@angular/core';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-reports',
  imports: [LoadingComponent, MatIconModule, BaseChartDirective],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent {
  isLoading = false;
  salesByCategory: {
    id: number;
    name: string;
    total_revenue: string;
    total_quantity: string;
    percentage: string;
  }[] = [
        {
            "id": 1,
            "name": "Entradas",
            "total_revenue": "220.30",
            "total_quantity": "7",
            "percentage": "30.42"
        },
        {
            "id": 8,
            "name": "Bebidas",
            "total_revenue": "176.90",
            "total_quantity": "21",
            "percentage": "24.43"
        },
        {
            "id": 7,
            "name": "Sobremesas",
            "total_revenue": "124.50",
            "total_quantity": "5",
            "percentage": "17.19"
        },
        {
            "id": 3,
            "name": "Massas",
            "total_revenue": "116.70",
            "total_quantity": "3",
            "percentage": "16.11"
        },
        {
            "id": 2,
            "name": "Pratos Principais",
            "total_revenue": "85.80",
            "total_quantity": "2",
            "percentage": "11.85"
        }
    ];

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

  // Paleta de cores
  private colors = [
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
    '#14B8A6',
    '#E11D48',
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['salesByCategory'] && this.salesByCategory.length) {
      this.updateChart();
    }
  }
  ngOnInit(){
    this.updateChart();
  }

  private updateChart(): void {
    this.chartData = {
      labels: this.salesByCategory.map((cat) => cat.name),
      datasets: [
        {
          data: this.salesByCategory.map((cat) => Number(cat.total_revenue)),
          backgroundColor: this.colors.slice(0, this.salesByCategory.length),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }
}
