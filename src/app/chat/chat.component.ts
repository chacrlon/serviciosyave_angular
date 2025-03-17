import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';  
import { ActivatedRoute, Router } from '@angular/router';  
import { ChatMessage } from '../models/chat-message';  
import { ChatService } from '../chat/chat.service';  
import { AuthService } from '../services/auth.service';  
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms';   
import { ClaimService } from '../services/claim.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogValorateServiceComponent } from '../components/dialog-valorate-service/dialog-valorate-service.component';

@Component({  
  selector: 'app-chat',  
  standalone: true,  
  imports: [CommonModule, FormsModule],  
  templateUrl: './chat.component.html',  
  styleUrls: ['./chat.component.css']  
})  
export class ChatComponent implements OnInit {  
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  messageInput: string = '';  
  userId: string = "";  
  receiverId: string = "";  
  messageList: any[] = []; 
  userType: string = "";
  countdown: number = 300; // 5 minutos en segundos  
  intervalId: any; // Para almacenar el ID del interval  

  isNegotiationEnabled: boolean = false;
  notificationId: number | null = null; 
  notificationId2: number | null = null; 
  vendorServiceId: number | null = null;
  ineedId: number | null = null;
  userId2: number | null = null;
  isServiceApprovedByProvider: boolean = false;

  negotiationEnabled: boolean = false;  
  negotiationCancelledByProvider: boolean = false;  
  negotiationCancelledByClient: boolean = false;  
  serviceApprovedByProvider: boolean = false;  
  serviceApprovedByClient: boolean = false;  
  serviceConfirmed: boolean = false;
  private token = inject(AuthService).token;

  constructor(  
    private chatService: ChatService,  
    private route: ActivatedRoute,  
    private authService: AuthService,  
    private router: Router,
    private claimService: ClaimService,
    private dialog: MatDialog
  ) {}   

  ngOnInit(): void {  
    // Obtener el token de la URL al cargar el componente  
    this.route.queryParams.subscribe(params => { 
      this.userType = params['userType']; 
      console.log('Tipo de usuario:', this.userType); 
      this.vendorServiceId = +params['vendorServiceId'];
      this.ineedId =+params['ineedId'];
      console.log('ID del servicio:', this.vendorServiceId); 

    this.notificationId = +params['notificationId']; 
    console.log('ID de la notificación:', this.notificationId); 
    this.notificationId2 = +params['notificationId2']; 
    console.log('ID de la notificación2:', this.notificationId2); 

    this.userId2 = +params['userId2']; 
    console.log('ID de la userId2:', this.userId2); 
      const token = this.token;
      if (token) {  
        this.authService.loginWithToken(token).subscribe({  
          next: response => {
            this.userId = this.authService.userId; // Ajusta según tu modelo de respuesta
            this.receiverId = this.route.snapshot.params["receiverId"];
            this.vendorServiceId = this.route.snapshot.params["vendorServiceId"];
            this.ineedId = this.route.snapshot.params["ineedId"];
            this.getHistoricalConversation();
            this.chatService.initConnenctionSocket(this.userId, this.receiverId);
            this.listenerMessage();
            this.listenerCountdown(); // Escuchar actualizaciones del contador
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

  private getHistoricalConversation(): void {
    this.chatService.getHistoryChat([this.userId, this.receiverId].sort().join('-')).subscribe({
      next: (response: Array<any>) => { 
        console.log("history: ", response);
        this.messageList = response.map((item: any) => ({ 
          ...JSON.parse(item.message),
          message_side: JSON.parse(item.message).user == this.userId ? 'sender' : 'receiver'
      }));
      this.scrollToBottom();
      },
      error: (err) => { console.log("history: ", err) }
    });
  }

  // Método que actualiza el estado del usuario  
  updateUserStatusOccupied() {  
    if (this.userId2 === null) {  
      console.error("Error: userId2 no puede ser nulo.");  
      return;  
    }  

    this.chatService.updateUserStatusToOccupied(this.userId2).subscribe({  
      next: (response) => {  
        console.log("Estado del usuario actualizado a 'ocupado':", response);  
        // Aquí puedes realizar otras acciones dependiendo de tu lógica,  
        // como notificar al usuario o actualizar la vista.  
      },  
      error: (error) => {  
        console.error("Error al actualizar el estado del usuario:", error);  
      }  
    });  
  }  


  updateUserStatusNoOccupied() {  
    if (this.userId === null) {  
      console.error("Error: userId2 no puede ser nulo.");  
      return;  
    }  

    this.chatService.updateUserStatusToNoOccupied(Number(this.userId)).subscribe({  
      next: (response) => {  
          console.log("Estado del usuario actualizado a 'No ocupado':", response);  
      },  
      error: (error) => {  
          console.error("Error al actualizar el estado del usuario:", error);  
      }  
  }); 
  }  

  handleUserType(type: string): void {  
    if (type === 'Buyer') {  
      this.isNegotiationEnabled = true;  
      this.sendNegotiationEnabledMessage();  
      // Envía un mensaje adicional para bloquear cancelaciones
      const roomId = [this.userId, this.receiverId].sort().join('-');  
      const lockMessage: ChatMessage = {  
        message: 'LOCK_NEGOTIATION',  
        sender: this.userId,  
        receiver: this.receiverId,  
        user: this.userId  
      };  
      this.chatService.sendMessage(roomId, lockMessage); 
    }  
    // Resto del código...
  }
  
  approveServiceByProvider() {  
    if (this.notificationId === null || this.notificationId2 === null) {  
      console.error("Error: notificationId o notificationId2 no pueden ser nulos.");  
      return;  
    }  
    
    this.chatService.approveServiceByProvider(this.notificationId, this.notificationId2).subscribe({  
      next: (response) => {  
        console.log("Servicio aprobado por el proveedor:", response);  
        this.isServiceApprovedByProvider = true;  
        this.serviceConfirmed = true; // 👈 Esta linea es para deshabilitar esta funcion cuando el servicio sea realizado
    
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

  // Método para iniciar el contador y enviar actualizaciones
  callMethodsAfterDelay() {  
    this.countdown = 5; // Reinicia el contador a 300 segundos  
    this.chatService.sendCountdown(this.countdown); // Enviar el estado inicial del contador

    this.intervalId = setInterval(() => {  
      this.countdown--;  
      this.chatService.sendCountdown(this.countdown); // Enviar actualizaciones del contador

      if (this.countdown <= 0) {  
        clearInterval(this.intervalId);  
        this.approveServiceByClient();  
        this.updateUserStatusNoOccupied();  
      }  
    }, 1000);  
  }  

  // Escuchar actualizaciones del contador desde el servidor
  listenerCountdown() {
    this.chatService.getCountdownSubject().subscribe((countdown) => {
      this.countdown = countdown;

      if (this.countdown <= 0 && this.intervalId) {
        clearInterval(this.intervalId);
      }
    });
  }

  ngOnDestroy() {  
    if (this.intervalId) {  
      clearInterval(this.intervalId);  
    }  
  }


  
  rejectServiceByProvider() {  
    if (this.notificationId === null || this.notificationId2 === null) {  
      console.error("Error: notificationId o notificationId2 no pueden ser nulos.");  
      return;  
    }  
    
    this.chatService.rejectServiceByProvider(this.notificationId, this.notificationId2).subscribe({  
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
    if (this.notificationId === null || this.notificationId2 === null) {  
      console.error("Error: notificationId o notificationId2 no pueden ser nulos.");  
      return;  
    }  
    
    this.chatService.approveServiceByClient(this.notificationId, this.notificationId2).subscribe({  
      next: (response) => {  
        console.log("Servicio aprobado por el cliente:", response);  
      },  
      error: (error) => {  
        console.error("Error al aprobar el servicio por el cliente:", error);  
      }  
    });  
  }
  
  rejectServiceByClient() {  
    if (this.notificationId === null || this.notificationId2 === null) {  
      console.error("Error: notificationId o notificationId2 no pueden ser nulos.");  
      return;  
    }  
    
    this.chatService.rejectServiceByClient(this.notificationId, this.notificationId2).subscribe({  
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
        this.scrollToBottom();
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
      this.getHistoricalConversation();
      let messageList = messages.map((item: any) => ({  
          ...item,  
          message_side: item.user == this.userId ? 'sender' : 'receiver'  
      }));

      this.messageList.push(messageList);
      this.scrollToBottom();

      // Controlar mensajes de aprobación y rechazo  
      const approvalMessage = messages.find((msg: any) => msg.message === 'El servicio ha sido aprobado por el proveedor');  
      if (approvalMessage) {  
        this.serviceConfirmed = true; // 👈 Oculta botones en ambos lados
        this.isServiceApprovedByProvider = approvalMessage.user !== this.userId;  
      } 

      // Escuchar los mensajes de negociación habilitada  
      const negotiationMessage = messages.find((msg: any) => msg.message === 'Negociación habilitada');  
      if (negotiationMessage) {  
        this.isNegotiationEnabled = true; 
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
        this.negotiationEnabled = true;  
        this.handleUserType('Buyer');  
        this.updateUserStatusOccupied();  
        break;  
      case 'cancelNegotiationByProvider':  
        this.negotiationCancelledByProvider = true;  
        this.rejectServiceByProvider();  
        this.updateUserStatusNoOccupied();  
        break;  
      case 'cancelNegotiationByClient':  
        this.negotiationCancelledByClient = true;  
        this.rejectServiceByClient();  
        this.updateUserStatusNoOccupied();  
        break;  
      case 'approveServiceByProvider':  
        this.serviceApprovedByProvider = true;  
        this.approveServiceByProvider(); // Ajustado para el Seller  
        this.callMethodsAfterDelay();  
        break;  
      case 'approveServiceByClient':  
        this.serviceApprovedByClient = true;  
        this.approveServiceByClient(); // Ajustado para el Buyer  
        this.updateUserStatusNoOccupied();
        this.dialogValorateService();  
        this.ngOnDestroy();  
        break;  
      default:  
        break;  
    }  
  }  
  }

  public claim() {
    let payload: Object = {
      userId: this.userId,
      receiverId: this.receiverId,
      roomId: [this.userId, this.receiverId].sort().join('-'),
      vendorServiceId: this.vendorServiceId,
      ineedId: this.ineedId,
    };

    this.claimService.createClaim(payload).subscribe({
      next: (resp) => {
        this.router.navigate(['claims', resp.id]);
      },
      error: () => { alert("Ha ocurrido un error inesperado")}
  });
    // this.router.navigate(['/login']);

  }

  private dialogValorateService(): void {
        const dialogRefNegotiation = this.dialog.open(DialogValorateServiceComponent, {
            data: {
              receiverId: this.receiverId,
            }
          });
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }
}