import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule, JsonPipe } from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';
import {MatDividerModule} from '@angular/material/divider';
import { NotificationsseService } from '../notification-modal/notificationsse.service';
import { BehaviorSubject } from 'rxjs';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Notification } from '../models/Notification';  
import { Router } from '@angular/router';

@Component({
  selector: 'notifications',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatDividerModule, JsonPipe],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {

  public notifications$: BehaviorSubject<any> = new BehaviorSubject([]);
  public countNotification$: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    public notificationsseService: NotificationsseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getNotifications();
  }

  ngAfterViewInit(): void {
    this.notifications$.subscribe(
      (event: Array<any>) => {
        let count = event?.filter((filter: any) => { return filter.read == false }).length;
        this.countNotification$.next(count);
    });

    this.notificationsseService.notifications$.subscribe(
      (event) => {
        let latestNotification: Array<any> = this.notifications$.getValue();
        this.notifications$.next([event, ...latestNotification]);
    });
  }

  private getNotifications(): void {
    this.notificationsseService.getUserNotifications(this.authService.userId).subscribe({
      next: (response: Array<any>) => { response.length > 0 ? this.notifications$.next(response.reverse()) : this.notifications$.next([])},
      error: (err) => {}
    })
  }

  public getDate(fecha: Date = new Date()): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = fecha.toLocaleString('es-ES', { month: 'short' }).toLowerCase();
  
    return `${dia}${mes}`;
  }

  public silenceNotification(): void {
    this.countNotification$.next(0);
  }

  public action(notification: Notification): void {
    this.openNotificationModal(notification)
  }

  public viewAll(): void {
    this.router.navigate(["all-notifications"])
  }

  private openNotificationModal(notification: Notification): void {  

    const dialogRef = this.dialog.open(NotificationModalComponent, {  
        data: notification,
        width: '400px',
        disableClose: true
      });

          dialogRef.afterClosed().subscribe(() => {  
            if (notification.id) {  
              this.markAsRead(notification.id);
            }
          });
  }

  private markAsRead(notificationId: number): void {  
    this.notificationsseService.markAsRead(notificationId).subscribe({  
      next: () => {  
        console.log(`Notificación ${notificationId} marcada como leída`);  
      },
      error: (error: Error) => {  
        console.error(`Error al marcar la notificación ${notificationId} como leída:`, error);  
      }  
    })
  }
}