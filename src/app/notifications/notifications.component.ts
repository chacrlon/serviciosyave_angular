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
  public messages$: BehaviorSubject<any> = new BehaviorSubject([]);

  public countNotification$: BehaviorSubject<number> = new BehaviorSubject(0);
  public countMessages$: BehaviorSubject<number> = new BehaviorSubject(0);

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
      let count = event?.filter((filter: any) => filter.read == false && !filter.message.includes("Tienes un nuevo mensaje")).length;
      this.countNotification$.next(count);

      let countMessage = event?.filter((filter: any) => filter.read == false && filter.message.includes("Tienes un nuevo mensaje")).length;
      this.countMessages$.next(countMessage);
      });

      this.messages$.subscribe(
        (event: Array<any>) => {
        let countMessage = event?.filter((filter: any) => filter.read == false && filter.message.includes("Tienes un nuevo mensaje")).length;
        this.countMessages$.next(countMessage);
        });
    
      this.notificationsseService.notifications$.subscribe(
        (event) => {          
        let filteredNotifications = event.read == false && !event.message.includes("Tienes un nuevo mensaje") ? event : null;
        
        let latestNotification: Array<any> = this.notifications$.getValue();
        filteredNotifications ? this.notifications$.next([filteredNotifications, ...latestNotification]) : null;
        
        let filteredMessages = event.read == false && event.message.includes("Tienes un nuevo mensaje") ? event : null;

        let latestMessages: Array<any> = this.messages$.getValue();
        filteredMessages ? this.messages$.next([filteredMessages, ...latestMessages]) : null;
    });
  }

  private getNotifications(): void {
    this.notificationsseService.getUserNotifications(this.authService.userId).subscribe({
      next: (response: Array<any>) => { 
        const filteredResponse = response.filter((notification: any) => 
          !notification.message.includes("Tienes un nuevo mensaje")
        );

        const filteredMessages = response.filter((notification: any) => 
          notification.message.includes("Tienes un nuevo mensaje")
        );

        filteredResponse.length > 0 ? this.notifications$.next(filteredResponse.reverse()) : this.notifications$.next([]);
        filteredMessages.length > 0 ? this.messages$.next(filteredMessages.reverse()) : this.messages$.next([]);
      
      },
      error: (err) => {}
    })
  }

  public getDate(fecha: Date = new Date()): string {
    const date = new Date(fecha);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  public silenceNotification(): void {
    this.countNotification$.next(0);
  }

  public silenceMessages(): void {
    this.countMessages$.next(0);
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