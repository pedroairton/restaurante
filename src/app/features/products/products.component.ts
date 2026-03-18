import { Component, inject } from '@angular/core';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category, Product } from '../../core/models/products.model';
import { ApiService } from '../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { FormProductComponent } from '../dialog/products/form-product/form-product.component';

@Component({
  selector: 'app-products',
  imports: [MatFormFieldModule, MatLabel, MatInputModule, MatSelectModule, CurrencyPipe],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent {
  categories: Category[] = [];
  products: Product[] = [];
  private apiService = inject(ApiService);
  private toastr = inject(ToastrService);

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }
  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (response) => {
        console.log(response);
        this.categories = response;
      },
      error: (error) => {
        console.log(error);
        this.toastr.error(
          error.error?.message || 'Erro desconhecido',
          'Erro ao buscar categorias',
        );
      },
    });
  }
  loadProducts(params?: any) {
    this.apiService.getProducts(params).subscribe({
      next: (response) => {
        console.log(response);
        this.products = response.data;
      },
      error: (error) => {
        console.log(error);
        this.toastr.error(
          error.error?.message || 'Erro desconhecido',
          'Erro ao buscar produtos',
        );
      },
    });
  }
  openDialog(product?: Product) {
    const dialogRef = this.dialog.open(FormProductComponent, {
      width: '500px',
      data: product,
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.loadProducts();
    });
  }
}
