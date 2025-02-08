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
  messageList: any[] = []; 
  userType: string = ""; // Agregamos una variable para almacenar el userType 
  isNegotiationEnabled: boolean = false; // Nueva variable para manejar el estado de la negociación  
  vendorServiceId: number | null = null; // Agrega esta propiedad para almacenar el ID del servicio 
  isServiceApprovedByProvider: boolean = false;

  private token = inject(AuthService).token;

  constructor(  
    private chatService: ChatService,  
    private route: ActivatedRoute,  
    private authService: AuthService,  
    private router: Router  
  ) {}   

handleUserType(type: string): void {  
  console.log(`Botón clickeado: ${type}`);   
  
  // Invertimos la lógica según el tipo de usuario  
  if (type === 'Buyer') {  
      this.isNegotiationEnabled = true; // Habilita la negociación desde el Buyer  
      this.sendNegotiationEnabledMessage(); // Envío de mensaje al Buyer  
  }  

  const chatMessage: ChatMessage = {  
      message: `Es HORA de realizar el SERVICIO!`, // Mensaje de ejemplo  
      sender: this.userId,  
      receiver: this.receiverId,  
      user: this.userId  
  };  
  
  const roomId = [this.userId, this.receiverId].sort().join('-');  
  this.chatService.sendMessage(roomId, chatMessage);  
}  

approveServiceByProvider() {  
  if (this.vendorServiceId === null) {  
      console.error("Error: vendorServiceId no puede ser nulo.");  
      return;  
  }  

  this.chatService.approveServiceByProvider(this.vendorServiceId).subscribe({  
      next: (response) => {  
          console.log("Servicio aprobado por el proveedor:", response);  
          this.isServiceApprovedByProvider = true; // Actualiza la variable para mostrar el botón  

          // Enviar un mensaje al otro usuario  
          const roomId = [this.userId, this.receiverId].sort().join('-');  
          const approvalMessage: ChatMessage = {  
              message: 'El servicio ha sido aprobado por el proveedor', // Mensaje indicando aprobación  
              sender: this.userId,  
              receiver: this.receiverId,  
              user: this.userId  
          };  
          this.chatService.sendMessage(roomId, approvalMessage); // Notificar al otro usuario  
      },  
      error: (error) => {  
          console.error("Error al aprobar el servicio por el proveedor:", error);  
      }  
  });  
}
  
approveServiceByClient() {  
  if (this.vendorServiceId === null) {  
    console.error("Error: vendorServiceId no puede ser nulo.");  
    return; // Salir si no hay un ID válido  
  }  

  this.chatService.approveServiceByClient(this.vendorServiceId).subscribe({  
    next: (response) => {  
      console.log("Servicio aprobado por el cliente:", response);  
    },  
    error: (error) => {  
      console.error("Error al aprobar el servicio por el cliente:", error);  
    }  
  });  
}  


  ngOnInit(): void {  
    // Obtener el token de la URL al cargar el componente  
    this.route.queryParams.subscribe(params => { 
      this.userType = params['userType']; // Capturamos userType de los query params
      console.log('Tipo de usuario:', this.userType); 
      this.vendorServiceId = +params['vendorServiceId']; // Convertir a número  
      console.log('ID del servicio:', this.vendorServiceId); 
      const token = this.token;
      if (token) {  
        this.authService.loginWithToken(token).subscribe({  
          next: response => {
            this.userId = this.authService.userId; // Ajusta según tu modelo de respuesta
            this.receiverId = this.route.snapshot.params["receiverId"];    
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

sendNegotiationEnabledMessage(): void {  
  const roomId = [this.userId, this.receiverId].sort().join('-');   
  const negotiationMessage: ChatMessage = {  
      message: 'Negociación habilitada', // Mensaje indicando que la negociación está habilitada  
      sender: this.userId,  
      receiver: this.receiverId,  
      user: this.userId  
  };  
  this.chatService.sendMessage(roomId, negotiationMessage);  
} 

listenerMessage() {  
  this.chatService.getMessageSubject().subscribe((messages: any) => {  
      this.messageList = messages.map((item: any) => ({  
          ...item,  
          message_side: item.user == this.userId ? 'sender' : 'receiver'  
      }));  
      
      // Escuchar los mensajes de aprobación del servicio  
      const approvalMessage = messages.find((msg: any) => msg.message === 'El servicio ha sido aprobado por el proveedor');  
      if (approvalMessage && approvalMessage.user !== this.userId) {  
          // Solo actualiza si el mensaje no es del propio usuario  
          this.isServiceApprovedByProvider = true; // Esto habilita el botón "Ya recibí el servicio" para el Buyer  
      }  

      // Escuchar los mensajes de negociación habilitada  
      const negotiationMessage = messages.find((msg: any) => msg.message === 'Negociación habilitada');  
      if (negotiationMessage && negotiationMessage.user !== this.userId) {   
          this.isNegotiationEnabled = true; // Habilita la negociación para ambos  
      }  
  });  
}

confirmAction(action: string) {  
  const confirmation = confirm('¿Estás seguro de realizar esta acción?');  
  if (confirmation) {  
      switch (action) {  
          case 'enableNegotiation':  
              this.handleUserType('Buyer');  
              break;  
          case 'cancelNegotiation':  
              this.handleUserType('Seller');  
              break;  
          case 'approveServiceByProvider':  
              this.approveServiceByProvider(); // Ajustado para el Seller  
              break;  
          case 'approveServiceByClient':  
              this.approveServiceByClient(); // Ajustado para el Buyer  
              break;  
          default:  
              break;  
      }   
  }  
}
}