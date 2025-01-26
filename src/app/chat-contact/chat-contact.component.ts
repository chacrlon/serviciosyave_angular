import { Component, inject, OnInit } from '@angular/core';  
import { ActivatedRoute, Router } from '@angular/router';  
import { ChatMessage } from '../models/chat-message';  
import { ChatContactService } from '../chat-contact/chat-contact.service';  
import { AuthService } from '../services/auth.service';  
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms';   

@Component({  
  selector: 'app-chat-contact',  
  standalone: true,  
  templateUrl: './chat-contact.component.html',  
  styleUrls: ['./chat-contact.component.css'],  
  imports: [CommonModule, FormsModule]
})
export class ChatContactComponent implements OnInit {  
  
  messageInput: string = '';
  userId: string = "";
  receiverId: string = "";  
  messageList: any[] = [];  

  constructor(  
    private chatService: ChatContactService,  
    private route: ActivatedRoute,
    private authService: AuthService,  
    private router: Router  
  ) {}  

  ngOnInit(): void {  
    // Obtener el token de la URL al cargar el componente  
    // this.userId = this.route.snapshot.params["userId"]; // Ajusta según tu modelo de respuesta
    // this.receiverId = this.route.snapshot.params["receiverId"];    
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      this.userId = params['userId'];
      this.receiverId = params['receiverId'];
      sessionStorage.setItem('token', token);
      console.log("token", token);
      
      if (token) {
        this.authService.loginWithToken(token).subscribe({  
          next: response => {
            this.chatService.initConnenctionSocket(this.userId, this.receiverId);
            this.listenerMessage();
          },
          error: error => {  
            console.error('Error al autenticar con token:', error);  
            // Redirigir o manejar el error según lo necesites  
            this.router.navigate(['/login']); // Ejemplo: redirigir a login  
          }  
        });  
      } else {  
        console.error('No se proporcionó un token');  
        // Manejar caso de no tener token, podrías redirigir a login  
        this.router.navigate(['/login']);  
      }  
    });  
  }  
 

  sendMessage() {  
    if (this.messageInput.trim()) {  
        const chatMessage: ChatMessage = {  
            message: this.messageInput,  
            sender: this.userId,  
            receiver: this.receiverId,  
            user: this.userId
        };  

        const roomId = [this.userId, this.receiverId].sort().join('-');  
        this.chatService.sendMessage(roomId, chatMessage);  
        this.messageInput = '';
    }  
}   

  listenerMessage() {  
    this.chatService.getMessageSubject().subscribe((messages: any) => {
      this.messageList = messages.map((item: any) => ({  
        ...item,
        message_side: item.user == this.userId ? 'sender' : 'receiver'
      }));
    });
  }
}