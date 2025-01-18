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