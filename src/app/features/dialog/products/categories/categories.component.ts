import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Category } from '../../../../core/models/products.model';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-categories',
  imports: [
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatLabel,
    MatInput,
    ReactiveFormsModule
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  readonly dialogRef = inject(MatDialogRef<CategoriesComponent>);
  readonly panelOpenState = signal(false);
  private apiService = inject(ApiService);
  private toastr = inject(ToastrService);
  categories: Category[] = [];
  selectedCategory: Category | null = null;
  isEditMode: boolean = false;
  private fb = inject(FormBuilder);
  formGroup: FormGroup

  constructor(){
    this.formGroup = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
    })
  }
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

  editCategory(category: Category) {
    this.isEditMode = true;
    this.panelOpenState.set(true);
    // update name formgroup
    this.selectedCategory = category;
    this.formGroup.get('name')?.setValue(category.name);
  }
  newCategory(){
    this.isEditMode = false;
    this.panelOpenState.set(true);
    this.selectedCategory = null;
  }
  deleteCategory(category: Category) {
    if(!confirm('Tem certeza que deseja excluir essa categoria?')) {
      return
    } else {
      this.apiService.deleteCategory(category.id).subscribe({
        next: (response) => {
          this.toastr.success('Categoria excluída com sucesso', 'Sucesso');
          this.getCategories();
        },
        error: (error) => {
          console.log(error);
          this.toastr.error(error.error?.message || 'Erro desconhecido', 'Erro ao excluir categoria');
        },
      });
    }
  }
  submit() {
    if(this.formGroup.invalid) {
      this.toastr.error('Preencha todos os campos', 'Atenção');
      return
    }
    if(!this.isEditMode) {
      this.apiService.createCategory(this.formGroup.value).subscribe({
        next: (response) => {
          this.toastr.success('Categoria criada com sucesso', 'Sucesso');
          this.dialogRef.close(true);
        },

        error: (error) => {
          console.log(error);
          this.toastr.error(error.error?.message || 'Erro desconhecido', 'Erro ao criar categoria');
        },
      });
    } else {
      console.log(this.selectedCategory)
      if(this.selectedCategory){
        this.apiService.updateCategory( this.selectedCategory,this.formGroup.value).subscribe({
          next: (response) => {
            this.toastr.success('Categoria atualizada com sucesso', 'Sucesso');
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.log(error);
            this.toastr.error(error.error?.message || 'Erro desconhecido', 'Erro ao atualizar categoria');
          },
        });
      }
    }
  }
}
