import { Component, OnInit } from '@angular/core';  
import { ActivatedRoute } from '@angular/router';  
import { ChatMessage } from '../models/chat-message';  
import { ChatService } from '../chat/chat.service';  
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
  receiverId: string = ""; // Agrega esta propiedad para el ID del receptor  
  messageList: any[] = [];  

  constructor(private chatService: ChatService,  
              private route: ActivatedRoute) { }  

  ngOnInit(): void {  
    this.userId = this.route.snapshot.params["userId"];  
    this.receiverId = this.route.snapshot.params["receiverId"]; // Asegúrate de que esto coincida con tu ruta  
    const roomId = [this.userId, this.receiverId].sort().join('-'); // Genera el Room ID  
    this.chatService.joinRoom(roomId); // Usa el Room ID generado  
    this.listenerMessage();  
    console.log("El userId es : " + this.userId);  
    console.log("El receiverId es : " + this.receiverId); 
    console.log("El roomId es: " + roomId);  
    console.log("El chatService es: " + this.chatService);  
  }  

  sendMessage() {  
    const chatMessage: ChatMessage = {  
        message: this.messageInput,  
        sender: this.userId,  
        receiver: this.receiverId, // Cambia esto por el ID real del receptor  
        user: this.userId // O el ID del usuario que envía el mensaje  
    };  
    
    const roomId = [this.userId, this.receiverId].sort().join('-'); // Genera el Room ID  
    this.chatService.sendMessage(roomId, chatMessage); // Usa el Room ID generado  
    this.messageInput = '';  
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