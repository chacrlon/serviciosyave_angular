import { Component, OnInit } from '@angular/core';  
import { CommonModule } from '@angular/common';  
import { NotificationsseService } from './notificationsse.service';  
import { Notification } from '../models/Notification';  
import { ActivatedRoute } from '@angular/router';  
import { NotificationModalComponent } from './notification-modal/notification-modal.component';   
import { MatDialog } from '@angular/material/dialog';  

@Component({  
  selector: 'app-notifications-sse',  
  standalone: true,  
  imports: [CommonModule],   
  templateUrl: './notifications-sse.component.html',  
  styleUrls: ['./notifications-sse.component.css']  
})  
export class NotificationsSSEComponent implements OnInit {  

  notifications: Notification[] = [];  
  currentNotification: Notification | null = null; // Para almacenar la notificación actual a mostrar  

  constructor(  
    private dialog: MatDialog,  
    private notificationsService: NotificationsseService,  
    private route: ActivatedRoute  
  ) { }  

  ngOnInit(): void {  
    const userId = this.getUserId();  
    this.fetchNotifications(userId);  
    this.initializeEventSource();  
  }  

  initializeEventSource(): void {  
    const eventSource = new EventSource('http://localhost:8080/notifications');  
    
    eventSource.onmessage = (event) => {  
      const message: string = event.data;  
      const newNotification: Notification = {  
        id: Date.now(),  
        userId: this.getUserId(),  
        message: message,  
        read: false  
      };  
      this.notifications.push(newNotification);  
      this.openNotificationModal(newNotification); // Mostrar el modal con la nueva notificación  
    };  
  }  

  fetchNotifications(userId: number): void {  
    this.notificationsService.getUserNotifications(userId).subscribe(  
      notifications => {  
        this.notifications = notifications;  
        this.showUnreadNotification(); // Mostrar la primera notificación no leída  
      },  
      error => {  
        console.error('Error fetching notifications', error);  
      }  
    );  
  }  

  showUnreadNotification(): void {  
    const unreadNotification = this.notifications.find(notification => !notification.read);  
    if (unreadNotification) {  
      this.openNotificationModal(unreadNotification);  
    }  
  }  

  openNotificationModal(notification: Notification): void {  
    const dialogRef = this.dialog.open(NotificationModalComponent, {  
      data: notification // Pasar la notificación al modal  
    });  

    dialogRef.afterClosed().subscribe(() => {  
      this.markAsRead(notification.id); // Marcar como leída al cerrar el modal  
    });  
  }  

  markAsRead(notificationId: number): void {  
    this.notificationsService.markAsRead(notificationId).subscribe(() => {  
      // Actualizar el estado de la notificación en el frontend  
      const notification = this.notifications.find(n => n.id === notificationId);  
      if (notification) {  
        notification.read = true;  
      }  
    });  
  }  

  getUserId(): number {  
    let userId: number | null = null;  
    this.route.paramMap.subscribe(params => {  
      userId = +params.get('id')!;  
    });  
    console.log("userId en notifications-sse : " + userId);  
    return userId || 1;  
  }  
}