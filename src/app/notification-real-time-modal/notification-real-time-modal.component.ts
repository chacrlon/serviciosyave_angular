// notification-real-time-modal.component.ts  
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';  
import { NotificationService } from '../services/notification.service';   
import { CommonModule } from '@angular/common';  

@Component({  
  selector: 'app-notification-real-time-modal',  
  standalone: true,  
  imports: [CommonModule],  
  templateUrl: './notification-real-time-modal.component.html',  
  styleUrls: ['./notification-real-time-modal.component.css']  
})  
export class NotificationRealTimeModalComponent implements OnInit {  
  @Input() notifications: any[] = [];  // Acepta las notificaciones como entrada  
  @Output() close = new EventEmitter<void>(); // Emite un evento al cerrarse  
  isOpen = true;  // Abre el modal por defecto  

  constructor(private notificationService: NotificationService) {}  

  ngOnInit() {  
    console.log("Modal inicializado con notificaciones:", this.notifications); // Log de las notificaciones iniciales  
  }

  closeModal() {  
    this.isOpen = false;  
    this.close.emit(); // Emite el evento de cierre  
  }  
}