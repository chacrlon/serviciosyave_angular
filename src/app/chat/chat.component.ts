import { Component, OnInit } from '@angular/core';  
import { ActivatedRoute, Router } from '@angular/router';  
import { ChatMessage } from '../models/chat-message';  
import { ChatService } from '../chat/chat.service';  
import { AuthService } from '../services/auth.service';  
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms';   

@Component({  
  selector: 'app-chat',  
  standalone: true,  
  imports: [CommonModule, FormsModule],  
  templateUrl: './chat.component.html',  
  styleUrls: ['./chat.component.css']  
})  
export class ChatComponent implements OnInit {  
  
  messageInput: string = '';  
  userId: string = "";  
  receiverId: string = "";  
  messageList: any[] = [];  

  constructor(  
    private chatService: ChatService,  
    private route: ActivatedRoute,  
    private authService: AuthService,  
    private router: Router  
  ) {}  

  ngOnInit(): void {  
    // Obtener el token de la URL al cargar el componente  
    this.route.queryParams.subscribe(params => {  
      const token = params['token'];  
      if (token) {  
        this.authService.loginWithToken(token).subscribe({  
          next: response => {  
            console.log('Usuario autenticado:', response);  
            // Aquí puedes establecer el usuario autenticado si es necesario  
            // Por ejemplo, almacena el userId desde la respuesta  
            this.userId = response.userId; // Ajusta según tu modelo de respuesta  
            this.initializeChat(); // Llamar a la inicialización del chat después de autenticarse  
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

  initializeChat() {  
    this.receiverId = this.route.snapshot.params["receiverId"];  
    const roomId = [this.userId, this.receiverId].sort().join('-');  
    this.chatService.joinRoom(roomId);  
    this.listenerMessage();  
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
        message_side: item.user === this.userId ? 'sender' : 'receiver'  
      }));  
    });  
  }  
}