import { Injectable } from '@angular/core';  
import { Stomp } from '@stomp/stompjs';  
import SockJS from 'sockjs-client';  
import { ChatMessage } from '../models/chat-message';
import { BehaviorSubject, Observable } from 'rxjs';  

@Injectable({  
  providedIn: 'root'  
})  
export class WebsocketService {  
  private stompClient: any;  
  private messageSubject: BehaviorSubject<ChatMessage[]> = new BehaviorSubject<ChatMessage[]>([]);  
  private notificationsSubject: BehaviorSubject<string> = new BehaviorSubject<string>("");  

  constructor() {  
    this.initConnenctionSocket();  
  }  

  initConnenctionSocket() {  
    const url = '//localhost:8080/chat-socket';  
    const socket = new SockJS(url);  
    this.stompClient = Stomp.over(socket);  

    this.stompClient.connect({}, () => {  
      this.subscribeToNotifications();  
    });  
  }  

  private subscribeToNotifications() {  
    const userId = 1; // Reemplaza con el ID del usuario autenticado  
    this.stompClient.subscribe(`/topic/user-${userId}`, (message: any) => {  
      if (message.body) {  
        console.log('Notificación recibida: ' + message.body);  
        this.notificationsSubject.next(message.body);  
      }  
    });  
  }  

  public getNotifications(): Observable<string> {  
    return this.notificationsSubject.asObservable();  
  }  

  joinRoom(roomId: string) {  
    this.stompClient.connect({}, () => {  
      this.stompClient.subscribe(`/topic/${roomId}`, (messages: any) => {  
        const messageContent = JSON.parse(messages.body);  
        const currentMessage = this.messageSubject.getValue();  
        currentMessage.push(messageContent);  
        this.messageSubject.next(currentMessage);  
      });  
    });  
  }  

  sendMessage(chatMessage: ChatMessage) {  
    this.stompClient.send('/app/chat', {}, JSON.stringify(chatMessage));  
  }  

  getMessageSubject(): Observable<ChatMessage[]> {  
    return this.messageSubject.asObservable();  
  }  
}