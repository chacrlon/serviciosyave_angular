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
import { HttpClient } from '@angular/common/http';

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

  private userId: number = this.authService.userId;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    public notificationsseService: NotificationsseService,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.getNotifications();
  }

  ngAfterViewInit(): void {
    this.notifications$.subscribe(
      (event: Array<any>) => {      
        
      let count = event?.filter((filter: any) => filter.read == false && filter.userId == this.userId && !filter.message.includes("Tienes un nuevo mensaje")).length;
      this.countNotification$.next(count);

      let countMessage = event?.filter((filter: any) => filter.read == false && filter.userId == this.userId && filter.message.includes("Tienes un nuevo mensaje")).length;
      this.countMessages$.next(countMessage);
      });

      this.messages$.subscribe(
        (event: Array<any>) => {
        let countMessage = event?.filter((filter: any) => filter.read == false && filter.userId == this.userId && filter.message.includes("Tienes un nuevo mensaje")).length;
        this.countMessages$.next(countMessage);
        });
    
      this.notificationsseService.notifications$.subscribe(
        (event) => {
          this.getNotifications();  
        let filteredNotifications = event.read == false && !event.message.includes("Tienes un nuevo mensaje") ? event : null;
        
        let latestNotification: Array<any> = this.notifications$.getValue();
        filteredNotifications ? this.notifications$.next([filteredNotifications, ...latestNotification]) : null;
        
        let filteredMessages = event.read == false && event.userId == this.userId && event.message.includes("Tienes un nuevo mensaje") ? event : null;

        let latestMessages: Array<any> = (this.messages$.getValue() as Array<any>).filter(f => f.id != event.id);
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
  const now = new Date();
  const past = new Date(fecha);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30.44); // Aproximación
  const diffInYears = now.getFullYear() - past.getFullYear();

  if (diffInMinutes < 60 && diffInMinutes >= 1) {
    return `${diffInMinutes}min`;
  } else if (diffInHours < 24 && diffInHours >= 1) {
    return `${diffInHours}h`;
  } else if (diffInDays < 30 && diffInDays >= 1) {
    return `${diffInDays}d`;
  } else if (diffInMonths < 12 && diffInMonths >= 1) {
    return `${diffInMonths}mes`;
  } else if (diffInYears >= 1) {
    const day = past.getDate().toString().padStart(2, '0');
    const month = (past.getMonth() + 1).toString().padStart(2, '0');
    const year = past.getFullYear();
    return `${day}/${month}/${year}`;
  } else {
    return 'ahora';
  }
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

  contactUser(notification: any): void {  

    if (notification.status === 'no_pagado') {
        const tipo = notification.type === 'servicio' ? 'servicio' : 'requerimiento';
        alert(`Este ${tipo} no ha sido pagado. No puedes contactar al usuario hasta que se complete el pago.`);
        return;
    } else if (notification.status === 'pendiente') {
        alert('Espere mientras se procesa su pago. Le notificaremos cuando esté completado.');
        return;
    }
    const receiverId = notification.userId2;  
    const roomId = [notification.userId, receiverId].sort().join('-'); // Crear roomId   
    // Obtener el correo del usuario usando el receiverId  
    this.http.get<{ email: string }>(`http://localhost:8080/api/users/${receiverId}/email`)  
        .subscribe(  
            userEmailResponse => {  
                console.log("Correo del usuario:", userEmailResponse.email);  

                // Crear el enlace para unirse al chat  
                const chatLink = `http://localhost:4200/chat/${notification.userId}/${receiverId}`;  

                const emailRequest = {  
                    toEmail: userEmailResponse.email,  
                    subject: 'Invitación a chat',  
                    text: `Hola, tienes un nuevo mensaje de ${notification.userId}. Haz clic en el siguiente enlace para unirte al chat: ${chatLink}`,  
                    userType: notification.userType,
                    vendorServiceId: notification.vendorServiceId, // Incluir userType  
                    ineedId: notification.ineedId
                };

                // Validar antes de enviar  
                if (!emailRequest.toEmail || !emailRequest.subject || !emailRequest.text || !emailRequest.userType || (!emailRequest.vendorServiceId && !emailRequest.ineedId)) {  
                    console.error('Los campos toEmail, subject, text y userType son requeridos.');  
                    return;  
                }  

                // Enviar el correo  
                this.http.post('http://localhost:8080/api/email/send', emailRequest)  
                    .subscribe(response => {  
                        console.log('Correo enviado:', response);  
                        // Navegar al chat y pasar userType como parámetro de consulta  
                        this.router.navigate(['chat', notification.userId, receiverId, notification.vendorServiceId || 0, notification.ineedId || 0], 
                          { queryParams: 
                            { userType: notification.userType,
                              vendorServiceId: notification.vendorServiceId,
                              notificationId: notification.id,
                              notificationId2: notification.id2,
                              userId2: notification.userId2,
                              ineedId: notification.ineedId
                            } });  
                        // this.dialogRef.close();  
                    }, error => {  
                        console.error('Error al enviar el correo:', error);  
                    });  
            },   
            error => {  
                console.error('Error al obtener el correo del usuario:', error);  
            }  
        );

        this.notificationsseService.markAsRead(notification.id!).subscribe({
          next: (response) => {  
            console.log('Notificación marcada como leída:', response);  
          },
          error: (error) => {
            console.error('Error al marcar la notificación como leída:', error);  
          }
        });
}
}