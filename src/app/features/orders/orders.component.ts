// orders.component.ts

import {
  Component,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLabel } from '@angular/material/select';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models/products.model';
import { ToastrService } from 'ngx-toastr';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { Table } from '../../core/models/tables.model';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
  CreateOrderPayload,
  Order,
  SelectedItem,
} from '../../core/models/order-item.model';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';

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
    MatExpansionModule,
    DatePipe,
    MatButtonModule,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastr = inject(ToastrService);

  // ── Estado de edição ──
  isEditMode = false;
  editingOrderId: number | null = null;

  // ── Dados ──
  products: Product[] = [];
  tables: Table[] = [];
  allTables: Table[] = []; // Todas as mesas (para edição)
  selectedItems: SelectedItem[] = [];
  pendingOrders: Order[] = [];
  readonly panelOpenState = signal(false);

  // ── Form Controls ──
  tableControl = new FormControl<number | null>(null);
  productControl = new FormControl<number | null>(null);
  searchControl = new FormControl('');
  observationsControl = new FormControl('');

  // ── Select com busca ──
  filteredProducts: ReplaySubject<Product[]> = new ReplaySubject<Product[]>(1);

  // ── Loading ──
  isSubmitting = false;

  // ── Getters ──

  get totalItems(): number {
    return this.selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  get totalPrice(): number {
    const value = this.selectedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    return value;
  }

  get selectedTableNumber(): number | null {
    if (!this.tableControl.value) return null;
    // Busca em allTables para cobrir mesas ocupadas durante edição
    const table = this.allTables.find((t) => t.id === this.tableControl.value);
    return table ? table.number : null;
  }

  get canSubmit(): boolean {
    return (
      this.tableControl.value !== null &&
      this.selectedItems.length > 0 &&
      !this.isSubmitting
    );
  }

  get submitButtonText(): string {
    if (this.isSubmitting) return 'Enviando...';
    return this.isEditMode ? 'Salvar alterações' : 'Finalizar pedido';
  }

  // ── Lifecycle ──

  ngOnInit(): void {
    this.loadPendingOrders();
    this.loadTables();
    this.loadProducts();
    this.setupSearch();
  }

  constructor() {}

  // ── Carregamento de dados ──

  private loadPendingOrders(): void {
    this.apiService.getOrders({ status: 'pending' }).subscribe({
      next: (response) => {
        this.pendingOrders = response.data;
      },
      error: (error) => {
        this.toastr.error(
          error.error?.message || 'Erro desconhecido',
          'Erro ao buscar pedidos pendentes',
        );
      },
    });
  }

  private loadTables(): void {
    // Carrega TODAS as mesas (para usar no modo edição)
    this.apiService.getTables().subscribe({
      next: (response) => {
        this.allTables = response;
        // Filtra apenas as disponíveis para o select (modo criação)
        this.tables = response.filter((t: Table) => t.status === 'available');
      },
      error: (error) => {
        this.toastr.error(
          error.error?.message || 'Erro desconhecido',
          'Erro ao buscar mesas',
        );
      },
    });
  }

  private loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response) => {
        this.products = response.data;
        this.filteredProducts.next(this.products);
      },
      error: (error) => {
        this.toastr.error(
          error.error?.message || 'Erro desconhecido',
          'Erro ao buscar produtos',
        );
      },
    });
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.subscribe((search) => {
      const term = (search ?? '').toLowerCase();

      if (!term) {
        this.filteredProducts.next(this.products);
        return;
      }

      this.filteredProducts.next(
        this.products.filter((product: Product) =>
          product.name.toLowerCase().includes(term),
        ),
      );
    });
  }

  // ── Gerenciamento de itens ──

  addProduct(): void {
    const productId = this.productControl.value;

    if (!productId) {
      this.toastr.warning('Selecione um produto', 'Atenção');
      return;
    }

    const product = this.products.find((p) => p.id === productId);

    if (!product) {
      this.toastr.error('Produto não encontrado', 'Erro');
      return;
    }

    const existingItem = this.selectedItems.find(
      (item) => item.product.id === productId,
    );
    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.subtotal =
        existingItem.quantity * existingItem.product.price;
      this.toastr.info(
        `${product.name} — quantidade: ${existingItem.quantity}`,
        'Quantidade atualizada',
      );
    } else {
      this.selectedItems.push({
        product,
        quantity: 1,
        subtotal: Number(product.price),
      });
      this.toastr.success(`${product.name} adicionado ao pedido`, 'Sucesso');
    }

    this.productControl.reset();
    this.searchControl.reset();
  }

  incrementQuantity(index: number): void {
    const item = this.selectedItems[index];
    item.quantity += 1;
    item.subtotal = item.quantity * item.product.price;
  }

  decrementQuantity(index: number): void {
    const item = this.selectedItems[index];

    if (item.quantity <= 1) {
      this.removeItem(index);
      return;
    }

    item.quantity -= 1;
    item.subtotal = item.quantity * item.product.price;
  }

  removeItem(index: number): void {
    const removed = this.selectedItems.splice(index, 1)[0];
    this.toastr.info(
      `${removed.product.name} removido do pedido`,
      'Item removido',
    );
  }

  // ══════════════════════════════════════
  //  EDIÇÃO DE PEDIDO
  // ══════════════════════════════════════

  editOrder(order: Order): void {
    this.isEditMode = true;
    this.editingOrderId = order.id;

    // 1. Inclui a mesa atual do pedido nas opções do select
    //    (ela pode estar "occupied" e não apareceria normalmente)
    this.updateTablesForEdit(order.table_id);

    // 2. Preenche a mesa no select
    this.tableControl.setValue(order.table_id);

    // 3. Preenche as observações
    this.observationsControl.setValue(order.observations || '');

    // 4. Converte os itens do pedido para SelectedItem[]
    this.selectedItems = order.items.map((item) => {
      // Tenta encontrar o produto completo na lista carregada
      const fullProduct = this.products.find(
        (p) => p.id === item.product_id || p.id === item.product.id,
      );

      const product: Product = fullProduct || {
        id: item.product.id,
        name: item.product.name,
        price: Number(item.unit_price),
        category_id: item.product.category_id,
        description: item.product.description || '',
        is_active: true,
      };

      return {
        product: product,
        quantity: item.quantity,
        subtotal: item.quantity * product.price,
      };
    });

    // 5. Scroll para o topo do formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.toastr.info(
      `Editando pedido da Mesa ${order.table.number}`,
      'Modo edição',
    );
  }

  /**
   * No modo edição, inclui a mesa do pedido no select
   * mesmo que ela esteja "occupied"
   */
  private updateTablesForEdit(currentTableId: number): void {
    const availableTables = this.allTables.filter(
      (t) => t.status === 'available' || t.id === currentTableId,
    );
    this.tables = availableTables;
  }

  // ══════════════════════════════════════
  //  FINALIZAR / CANCELAR PEDIDO
  // ══════════════════════════════════════

  finalizeOrder(order: Order): void {
    if (!confirm(`Finalizar pedido da Mesa ${order.table.number}?`)) return;

    this.apiService.updateOrderStatus(order.id, 'paid').subscribe({
      next: () => {
        this.toastr.success(
          `Pedido da Mesa ${order.table.number} finalizado!`,
          'Pedido pago',
        );
        this.loadPendingOrders();
        this.loadTables();
      },
      error: (error) => {
        this.toastr.error(
          error.error?.message || 'Erro desconhecido',
          'Erro ao finalizar pedido',
        );
      },
    });
  }

  cancelOrder(order: Order): void {
    if (
      !confirm(
        `Cancelar pedido da Mesa ${order.table.number}? Esta ação não pode ser desfeita.`,
      )
    )
      return;

    this.apiService.updateOrderStatus(order.id, 'cancelled').subscribe({
      next: () => {
        this.toastr.success(
          `Pedido da Mesa ${order.table.number} cancelado.`,
          'Pedido cancelado',
        );
        // Se estava editando este pedido, sai do modo edição
        if (this.editingOrderId === order.id) {
          this.resetForm();
        }
        this.loadPendingOrders();
        this.loadTables();
      },
      error: (error) => {
        this.toastr.error(
          error.error?.message || 'Erro desconhecido',
          'Erro ao cancelar pedido',
        );
      },
    });
  }

  // ══════════════════════════════════════
  //  SUBMIT (CRIAR OU ATUALIZAR)
  // ══════════════════════════════════════

  submit(): void {
    if (!this.tableControl.value) {
      this.toastr.warning('Selecione uma mesa', 'Atenção');
      return;
    }

    if (this.selectedItems.length === 0) {
      this.toastr.warning('Selecione pelo menos um item', 'Atenção');
      return;
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

    // Decide se cria ou atualiza
    const request$ =
      this.isEditMode && this.editingOrderId
        ? this.apiService.updateOrder(this.editingOrderId, payload)
        : this.apiService.createOrder(payload);

    request$.subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (this.isEditMode) {
          this.toastr.success('Pedido atualizado com sucesso!', 'Sucesso');
        } else {
          this.toastr.success(
            `Pedido #${response.id} criado com sucesso!`,
            'Sucesso',
          );
        }

        this.resetForm();
      },
      error: (error) => {
        this.isSubmitting = false;

        if (error.error?.errors) {
          const messages = Object.values(error.error.errors).flat();
          messages.forEach((message: any) => {
            this.toastr.error(message, 'Erro de validação');
          });
        } else {
          this.toastr.error(
            error.error?.message || 'Erro desconhecido',
            this.isEditMode
              ? 'Erro ao atualizar pedido'
              : 'Erro ao criar pedido',
          );
        }
      },
    });
  }

  // ══════════════════════════════════════
  //  RESET
  // ══════════════════════════════════════

  resetForm(): void {
    this.isEditMode = false;
    this.editingOrderId = null;
    this.selectedItems = [];
    this.tableControl.reset();
    this.observationsControl.reset();
    this.productControl.reset();
    this.searchControl.reset();
    this.loadTables();
    this.loadPendingOrders();
  }
}
