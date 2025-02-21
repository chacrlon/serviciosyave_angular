import { Component, inject, OnInit } from '@angular/core';  
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
  vendorServiceId: string = "";  
  messageList: any[] = [];  
  private token = inject(AuthService).token;
  

  constructor(  
    private chatService: ChatService,  
    private route: ActivatedRoute,  
    private authService: AuthService,  
    private router: Router
  ) {}  

  ngOnInit(): void {  
    // Obtener el token de la URL al cargar el componente  
    this.route.queryParams.subscribe(params => {  
      const token = this.token;
      if (token) {  
        this.authService.loginWithToken(token).subscribe({  
          next: response => {
            this.userId = this.authService.userId; // Ajusta según tu modelo de respuesta
            this.receiverId = this.route.snapshot.params["receiverId"];
            this.vendorServiceId = this.route.snapshot.params["vendorServiceId"];  

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


  public claim() {
    let payload: Object = {
      userId: this.userId,
      receiverId: this.receiverId,
      roomId: [this.userId, this.receiverId].sort().join('-'),
      vendorServiceId: this.vendorServiceId
    };

    this.chatService.createClaim(payload).subscribe({
      next: (resp) => {
        this.router.navigate(['claims', resp.id]);
      },
      error: () => { alert("Ha ocurrido un error inesperado")}
  });
    // this.router.navigate(['/login']);

  }
}