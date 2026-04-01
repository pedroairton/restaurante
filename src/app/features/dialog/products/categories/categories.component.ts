import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Category } from '../../../../core/models/products.model';
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'app-categories',
  imports: [MatButtonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  readonly dialogRef = inject(MatDialogRef<CategoriesComponent>);
  private apiService = inject(ApiService);
  private toastr = inject(ToastrService);
  categories: Category[] = [];

  ngOnInit() {
    this.getCategories();
  }
  getCategories() {
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
}
