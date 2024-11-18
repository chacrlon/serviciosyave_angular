// notification.service.ts  
import { Injectable } from '@angular/core';  
import { Subject } from 'rxjs';  

@Injectable({  
  providedIn: 'root'  
})  
export class NotificationService {  
  private notificationsSubject = new Subject<any>();  
  notifications$ = this.notificationsSubject.asObservable();  

  constructor() {  
    this.connectToNotifications();  
  }  

  private connectToNotifications() {  
    const eventSource = new EventSource('http://localhost:8080/notifications');  

    eventSource.onmessage = (event) => {  
      const notification = JSON.parse(event.data);  
      console.log("Notificación recibida:", notification); // Agrega este log  
      this.notificationsSubject.next(notification);  
    };  

    eventSource.onerror = (error) => {  
      console.error('EventSource failed:', error);  
      eventSource.close();  
    };  
  }  
}