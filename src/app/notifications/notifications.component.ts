import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  unreadCount = 0;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Lógica para obtener notificaciones
    // this.authService.getNotifications().subscribe(...)
  }

  markAsRead(notification: any) {
    // Lógica para marcar como leído
  }
}