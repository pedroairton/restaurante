import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/services/api.service';
import { Dashboard } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  imports: [MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private apiService = inject(ApiService);
  public dashboard: Dashboard | null = null;

  constructor() {
    this.getDashboard();
  }
  getDashboard() {
    this.apiService.getDashboard().subscribe({
      next: (response) => {
        this.dashboard = response;
        console.log(this.dashboard);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
