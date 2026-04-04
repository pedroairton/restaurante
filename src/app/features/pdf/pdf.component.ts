import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Report } from '../../core/models/reports.model';
import { ChartSalesByCategoryComponent } from "../report-charts/chart-sales-by-category/chart-sales-by-category.component";
import { ChartTopProductsComponent } from "../report-charts/chart-top-products/chart-top-products.component";
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-pdf',
  imports: [ChartSalesByCategoryComponent, ChartTopProductsComponent, MatIconModule, CurrencyPipe],
  templateUrl: './pdf.component.html',
  styleUrl: './pdf.component.scss'
})
export class PdfComponent {
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  @Input() report: Report | null = null;

  isGenerating = false;

  async generatePDF(): Promise<void> {
    console.log('pdf is generating', this.report, this.isGenerating);
    
    if(!this.report || this.isGenerating) return;

    this.isGenerating = true;

    try{
      await new Promise((resolve) => setTimeout(resolve, 100));
      console.log(this.pdfContent);
      
      const element = this.pdfContent.nativeElement;
      console.log(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }
      const fileName = `relatorio_${this.report.period.start_date}_${this.report.period.end_date}.pdf`;

      pdf.save(fileName)
    }
    catch(error){
      console.error("Erro ao gerar PDF", error);
      alert("Erro ao gerar PDF. Por favor, tente novamente.");
    } finally {
      this.isGenerating = false;
    }
  }

  getPercentageWidth(value: number, max: number): string {
    return `${(value / max) * 100}%`;
  }

  get maxProductSales(): number {
    if(!this.report?.top_products.length) return 0
    return Math.max(...this.report.top_products.map((product) => Number(product.total_sold)));
  }
}
