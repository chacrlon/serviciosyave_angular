import { Component, Inject } from '@angular/core';  
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';    
import { Notification } from '../models/Notification';  
import { Router } from '@angular/router';  
import { HttpClient } from '@angular/common/http';

@Component({  
  selector: 'app-notification-modal',  
  standalone: true,  
  templateUrl: './notification-modal.component.html',  
  styleUrls: ['./notification-modal.component.css']  
})  
export class NotificationModalComponent {  

  constructor(  
    public dialogRef: MatDialogRef<NotificationModalComponent>,  
    @Inject(MAT_DIALOG_DATA) public data: Notification,  
    private router: Router ,
    private http: HttpClient  // Inyección de HttpClient 
  ) {  
    console.log('Datos de NotificationModalComponent:', this.data);   
  }  

  onClose(): void {  
    this.dialogRef.close();  
  }  

  contactUser(): void {  
    const receiverId = this.data.userId2;  
    const roomId = [this.data.userId, receiverId].sort().join('-'); // Crear roomId  
    
    // Obtener el correo del usuario usando el receiverId  
    this.http.get<{ email: string }>(`http://localhost:8080/api/users/${receiverId}/email`)  
        .subscribe(  
            userEmailResponse => {  
                console.log("Correo del usuario:", userEmailResponse.email);  

                // Crear el enlace para unirse al chat  
                const chatLink = `http://localhost:4200/chat/${this.data.userId}/${receiverId}`; // Asegúrate de que el puerto sea el correcto  

                const emailRequest = {  
                    toEmail: userEmailResponse.email,  
                    subject: 'Invitación a chat',  
                    text: `Hola, tienes un nuevo mensaje de ${this.data.userId}. Haz clic en el siguiente enlace para unirte al chat: ${chatLink}`  
                };  

                // Validar antes de enviar  
                if (!emailRequest.toEmail || !emailRequest.subject || !emailRequest.text) {  
                    console.error('Los campos toEmail, subject y text son requeridos.');  
                    return;  
                }  

                // Enviar el correo  
                this.http.post('http://localhost:8080/api/email/send', emailRequest)  
                    .subscribe(response => {  
                        console.log('Correo enviado:', response);  
                        this.router.navigate(['/chat', this.data.userId, receiverId]);  
                        this.dialogRef.close();  
                    }, error => {  
                        console.error('Error al enviar el correo:', error);  
                    });  
            },   
            error => {  
                console.error('Error al obtener el correo del usuario:', error);  
            }  
        );  
}

}