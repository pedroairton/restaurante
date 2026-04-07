import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Report } from '../../core/models/reports.model';
import { ChartSalesByCategoryComponent } from '../report-charts/chart-sales-by-category/chart-sales-by-category.component';
import { ChartTopProductsComponent } from '../report-charts/chart-top-products/chart-top-products.component';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pdf',
  imports: [
    ChartSalesByCategoryComponent,
    ChartTopProductsComponent,
    MatIconModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './pdf.component.html',
  styleUrl: './pdf.component.scss',
})
export class PdfComponent {
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  @Input() report: Report | null = null;

  isGenerating = false;

  async generatePDF(): Promise<void> {
    console.log('pdf is generating', this.report, this.isGenerating);

    if (!this.report || this.isGenerating) return;

    this.isGenerating = true;

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const element = this.pdfContent.nativeElement;
      console.log(element);
      element.style.height = 'auto';
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';

      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const imgWidth = pdfWidth - margin * 2;
      const pageHeightPx = (canvas.width * (pdfHeight - margin * 2)) / imgWidth;

      let y = 0;

      while (y < canvas.height) {
        const pageCanvas = document.createElement('canvas');
        const pageContext = pageCanvas.getContext('2d')!;

        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(pageHeightPx, canvas.height - y);

        pageContext.drawImage(
          canvas,
          0,
          y,
          canvas.width,
          pageCanvas.height,
          0,
          0,
          canvas.width,
          pageCanvas.height,
        );

        const imgData = pageCanvas.toDataURL('image/png');
        const imgHeight = (pageCanvas.height * imgWidth) / canvas.width;

        if (y > 0) pdf.addPage();

        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

        y += pageHeightPx;
      }
      const fileName = `relatorio_${this.report.period.start_date}_${this.report.period.end_date}.pdf`;
      console.log(pdf);

      pdf.save(fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF', error);
      alert('Erro ao gerar PDF. Por favor, tente novamente.');
    } finally {
      this.isGenerating = false;
    }
  }

  getPercentageWidth(value: number, max: number): string {
    return `${(value / max) * 100}%`;
  }

  get maxProductSales(): number {
    if (!this.report?.top_products.length) return 0;
    return Math.max(
      ...this.report.top_products.map((product) => Number(product.total_sold)),
    );
  }
}
