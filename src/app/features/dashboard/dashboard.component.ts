import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/services/api.service';
import { Dashboard, WeeklySales } from '../../core/models/dashboard.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  imports: [MatIconModule, LoadingComponent, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  weeklySales: WeeklySales[] = [];
  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };
  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const axis = context.dataset.yAxisID;

            if(axis === 'yRevenue') {
              return `${context.dataset.label}: R$ ${value?.toFixed(2)}`;
            }

            return `${context.dataset.label}: ${value}`;
          },
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      yRevenue: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Receita (R$)',
        },
        grid: {
          display: false,
        },
        ticks: {
          callback: (value) => {
            return `R$ ${Number(value).toFixed(2)}`;
          },
        },
      },
      yOrders: {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Vendas',
        },
        grid: {
          display: false,
        },
        ticks: {
          precision: 0,
          callback: (value) => {
            return value;
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };
  private apiService = inject(ApiService);
  public dashboard: Dashboard | null = null;
  isLoading = false;

  constructor() {
    this.getDashboard();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['weeklySales'] && this.weeklySales.length) {
      this.updateChart();
      console.log('chart updated');
    }
  }
  floatToBRL(value: number | undefined) {
    if (!value) return 'Erro';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
  getDashboard() {
    this.isLoading = true;
    this.apiService.getDashboard().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.dashboard = response;
        this.weeklySales = this.dashboard.weekly_sales;
        this.updateChart();
        console.log('chart updated');
        console.log(this.dashboard);
      },
      error: (error) => {
        this.isLoading = false;
        console.log(error);
      },
    });
  }
  private updateChart() {
    this.chartData = {
      labels: this.weeklySales.map((day) => day.day_name),
      datasets: [
        {
          label: 'Receita',
          data: this.weeklySales.map((day) => day.daily_total),
          yAxisID: 'yRevenue',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Vendas',
          data: this.weeklySales.map((day) => day.daily_orders),
          yAxisID: 'yOrders',
          backgroundColor: 'rgba(55, 199, 132, 0.2)',
          borderColor: 'rgba(55, 199, 132, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }
}
