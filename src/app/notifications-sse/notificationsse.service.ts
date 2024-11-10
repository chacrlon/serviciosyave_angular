import { Injectable } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { Notification } from '../models/Notification'; // Asegúrate de crear un modelo para Notification  

@Injectable({
  providedIn: 'root'
})
export class NotificationsseService {
  private baseUrl = 'http://localhost:8080/api/notifications'; // Cambia esto si es necesario  

  constructor(private http: HttpClient) {}  

  // Obtener notificaciones de un usuario  
  getUserNotifications(userId: number): Observable<Notification[]> {  
    return this.http.get<Notification[]>(`${this.baseUrl}/${userId}`);  
  }  

  // Marcar una notificación como leída  
  markAsRead(notificationId: number): Observable<void> {  
    return this.http.put<void>(`${this.baseUrl}/read/${notificationId}`, {});  
  }  
}  