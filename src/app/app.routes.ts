import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'Restaurante |Dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'pedidos',
        title: 'Restaurante | Pedidos',
        loadComponent: () =>
          import('./features/orders/orders.component').then(
            (m) => m.OrdersComponent,
          ),
      },
      {
        path: 'produtos',
        title: 'Restaurante | Produtos',
        loadComponent: () =>
          import('./features/products/products.component').then(
            (m) => m.ProductsComponent,
          ),
      },
      {
        path: 'relatorios',
        title: 'Restaurante | Relatórios',
        loadComponent: () =>
          import('./features/reports/reports.component').then(
            (m) => m.ReportsComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  }
];
