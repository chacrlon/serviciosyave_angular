// notification-caller.component.ts  
import { Component, OnInit } from '@angular/core';  
import { NotificationService } from '../services/notification.service';  
import { NotificationRealTimeModalComponent } from '../notification-real-time-modal/notification-real-time-modal.component';  
import { CommonModule } from '@angular/common'; // Importa CommonModule  

@Component({  
  selector: 'app-notification-caller',  
  templateUrl: './notification-caller.component.html',  
  styleUrls: ['./notification-caller.component.css'],  
  standalone: true,  
  imports: [CommonModule, NotificationRealTimeModalComponent] // Asegúrate de incluir CommonModule aquí  
})  
export class NotificationCallerComponent implements OnInit {  
  notifications: any[] = [];  
  isModalOpen = false;  

  constructor(private notificationService: NotificationService) {}  

  ngOnInit() {  
    this.notificationService.notifications$.subscribe(notification => {  
      console.log("Notificación recibida en el caller:", notification);  
      this.notifications.push(notification);  
      this.isModalOpen = true;  
    });  
  }  

  closeModal() {  
    this.isModalOpen = false;  
  }  
}