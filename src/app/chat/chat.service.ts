import { Injectable } from '@angular/core';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage } from '../models/chat-message';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: any
  private messageSubject: BehaviorSubject<ChatMessage[]> = new BehaviorSubject<ChatMessage[]>([]);

  constructor() { 
    this.initConnenctionSocket();
  }

  initConnenctionSocket() {  
    const url = 'http://localhost:8080/chat-socket';  
    const socket = new SockJS(url);  
    this.stompClient = Stomp.over(socket);  
    
    this.stompClient.connect({}, (frame: any) => {  
        console.log('Connected: ' + frame);  
        // Aquí puedes manejar la suscripción a la sala de chat  
    }, (error: any) => {  
        console.error('Error de conexión:', error);  
    });  
}

  joinRoom(roomId: string) {
    this.stompClient.connect({}, ()=>{
      this.stompClient.subscribe(`/topic/${roomId}`, (messages: any) => {
        const messageContent = JSON.parse(messages.body);
        const currentMessage = this.messageSubject.getValue();
        currentMessage.push(messageContent);

        this.messageSubject.next(currentMessage);

      })
    })
  }

  sendMessage(roomId: string, chatMessage: ChatMessage) {
    this.stompClient.send(`/app/chat/${roomId}`, {}, JSON.stringify(chatMessage))
  }

  getMessageSubject(){
    return this.messageSubject.asObservable();
  }
}
