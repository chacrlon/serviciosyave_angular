import { Injectable, NgZone } from '@angular/core';  
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

  constructor(private http: HttpClient, private ngZone: NgZone) {}  

  // Getters para los observables  
  get notifications$(): Observable<Notification> {  
    return this.notificationSubject.asObservable();  
  }  

  get connectionStatus$(): Observable<boolean> {  
    return this.connectionStatus.asObservable();  
  }  

  // Métodos para SSE  
  connectToSSE(): Observable<any> {  
    if (this.eventSource) {  
      this.disconnectSSE();  
    }  

    return new Observable((observer) => {  
      this.eventSource = new EventSource(`${this.baseUrl}/notifications`);  
      
      this.eventSource.onopen = () => {  
        console.log('Conexión SSE establecida');  
        this.connectionStatus.next(true);  
      };  

      this.eventSource.onmessage = (event) => {  
        this.ngZone.run(() => {  
          try {  
            const data = JSON.parse(event.data);  
            console.log('Notificación SSE recibida:', data);  
            this.notificationSubject.next(data);  
            observer.next(data); // Emitir la notificación al observer  
          } catch (error) {  
            console.error('Error al procesar notificación SSE:', error);  
            observer.error(error); // Pasar el error al observer  
          }  
        });  
      };  

      this.eventSource.onerror = (error) => {  
        console.error('Error en conexión SSE:', error);  
        this.connectionStatus.next(false);  
        this.eventSource?.close();  

        // Pasar el error al observer  
        this.ngZone.run(() => {  
          observer.error(error);  
        });  

        // Reintentar conexión después de 5 segundos  
        setTimeout(() => {  
          console.log('Reintentando conexión SSE...');  
          this.connectToSSE().subscribe(observer); // Manejar reconexión  
        }, 5000);  
      };  

      // Cerrar conexión al cancelar la suscripción  
      return () => {  
        this.eventSource?.close();  
      };  
    });  
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