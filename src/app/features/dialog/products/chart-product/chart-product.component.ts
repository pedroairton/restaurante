import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../../core/services/api.service';
import { SalesStats } from '../../../../core/models/products.model';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-chart-product',
  imports: [BaseChartDirective],
  templateUrl: './chart-product.component.html',
  styleUrl: './chart-product.component.scss',
})
export class ChartProductComponent {
  readonly dialogRef = inject(MatDialog);
  readonly data = inject(MAT_DIALOG_DATA);
  private apiService = inject(ApiService);
  private toastr = inject(ToastrService);
  salesStats: SalesStats | null = null;

  constructor() {}

  ngOnInit() {
    this.getCharts();
  }
  getCharts() {
    this.apiService.getProductSalesStats(this.data?.id).subscribe({
      next: (response) => {
        console.log(response);
        this.salesStats = response;
        this.updateChart('week');
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
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

            if (axis === 'yRevenue') {
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
  changePeriod(event: Event) {
    const target = event.target as HTMLSelectElement
    const value = target.value
    this.updateChart(value)
  }
  private updateChart(period: string) {
    if(!this.salesStats) {
      this.toastr.error('Erro ao buscar estatísticas', 'Erro');
      return
    }
    if(period !== 'week' && period !== 'month') {
      this.toastr.error('Período inválido', 'Erro');
      return
    }
    const isWeek = period === 'week'
    const source = isWeek ? this.salesStats.weeklySales : this.salesStats.monthlySales

    this.chartData = {
      labels: source.map((item: any) => isWeek ? item.week_start : item.month),
      datasets: [
        {
          label: 'Receita',
          data: source.map((item: any) => item.total_revenue),
          yAxisID: 'yRevenue',
          backgroundColor: 'rgba(55, 199, 132, 0.2)',
          borderColor: 'rgba(55, 199, 132, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Vendas',
          data: source.map((item: any) => item.total_sold),
          yAxisID: 'yOrders',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ]
    }
  }
}
