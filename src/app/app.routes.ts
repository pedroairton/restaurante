import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'pedidos',
    loadComponent: () =>
      import('./features/orders/orders.component').then(
        (m) => m.OrdersComponent,
      ),
  },
  {
    path: 'produtos',
    loadComponent: () =>
      import('./features/products/products.component').then(
        (m) => m.ProductsComponent,
      ),
  },
  {
    path: 'relatorios',
    loadComponent: () =>
      import('./features/reports/reports.component').then(
        (m) => m.ReportsComponent,
      ),
  },
];
