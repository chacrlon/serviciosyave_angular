import { Component, OnInit } from '@angular/core';  
import { MatDialog } from '@angular/material/dialog';  
import { WebsocketService } from '../services/websocket.service';  
import { NotificationModalComponent } from './notification-modal.component';  
import { CommonModule } from '@angular/common'; // Asegúrate de importar CommonModule  
import { ChatMessage } from '../models/chat-message'; // Asegúrate de importar la interfaz correcta  

@Component({  
  selector: 'app-notifications',  
  standalone: true,  
  imports: [CommonModule],  
  templateUrl: './notifications.component.html',  
  styleUrls: ['./notifications.component.css']  
})   
export class NotificationsComponent implements OnInit {  
  
  notifications: ChatMessage[] = []; // Cambia a ChatMessage  

  constructor(private websocketService: WebsocketService, private dialog: MatDialog) {}  

  ngOnInit(): void {  
    console.log('Componente de Notificaciones inicializado');  
    this.websocketService.getNotifications().subscribe((notification: string) => {  
      const chatMessage: ChatMessage = { message: notification, sender: 'System', receiver: 'User' }; // Reemplaza con datos reales  
      this.notifications.push(chatMessage);  
      this.openNotificationModal(chatMessage); // Pasa el objeto ChatMessage  
    });  
  }   

  openNotificationModal(chatMessage: ChatMessage): void {  
    this.dialog.open(NotificationModalComponent, {  
      data: chatMessage.message // Pasa solo el mensaje al modal  
    });  
  }  
}