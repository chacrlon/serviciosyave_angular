import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/paginated-response.model';
import { AdminPayment } from '../models/admin-payment.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = '/api/admin/paymentseller'; // Endpoint para obtener los pagos

  constructor(private http: HttpClient) {}

  // Obtener todos los pagos con paginación
  getAllSellerPayments(page: number = 0, size: number = 10, sort: string = 'transactionDate,desc'): Observable<PaginatedResponse<AdminPayment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
  
    return this.http.get<PaginatedResponse<AdminPayment>>(this.apiUrl, { params });
  }

  // Aprobar un pago
  approvePayment(paymentId: number): Observable<void> {
    const url = `/api/payment/approve/${paymentId}`;
    return this.http.put<void>(url, {});
  }

  // Rechazar un pago
  rejectPayment(paymentId: number): Observable<void> {
    const url = `/api/payment/reject/${paymentId}`;
    return this.http.put<void>(url, {});
  }
}