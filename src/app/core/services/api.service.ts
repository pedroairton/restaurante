import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dashboard } from '../models/dashboard.model';
import { CreateOrderPayload } from '../models/order-item.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getDashboard(): Observable<Dashboard>{
    return this.http.get<Dashboard>(`${this.apiUrl}/dashboard`);
  }
  getProducts(params?: any): Observable<any>{
    return this.http.get(`${this.apiUrl}/products`, {params});
  }
  getAvailableTables(params?: any): Observable<any>{
    return this.http.get(`${this.apiUrl}/tables`, {params: {status: 'available'}});
  }
  getOrders(params?: any): Observable<any>{
    return this.http.get(`${this.apiUrl}/orders`, {params});
  }
  createOrder(payload: CreateOrderPayload): Observable<any>{
    return this.http.post(`${this.apiUrl}/orders`, payload);
  }
  getCategories(): Observable<any>{
    return this.http.get(`${this.apiUrl}/categories`);
  }
  createProduct(payload: any): Observable<any>{
    return this.http.post(`${this.apiUrl}/products`, payload);
  }
  updateProduct(id: number, payload: any): Observable<any>{
    return this.http.put(`${this.apiUrl}/products/${id}`, payload);
  }
}
