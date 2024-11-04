import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { PaymentDTO } from '../models/PaymentDTO'; 

@Injectable({  
  providedIn: 'root'  
})  
export class PaymentService {  
  private apiUrl = 'http://localhost:8080/api/payment'; // Cambia esto a la URL de tu API  

  constructor(private http: HttpClient) { }  

  getAllPayments(): Observable<PaymentDTO[]> {  
    return this.http.get<PaymentDTO[]>(`${this.apiUrl}/all`);  
  }  

  approvePayment(id: number): Observable<void> {  
    return this.http.put<void>(`${this.apiUrl}/approve/${id}`, {});  
  }  

  rejectPayment(id: number): Observable<void> {  
    return this.http.put<void>(`${this.apiUrl}/reject/${id}`, {});  
  }  
}