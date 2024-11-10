import { Component, OnInit } from '@angular/core';  
import { CommonModule } from '@angular/common';  
import { NotificationsseService } from './notificationsse.service';  
import { Notification } from '../models/Notification';  
import { ActivatedRoute } from '@angular/router';  // Importar ActivatedRoute  

@Component({  
  selector: 'app-notifications-sse',  
  standalone: true,  
  imports: [CommonModule],  
  templateUrl: './notifications-sse.component.html',  
  styleUrls: ['./notifications-sse.component.css']  
})  
export class NotificationsSSEComponent implements OnInit {  

  notifications: Notification[] = [];  

  constructor(  
    private notificationsService: NotificationsseService,  
    private route: ActivatedRoute  // Inyección de ActivatedRoute  
  ) { }  

  ngOnInit(): void {  
    this.initializeEventSource();  
    const userId = this.getUserId();  
    this.fetchNotifications(userId);  
  }  

  initializeEventSource(): void {  
    const eventSource = new EventSource('http://localhost:8080/notifications');  
    
    eventSource.onmessage = (event) => {  
      const message: string = event.data;  
      alert(message);  
      const newNotification: Notification = {  
        id: Date.now(),  
        userId: this.getUserId(),  
        message: message,  
        read: false  
      };  
      this.notifications.push(newNotification);  
    };  
  }  

  fetchNotifications(userId: number): void {  
    this.notificationsService.getUserNotifications(userId).subscribe(  
      notifications => {  
        this.notifications = notifications;  
      },  
      error => {  
        console.error('Error fetching notifications', error);  
      }  
    );  
  }  

  getUserId(): number {  
    let userId: number | null = null;  
    this.route.paramMap.subscribe(params => {  
      userId = +params.get('id')!;  // Convertir el ID a número  
    });  
    console.log("userId en notifications-sse : " + userId);
    return userId || 1; // Devuelve el ID del usuario o un valor por defecto  
  }  
}