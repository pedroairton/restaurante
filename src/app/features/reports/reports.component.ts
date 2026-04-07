import { Component, inject, ChangeDetectionStrategy, ViewChild } from '@angular/core';
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
import { ChartTopProductsComponent } from '../report-charts/chart-top-products/chart-top-products.component';
import { ChartSalesByCategoryComponent } from "../report-charts/chart-sales-by-category/chart-sales-by-category.component";
import { PdfComponent } from '../pdf/pdf.component';
import { MatButton } from "@angular/material/button";

@Component({
  selector: 'app-reports',
  imports: [
    LoadingComponent,
    MatIconModule,
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    CurrencyPipe,
    ChartTopProductsComponent,
    ChartSalesByCategoryComponent,
    PdfComponent,
    MatButton
],
  providers: [
    provideNativeDateAdapter(),
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent {
  @ViewChild('pdfReport') pdfReportComponent!: PdfComponent;

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
  isExporting = false;

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
        if (!this.report) {
          this.toastr.error('Selecione um período', 'Atenção');
          return;
        }
        console.log(this.report);
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
        if (!this.report) {
          this.toastr.error('Selecione um período', 'Atenção');
          return;
        }
        console.log(this.report);
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
  async exportToPDF(): Promise<void>{
    if(!this.report) return
    
    this.isExporting = true

    try{
      await this.pdfReportComponent.generatePDF()
      this.toastr.success('Relatório gerado com sucesso', 'Sucesso')
    } catch(error){
      console.log(error);
      this.toastr.error('Erro desconhecido', 'Erro ao gerar relatório');
    } finally {
      this.isExporting = false
    }
  }
}
