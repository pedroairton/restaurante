import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../../core/services/api.service';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Category } from '../../../../core/models/products.model';
import { ToastrService } from 'ngx-toastr';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-form-product',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatLabel, MatInputModule, MatSelectModule],
  templateUrl: './form-product.component.html',
  styleUrl: './form-product.component.scss'
})
export class FormProductComponent {
  readonly data = inject(MAT_DIALOG_DATA)
  readonly dialogRef = inject(MatDialogRef<FormProductComponent>)
  private fb = inject(FormBuilder)
  private apiService = inject(ApiService)
  private toastr = inject(ToastrService)
  productForm: FormGroup
  categories: Category[] = []

  constructor(){
    console.log(this.data);
    this.productForm = this.fb.group({
      name: [this.data?.name || '', [Validators.required]],
      price: [this.data?.price || '', [Validators.required, Validators.min(0.5)]],
      description: [this.data?.description || ''],
      category_id: [this.data?.category_id || '', [Validators.required]],
    })
  }
  ngOnInit(){
    this.loadCategories()
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
  submit(){
    if(this.productForm.invalid) {
      this.toastr.error('Preencha todos os campos', 'Atenção');
      return
    }
    if(this.data?.id){
      this.apiService.updateProduct(this.data.id, this.productForm.value).subscribe({
        next: (response) => {
          this.toastr.success('Produto atualizado com sucesso', 'Sucesso');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.log(error);
          this.toastr.error(error.error?.message || 'Erro desconhecido', 'Erro ao atualizar produto');
        },
      });
    } else {
      this.apiService.createProduct(this.productForm.value).subscribe({
        next: (response) => {
          this.toastr.success('Produto criado com sucesso', 'Sucesso');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.log(error);
          this.toastr.error(error.error?.message || 'Erro desconhecido', 'Erro ao criar produto');
        },
      });
    }
  }
}
