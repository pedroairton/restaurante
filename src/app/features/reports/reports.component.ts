import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ApiService } from '../../core/services/api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DATE_FORMATS,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Report } from '../../core/models/reports.model';
import { CurrencyPipe } from '@angular/common';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-reports',
  imports: [
    LoadingComponent,
    MatIconModule,
    BaseChartDirective,
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    CurrencyPipe
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent {
  isLoading = false;
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  date = new Date();
  firstMonthDay = new Date(this.date.getFullYear(), this.date.getMonth(), 1);

  rangeForm = this.fb.group({
    start_date: [this.firstMonthDay as Date | null, [Validators.required]],
    end_date: [this.date as Date | null, [Validators.required]],
  });

  report: Report | null = null;

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

  ngOnInit() {
    this.loadMonthlyReport();
  }
  loadMonthlyReport() {
    const params = {
      start_date: this.firstMonthDay.toISOString().split('T')[0],
      end_date: this.date.toISOString().split('T')[0],
    };
    this.apiService.getReports(params).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.report = response;
        console.log(this.report);
        this.updateChart();
      },
      error: (error) => {
        console.log(error);
        this.toastr.error(
          error.error?.message || 'Erro desconhecido',
          'Erro ao buscar relatórios',
        );
        this.isLoading = false;
      },
    });
  }
  submit() {
    if (this.rangeForm.invalid) {
      return;
    }

    const { start_date, end_date } = this.rangeForm.getRawValue();

    const params: any = {};

    const formattedStart = this.formatDate(start_date);
    const formattedEnd = this.formatDate(end_date);

    if (formattedStart) params.start_date = formattedStart;
    if (formattedEnd) params.end_date = formattedEnd;

    this.isLoading = true;

    this.apiService.getReports(params).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.report = response;
        console.log(this.report);
        this.updateChart();
      },
      error: (error) => {
        console.log(error);
        this.toastr.error(
          error.error?.message || 'Erro desconhecido',
          'Erro ao buscar relatórios',
        );
        this.isLoading = false;
      },
    });
  }
  private formatDate(date: Date | null): string | null {
    if (!date) return null;
    return date.toISOString().split('T')[0];
  }
  private updateChart(): void {
    if (!this.report) {
      this.toastr.error('Selecione um período', 'Atenção');
      return;
    }
    console.log(this.report.sales_by_category);

    this.chartData = {
      labels: this.report.sales_by_category.map((cat) => cat.name),
      datasets: [
        {
          data: this.report.sales_by_category.map((cat) =>
            Number(cat.total_revenue),
          ),
          backgroundColor: this.colors.slice(
            0,
            this.report.sales_by_category.length,
          ),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }
}
