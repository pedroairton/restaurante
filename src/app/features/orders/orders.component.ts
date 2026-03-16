import { Component, inject } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLabel } from '@angular/material/select';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models/products.model';
import { ToastrService } from 'ngx-toastr';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Table } from '../../core/models/tables.model';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CreateOrderPayload, SelectedItem } from '../../core/models/order-item.model';

@Component({
  selector: 'app-orders',
  imports: [
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatLabel,
    ReactiveFormsModule,
    AsyncPipe,
    CurrencyPipe,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent {
  private apiService = inject(ApiService);
  private toastr = inject(ToastrService);

  products: Product[] = [];
  tables: Table[] = [];
  selectedItems: SelectedItem[] = [];

  tableControl = new FormControl<number | null>(null);
  productControl = new FormControl<number | null>(null);
  searchControl = new FormControl('');
  observationsControl = new FormControl('')
  
  filteredProducts: ReplaySubject<Product[]> = new ReplaySubject<Product[]>(1);

  isSubmitting = false

  get totalItems(): number {
    return this.selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  }
  get totalPrice(): number {
    return this.selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  }
  get selectedTableNumber(): number | null {
    if(!this.tableControl.value) return null
    const table = this.tables.find(t => t.id === this.tableControl.value)
    return table ? table.number : null
  }
  get canSubmit(): boolean {
    return (
      this.tableControl.value !== null &&
      this.selectedItems.length > 0 &&
      !this.isSubmitting
    )
  }

  ngOnInit(){
    this.loadTables();
    this.loadProducts();
    this.setupSearch();
  }

  private loadTables(): void {
    this.apiService.getAvailableTables().subscribe({
      next: (response) => {
        this.tables = response;
        console.log(this.tables);
      },
      error: (error) => {
        console.log(error);
        this.toastr.error(
          error.error?.message || 'Erro desconhecido',
          'Erro ao buscar mesas disponíveis',
        );
      },
    })
  }
  private loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response) => {
        this.products = response.data;
        this.filteredProducts.next(this.products);
        console.log(this.products);
      },
      error: (error) => {
        console.log(error);
        this.toastr.error(error.error?.message || 'Erro desconhecido', 'Erro ao buscar produtos');
      },
    });
  }
  private setupSearch(): void {
    this.searchControl.valueChanges.subscribe((search) => {
      const term = (search ?? '').toLowerCase();

      if(!term){
        this.filteredProducts.next(this.products);
        return
      }
      this.filteredProducts.next(
        this.products
          .filter((product: Product) => product.name.toLowerCase().includes(term))
          
      )
    })
  }
  

  constructor(){}
  addProduct(): void{
    const productId = this.productControl.value;
    if(!productId) {
      this.toastr.warning('Selecione um produto', 'Atenção');
      return
    }
    const product = this.products.find((p) => p.id === productId);

    if(!product) {
      this.toastr.error('Produto não encontrado', 'Erro');
      return
    }
    const existingItem = this.selectedItems.find(
      (item) => item.product.id === productId,
    )
    if(existingItem){
      existingItem.quantity += 1;
      existingItem.subtotal = existingItem.quantity * existingItem.product.price;
      this.toastr.info(
        `${product.name} - quantidade: ${existingItem.quantity}`,
        'Quantidade atualizada',
      )
    } else {
      this.selectedItems.push({
        product,
        quantity: 1,
        subtotal: product.price,
      });
      this.toastr.success(`${product.name} adicionado ao pedido`, 'Sucesso');
    }

    this.productControl.reset()
    this.searchControl.reset()
  }

  incrementQuantity(index: number): void {
    const item = this.selectedItems[index];
    item.quantity += 1
    item.subtotal = item.quantity * item.product.price
  }

  decrementQuantity(index: number): void {
    const item = this.selectedItems[index];
    item.quantity -= 1
    item.subtotal = item.quantity * item.product.price
  }

  removeItem(index: number): void {
    const removed = this.selectedItems.splice(index,1)[0]
    this.toastr.info(`${removed.product.name} removido do pedido`, 'Item removido')
  }
  submit() {
    if(!this.tableControl.value){
      this.toastr.warning('Selecione uma mesa', 'Atenção');
      return
    }
    if(this.selectedItems.length === 0){
      this.toastr.warning('Selecione pelo menos um item', 'Atenção');
      return
    }

    this.isSubmitting = true;

    const payload: CreateOrderPayload = {
      table_id: this.tableControl.value,
      observations: this.observationsControl.value,
      items: this.selectedItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };
    this.apiService.createOrder(payload).subscribe({
      next: (response) => {
        this.resetForm()
        this.isSubmitting = false;
        this.toastr.success(`Pedido ${response.id} criado com sucesso`, 'Sucesso');
      },
      error: (error) => {
        this.isSubmitting = false;
        console.log(error);
        if(error.error?.errors) {
          const messages = Object.values(error.error.errors).flat()
          messages.forEach((message: any) => {
            this.toastr.error(message, 'Erro ao validar pedido')
          });
        } else {
          this.toastr.error(error.error?.message || 'Erro desconhecido', 'Erro ao criar pedido');
        }
      },
    });
  }
  private resetForm(){
    this.selectedItems = [];
    this.tableControl.reset();
    this.observationsControl.reset();
    this.productControl.reset();
    this.searchControl.reset();
    this.loadTables();
  }
}
