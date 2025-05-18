import { Component, Inject } from '@angular/core';  
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';    
import { Notification } from '../models/Notification';  
import { Router } from '@angular/router';  
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NotificationsseService } from './notificationsse.service';
import { MatDialog } from '@angular/material/dialog';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';

@Component({  
  selector: 'app-notification-modal',  
  standalone: true,  
  templateUrl: './notification-modal.component.html',  
  styleUrls: ['./notification-modal.component.css'],
  imports: [CommonModule]
})  
export class NotificationModalComponent {  

  constructor(  
    public dialogRef: MatDialogRef<NotificationModalComponent>,  
    @Inject(MAT_DIALOG_DATA) public data: Notification,  
    private router: Router ,
    private http: HttpClient,
    private notificationSseService: NotificationsseService,
    private dialog: MatDialog
  ) {  
    console.log('Datos de NotificationModalComponent:', this.data);  
    console.log('Tipo de usuario:', this.data.userType);
    console.log('Id del servicio:', this.data.vendorServiceId);   
  }  

  onClose(): void {  
    this.dialogRef.close();  
  }  

  contactUser(): void {  
        // Verificar estado de pago antes de continuar
  if (this.data.status === 'no_pagado') {
    this.openPaymentModal();
    return;
  }
     else if (this.data.status === 'pendiente') {
      alert('Espere mientras se procesa su pago. Le notificaremos cuando esté completado.');
      this.dialogRef.close();
      return;
    }  

    const receiverId = this.data.userId2;  
    const roomId = [this.data.userId, receiverId].sort().join('-'); // Crear roomId  

    // Obtener el correo del usuario usando el receiverId  
    this.http.get<{ email: string }>(`http://localhost:8080/api/users/${receiverId}/email`)  
        .subscribe(  
            userEmailResponse => {  
                console.log("Correo del usuario:", userEmailResponse.email);  

                // Crear el enlace para unirse al chat  
                const chatLink = `http://localhost:4200/chat/${this.data.userId}/${receiverId}`;  

                const emailRequest = {  
                    toEmail: userEmailResponse.email,  
                    subject: 'Invitación a chat',  
                    text: `Hola, tienes un nuevo mensaje de ${this.data.userId}. Haz clic en el siguiente enlace para unirte al chat: ${chatLink}`,  
                    userType: this.data.userType,
                    vendorServiceId: this.data.vendorServiceId, // Incluir userType  
                    ineedId: this.data.ineedId
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
                        this.router.navigate(['chat', this.data.userId, receiverId, this.data.vendorServiceId || 0, this.data.ineedId || 0], 
                          { queryParams: 
                            { userType: this.data.userType, 
                              vendorServiceId: this.data.vendorServiceId,
                              notificationId: this.data.id,
                              notificationId2: this.data.id2,
                              userId2: this.data.userId2,
                              ineedId: this.data.ineedId
                            } });  
                        this.dialogRef.close();  
                    }, error => {  
                        console.error('Error al enviar el correo:', error);  
                    });  
            },   
            error => {  
                console.error('Error al obtener el correo del usuario:', error);  
            }  
        );

        this.notificationSseService.markAsRead(this.data.id!).subscribe({
          next: (response) => {  
            console.log('Notificación marcada como leída:', response);  
          },
          error: (error) => {
            console.error('Error al marcar la notificación como leída:', error);  
          }
        });
}


private openPaymentModal(): void {
  const dialogRef = this.dialog.open(PaymentModalComponent, {
    width: '600px',
    data: {
      precio: this.data.amount,
      ineedId: this.data.ineedId,
      userId: this.data.userId,
      userId2: this.data.userId2
    }
  });

  dialogRef.afterClosed().subscribe((paymentSuccess: boolean) => {
    if (paymentSuccess) {
      // Actualizar estado de la notificación o recargar datos
      alert('Pago procesado correctamente. Ahora puedes contactar al usuario.');
      this.data.status = 'pendiente'; // Actualizar estado localmente
    }
  });
}

public extractingUrl(message: string): string {
  const pattern = /http:\/\/localhost:4200\/claims\/\d+$/;
  const result = message.match(pattern);
  if (result) {
    return result[0];
  } else {
    return "";
  }
}
}