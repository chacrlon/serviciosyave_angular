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
  userType: string = "";
  isNegotiationEnabled: boolean = false;
  notificationId: number | null = null; 
  vendorServiceId: number | null = null;
  isServiceApprovedByProvider: boolean = false;

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
      this.userType = params['userType']; // Capturamos userType de los query params
      console.log('Tipo de usuario:', this.userType); 
      this.vendorServiceId = +params['vendorServiceId']; // Convertir a número  
      console.log('ID del servicio:', this.vendorServiceId); 
      // Este es el cambio importante:   
    this.notificationId = +params['notificationId']; // Asegúrate de asignar el valor a this.notificationId  
    console.log('ID de la notificación:', this.notificationId); // Para depuración  
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
    if (this.notificationId === null) {  
        console.error("Error: notificationId no puede ser nulo.");  
        return;  
    }  
  
    this.chatService.approveServiceByProvider(this.notificationId).subscribe({  
        next: (response) => {  
            console.log("Servicio aprobado por el proveedor:", response);  
            this.isServiceApprovedByProvider = true;  
  
            // Enviar un mensaje al otro usuario  
            const roomId = [this.userId, this.receiverId].sort().join('-');  
            const approvalMessage: ChatMessage = {  
                message: 'El servicio ha sido aprobado por el proveedor',  
                sender: this.userId,  
                receiver: this.receiverId,  
                user: this.userId  
            };  
            this.chatService.sendMessage(roomId, approvalMessage);  
        },  
        error: (error) => {  
            console.error("Error al aprobar el servicio por el proveedor:", error);  
        }  
    });  
  }  
  
  rejectServiceByProvider() {  
    if (this.notificationId === null) {  
        console.error("Error: vendorServiceId no puede ser nulo.");  
        return;  
    }  
  
    this.chatService.rejectServiceByProvider(this.notificationId).subscribe({  
        next: (response) => {  
            console.log("Servicio rechazado por el proveedor:", response);  
            const roomId = [this.userId, this.receiverId].sort().join('-');  
            const rejectionMessage: ChatMessage = {  
                message: 'El servicio ha sido rechazado por el proveedor',  
                sender: this.userId,  
                receiver: this.receiverId,  
                user: this.userId  
            };  
            this.chatService.sendMessage(roomId, rejectionMessage);  
        },  
        error: (error) => {  
            console.error("Error al rechazar el servicio por el proveedor:", error);  
        }  
    });  
  }  
    
  approveServiceByClient() {  
    if (this.notificationId === null) {  
      console.error("Error: vendorServiceId no puede ser nulo.");  
      return;
    }  
  
    this.chatService.approveServiceByClient(this.notificationId).subscribe({  
      next: (response) => {  
        console.log("Servicio aprobado por el cliente:", response);  
      },  
      error: (error) => {  
        console.error("Error al aprobar el servicio por el cliente:", error);  
      }  
    });  
  }  
  
  rejectServiceByClient() {  
    if (this.notificationId === null) {  
        console.error("Error: vendorServiceId no puede ser nulo.");  
        return;  
    }  
  
    this.chatService.rejectServiceByClient(this.notificationId).subscribe({  
        next: (response) => {  
            console.log("Servicio rechazado por el cliente:", response);  
            const roomId = [this.userId, this.receiverId].sort().join('-');  
            const rejectionMessage: ChatMessage = {  
                message: 'El servicio ha sido rechazado por el cliente',  
                sender: this.userId,  
                receiver: this.receiverId,  
                user: this.userId  
            };  
            this.chatService.sendMessage(roomId, rejectionMessage);  
        },  
        error: (error) => {  
            console.error("Error al rechazar el servicio por el cliente:", error);  
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

// Método para escuchar mensajes  
listenerMessage() {  
  this.chatService.getMessageSubject().subscribe((messages: any) => {  
      this.messageList = messages.map((item: any) => ({  
          ...item,  
          message_side: item.user == this.userId ? 'sender' : 'receiver'  
      }));  

      // Controlar mensajes de aprobación y rechazo  
      const approvalMessage = messages.find((msg: any) => msg.message === 'El servicio ha sido aprobado por el proveedor');  
      if (approvalMessage && approvalMessage.user !== this.userId) {  
          this.isServiceApprovedByProvider = true;  
      }

      // Escuchar los mensajes de negociación habilitada  
      const negotiationMessage = messages.find((msg: any) => msg.message === 'Negociación habilitada');  
      if (negotiationMessage && negotiationMessage.user !== this.userId) {   
         this.isNegotiationEnabled = true; // Habilita la negociación para ambos  
      } 

      const rejectionMessageProvider = messages.find((msg: any) => msg.message === 'El servicio ha sido rechazado por el proveedor');  
      const rejectionMessageClient = messages.find((msg: any) => msg.message === 'El servicio ha sido rechazado por el cliente');  

      if (rejectionMessageProvider && rejectionMessageProvider.user !== this.userId) {  
          console.log("El proveedor ha rechazado el servicio.");  
          // Manejar otras acciones aquí si es necesario (e.g., actualizar UI)  
      }  

      if (rejectionMessageClient && rejectionMessageClient.user !== this.userId) {  
          console.log("El cliente ha rechazado el servicio.");  
          // Manejar otras acciones aquí si es necesario (e.g., actualizar UI)  
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
          case 'cancelNegotiationByProvider':  
              this.rejectServiceByProvider();  
              break; 
          case 'cancelNegotiationByClient':  
              this.rejectServiceByClient();  
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