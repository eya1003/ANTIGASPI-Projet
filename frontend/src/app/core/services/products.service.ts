import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private apiUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) {}

  addProductWithImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/addProductWithImage`, formData);
  }
  
  getAllProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAll`);
  }

  getUserProducts(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }
  deleteProduct(productId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/deleteProduct/${productId}`);
}

}
