import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./shared/components/sidebar/sidebar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'restaurante';
  hideSidebar = false;

  constructor(private router: Router) {
    this.router.events.subscribe(e => {
      if(e instanceof NavigationEnd) {
        if(e.url.includes('login')) {
          this.hideSidebar = true;
        } else {
          this.hideSidebar = false;
        }
      }
    })
  }
}
