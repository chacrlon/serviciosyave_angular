import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { Observable, Subject, BehaviorSubject } from 'rxjs';  
import { Notification } from '../models/Notification';  

@Injectable({  
  providedIn: 'root'  
})  
export class NotificationsseService {  
  private readonly baseUrl = 'http://localhost:8080';  
  private eventSource: EventSource | null = null;  
  private notificationSubject = new Subject<Notification>();  
  private connectionStatus = new BehaviorSubject<boolean>(false);  

  constructor(private http: HttpClient) {}  

  // Getters para los observables  
  get notifications$(): Observable<Notification> {  
    return this.notificationSubject.asObservable();  
  }  

  get connectionStatus$(): Observable<boolean> {  
    return this.connectionStatus.asObservable();  
  }  

  // Métodos para SSE  
  connectToSSE(): void {  
    if (this.eventSource) {  
      this.disconnectSSE();  
    }  

    this.eventSource = new EventSource(`${this.baseUrl}/notifications`);  
    
    this.eventSource.onopen = () => {  
      console.log('Conexión SSE establecida');  
      this.connectionStatus.next(true);  
    };  

    this.eventSource.onmessage = (event) => {  
      try {  
        const data = JSON.parse(event.data);  
        console.log('Notificación SSE recibida:', data);  
        this.notificationSubject.next(data);  
      } catch (error) {  
        console.error('Error al procesar notificación SSE:', error);  
      }  
    };  

    this.eventSource.onerror = (error) => {  
      console.error('Error en conexión SSE:', error);  
      this.connectionStatus.next(false);  
      this.eventSource?.close();  
      
      // Reintentar conexión después de 5 segundos  
      setTimeout(() => this.connectToSSE(), 5000);  
    };  
  }  

  disconnectSSE(): void {  
    if (this.eventSource) {  
      console.log('Cerrando conexión SSE');  
      this.eventSource.close();  
      this.eventSource = null;  
      this.connectionStatus.next(false);  
    }  
  }  

  // Métodos REST  
  getUserNotifications(userId: number): Observable<Notification[]> {  
    return this.http.get<Notification[]>(`${this.baseUrl}/api/notifications/${userId}`);  
  }  

  markAsRead(notificationId: number): Observable<void> {  
    return this.http.put<void>(`${this.baseUrl}/api/notifications/read/${notificationId}`, {});  
  }  

  // Método para manejar reconexiones  
  reconnect(): void {  
    console.log('Intentando reconexión SSE...');  
    this.disconnectSSE();  
    this.connectToSSE();  
  }  
}