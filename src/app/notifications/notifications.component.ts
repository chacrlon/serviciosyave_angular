import { Component, OnInit } from '@angular/core';  
import { MatDialog } from '@angular/material/dialog';  
import { WebsocketService } from '../services/websocket.service';  
import { NotificationModalComponent } from './notification-modal.component';  

@Component({  
  selector: 'app-notifications',  
  templateUrl: './notifications.component.html',  
  styleUrls: ['./notifications.component.css']  
})  
export class NotificationsComponent implements OnInit {  
  notifications: string[] = [];  

  constructor(private websocketService: WebsocketService, private dialog: MatDialog) {}  

  ngOnInit(): void {  
    this.websocketService.getNotifications().subscribe((notification: string) => {  
      this.notifications.push(notification);  
      this.openNotificationModal(notification);  
    });  
  }  

  openNotificationModal(notification: string): void {  
    this.dialog.open(NotificationModalComponent, {  
      data: notification  
    });  
  }  
}