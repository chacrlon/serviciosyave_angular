import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  private baseUrl = 'http://localhost:8080/api/chat-state';

  constructor(private http: HttpClient) { }

  saveState(state: any): Observable<any> {
    console.log('Enviando estado al backend:', state);
    return this.http.post(this.baseUrl, state);
  }

  getState(paymentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${paymentId}`);
  }
}