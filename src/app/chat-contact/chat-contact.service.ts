import { Injectable } from '@angular/core';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage } from '../models/chat-message';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatContactService {

  private baseUrl: string = "http://localhost:8080/api/";
  private apiUrl = 'http://localhost:8080/api/service'; 
  private notificacionUrl = 'http://localhost:8080/api/notifications'; 
  private userUrl = 'http://localhost:8080/api/users'; 
  private countdownSubject: BehaviorSubject<number> = new BehaviorSubject<number>(5); // Inicializamos con 300 segundos

  private stompClient: any
  private messageSubject: BehaviorSubject<ChatMessage[]> = new BehaviorSubject<ChatMessage[]>([]);
  private isConnected: boolean = false;

  constructor(private http: HttpClient) {}


  initConnenctionSocket(userId: string, receiverId: string) {  
    const url = `http://localhost:8080/chat-socket`;  
    const socket = new SockJS(url);  
    this.stompClient = Stomp.over(socket);
    
    this.stompClient.connect({}, (frame: any) => {  
        console.log('Connected: ' + frame);  
        this.isConnected = true;
        this.joinRoom(userId, receiverId);

        // Aquí puedes manejar la suscripción a la sala de chat  
    }, (error: any) => {  
        console.error('Error de conexión:', error);
    });
}

joinRoom(userId: string, receiverId: string) {  
  if (!this.isConnected) {
    console.error('Error: No conectado aún. Intenta nuevamente más tarde.');
    return;
  }

  let roomId = [userId, receiverId].sort().join('-');
    // Suscribirse al tema de mensajes del roomId
    this.stompClient.subscribe(`/topic/${roomId}`, (message: any) => {  
    let messageContent = JSON.parse(message.body);
        messageContent["sender"]=userId;
        messageContent["receiver"]=receiverId;
    let historicalChat: ChatMessage[] = [...this.messageSubject.getValue(), messageContent];
    this.messageSubject.next(historicalChat);
    
  }, (error: any) => {
    console.error('Error al suscribirse al canal:', error);
  });
}

// ChatService  
updateUserStatusToOccupied(userId2: number) {  
  return this.http.put(`${this.userUrl}/${userId2}/status/ocupado`, {});  
}

updateUserStatusToNoOccupied(userId2: number) {  
  return this.http.put(`${this.userUrl}/${userId2}/status/no-ocupado`, {});  
}

// Métodos para aprobar y rechazar servicios  
approveServiceByProvider(notificationId: number, notificationId2: number) {  
  return this.http.put(`${this.notificacionUrl}/approve/provider/${notificationId}/${notificationId2}`, {});  
}  

approveServiceByClient(notificationId: number, notificationId2: number) {  
  return this.http.put(`${this.notificacionUrl}/approve/client/${notificationId}/${notificationId2}`, {});  
}

rejectServiceByProvider(notificationId: number, notificationId2: number) {  
  return this.http.put(`${this.notificacionUrl}/reject/provider/${notificationId}/${notificationId2}`, {});  
}  

rejectServiceByClient(notificationId: number, notificationId2: number) {  
  return this.http.put(`${this.notificacionUrl}/reject/client/${notificationId}/${notificationId2}`, {});  
}  
sendMessage(roomId: string, chatMessage: ChatMessage) {  
  if (this.stompClient && this.stompClient.connected) {  
    this.stompClient.send(`/app/chat/${roomId}`, {}, JSON.stringify(chatMessage));
  } else {  
      console.error('Error: STOMP client is not connected.');
  }  
}

  sendCountdown(countdown: number) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send('/app/countdown', {}, JSON.stringify({ countdown }));
    } else {
      console.error('Error: STOMP client is not connected.');
    }
  }


    // Obtener el BehaviorSubject del contador
  getCountdownSubject() {
    return this.countdownSubject.asObservable();
  }

  getMessageSubject(){
    return this.messageSubject.asObservable();
  }

  getHistoryChat(payload: string): Observable<any> {  
    return this.http.get(`${this.baseUrl}chat/${payload}`);  
  }
}