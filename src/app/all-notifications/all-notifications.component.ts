import { Component, OnInit, Inject } from '@angular/core';   
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';    
import { Notification } from '../models/Notification';  
import { NotificationsseService } from '../notification-modal/notificationsse.service';   
import { BehaviorSubject } from 'rxjs';  
import { CommonModule } from '@angular/common';  
import { AuthService } from '../services/auth.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';

@Component({  
  selector: 'app-all-notifications',  
  standalone: true,
  templateUrl: './all-notifications.component.html',  
  styleUrls: ['./all-notifications.component.css'],  
  imports: [CommonModule, MatDividerModule, MatMenuModule]
})
export class AllNotificationsComponent implements OnInit {

  public notifications$: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>([]);
  public previewNotification: string = 'initial';
  public chatUrl: SafeResourceUrl | undefined = undefined;
  public urlChat: string = "";
  public dataPreview: string = "";

  constructor(
    private authService: AuthService,
    private notificationsseService: NotificationsseService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog
  ) {}  

  ngOnInit(): void {
    this.chatUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlChat);
    this.getNotifications();
  }

  private getNotifications(): void {
    this.notificationsseService.getUserNotifications(this.authService.userId).subscribe({
      next: (response: Notification[]) => { 
        this.notifications$.next(response.length > 0 ? [...response.reverse()] : []);
      },
      error: (err) => console.error(err)
    });
  }

  public action(notification: Notification): void {
      console.log("[Todas] Notificación seleccionada222:", notification);
  
  if (notification.type === "chat") {
    console.log("[Todas] Parámetros de chat222 :", {
      paymentId: notification.paymentId,
      vendorServiceId: notification.vendorServiceId,
      ineedId: notification.ineedId
    });
  }

    switch (this.getTypeNotification(notification.message)) {
      case "chat":
        // 1. Verificar estado de pago (igual que en modal)
        if (notification.status === 'no_pagado') {
          this.openPaymentModal(notification);
          return;
        } else if (notification.status === 'pendiente') {
          alert('Espere mientras se procesa su pago. Le notificaremos cuando esté completado.');
          return;
        }

        // 2. Replicar exactamente el proceso de contactUser()
        const receiverId = notification.userId2;  
        const baseRoomId = [notification.userId, receiverId].sort().join('-');
        const roomId = notification.paymentId ? `${baseRoomId}-${notification.paymentId}` : baseRoomId;

        // 3. Obtener email del usuario
        this.http.get<{ email: string }>(`http://localhost:8080/api/users/${receiverId}/email`).subscribe(
          userEmailResponse => {
            // 4. Construir enlace de chat (IDÉNTICO al modal)
            const chatLink = `http://localhost:4200/chat/${notification.userId}/${receiverId}`;
            
            // 5. Crear emailRequest (IDÉNTICO al modal)
            const emailRequest = {
              toEmail: userEmailResponse.email,
              subject: 'Invitación a chat',
              text: `Hola, tienes un nuevo mensaje de ${notification.userId}. Haz clic en el siguiente enlace para unirte al chat: ${chatLink}`,
              userType: notification.userType,
              vendorServiceId: notification.vendorServiceId,
              ineedId: notification.ineedId,
              paymentId: notification.paymentId
            };

            // 6. Validación (IDÉNTICA al modal)
            if (!emailRequest.toEmail || !emailRequest.subject || !emailRequest.text || 
                !emailRequest.userType || (!emailRequest.vendorServiceId && !emailRequest.ineedId)) {
              console.error('Los campos toEmail, subject, text y userType son requeridos.');
              return;
            }

            // 7. Enviar correo (IDÉNTICO al modal)
            
      this.http.post('http://localhost:8080/api/email/send', emailRequest).subscribe(
        response => {  
          console.log('Correo enviado:', response);  
          
          // CORRECCIÓN: Usar notification en lugar de this.data
          this.router.navigate(['chat', notification.userId, receiverId, notification.vendorServiceId || 0, notification.ineedId || 0], 
            { queryParams: 
              { 
                userType: notification.userType, 
                vendorServiceId: notification.vendorServiceId,
                notificationId: notification.id,
                notificationId2: notification.id2, // Asegurar que existe
                userId2: notification.userId2,
                ineedId: notification.ineedId,
                paymentId: notification.paymentId // Ahora se incluirá
              } 
            }
          );
          
        }, error => {  
          console.error('Error al enviar el correo:', error);  
        }
      );
          },
          error => console.error('Error al obtener el correo del usuario:', error)
        );

        // 9. Marcar como leído (IDÉNTICO al modal)
        this.notificationsseService.markAsRead(notification.id!).subscribe({
          next: (response) => console.log('Notificación marcada como leída:', response),
          error: (error) => console.error('Error al marcar la notificación como leída:', error)
        });
        break;
        
      case "information":
        this.previewNotification = "information";
        this.dataPreview = notification.message;
        break;
        
      default:
        this.previewNotification = "initial";
        break;
    }
  }

  // 10. Implementar openPaymentModal (IDÉNTICO al modal)
  private openPaymentModal(notification: Notification): void {
    const dialogRef = this.dialog.open(PaymentModalComponent, {
      width: '600px',
      data: {
        precio: notification.amount,
        ineedId: notification.ineedId,
        userId: notification.userId,
        userId2: notification.userId2
      }
    });

    dialogRef.afterClosed().subscribe((paymentSuccess: boolean) => {
      if (paymentSuccess) {
        alert('Pago procesado correctamente. Ahora puedes contactar al usuario.');
        notification.status = 'pendiente';
      }
    });
  }

  private getTypeNotification(message: string): string {
    if (message.includes("disputa")) return "information";
    if (message.includes("Has comprado el servicio")) return "chat";
    if (message.includes("ha comprado tu servicio")) return "chat";
    if (message.includes("Tienes un nuevo mensaje")) return "chat";
    return "initial";
  }

  public extractingUrl(message: string): string {
    const pattern = /http:\/\/localhost:4200\/claims\/\d+$/;
    const result = message.match(pattern);
    return result ? result[0] : "";
  }

  public cleanMessage(message: string, phrase: string) {
    const expresionRegular = new RegExp("\\b" + phrase + "\\b", "gi");
    return message.replace(expresionRegular, "");
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
    // Si es menos de un minuto, podrías retornar algo como "ahora" o "hace un momento"
    return 'ahora';
  }
  }
}