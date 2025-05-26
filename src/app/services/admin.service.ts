import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/paginated-response.model';
import { AdminPayment } from '../models/admin-payment.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
   private apiUrl = 'http://localhost:8080/api/payroll';

  constructor(private http: HttpClient) { }

    // Obtener pagos pendientes
  getPendingPayments(): Observable<AdminPayment[]> {
    return this.http.get<AdminPayment[]>(`${this.apiUrl}/pending`);
  }

  // Actualizar pago
  updatePayment(paymentId: number, reference: string): Observable<AdminPayment> {
    return this.http.put<AdminPayment>(`${this.apiUrl}/${paymentId}`, { reference });
  }
}