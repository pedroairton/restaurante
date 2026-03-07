import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatLabel } from '@angular/material/select';

@Component({
  selector: 'app-orders',
  imports: [MatSelectModule, MatFormFieldModule, MatInputModule, MatLabel],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {

}
