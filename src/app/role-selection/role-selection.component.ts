import { Component, OnInit } from '@angular/core';  
import { Router, ActivatedRoute } from '@angular/router';  
import { HttpClient } from '@angular/common/http';  
import { LocationService } from '../services/location.service';   
import { MatDialog } from '@angular/material/dialog';  
import { NotificationsseService } from '../notifications-sse/notificationsse.service';  
import { Notification } from '../models/Notification';  
import { NotificationModalComponent } from '../notifications-sse/notification-modal/notification-modal.component'; // Asegúrate de que esta ruta sea correcta  
import { NotificationsSSEComponent } from '../notifications-sse/notifications-sse.component'; // Asegúrate de importar el componente  


@Component({  
  selector: 'app-role-selection',  
  standalone: true,  
  imports: [NotificationsSSEComponent], // Asegúrate de incluir el componente aquí  
  templateUrl: './role-selection.component.html',  
  styleUrls: ['./role-selection.component.css']  
})  
export class RoleSelectionComponent implements OnInit {   

  userId: number | undefined;  // Propiedad para almacenar el ID del usuario  

  constructor(  
    private router: Router,   
    private http: HttpClient,   
    private locationService: LocationService,  
    private route: ActivatedRoute,  // Inyección de ActivatedRoute  
    private dialog: MatDialog, // Inyección de MatDialog para abrir el modal  
    private notificationsService: NotificationsseService // Inyección del servicio de notificaciones  
  ) {}  

  ngOnInit(): void {  
    // Obtener el ID del usuario de los parámetros de la ruta  
    this.route.paramMap.subscribe(params => {  
      this.userId = +params.get('id')!;  // Convertir el ID a número y almacenarlo  
      console.log('ID de Usuario desde el componente RoleSelectionComponent:', this.userId);  
    });  

    // Inicializar la conexión para recibir notificaciones  
    this.initializeEventSource();  
  }  
  
  initializeEventSource(): void {  
    const eventSource = new EventSource('http://localhost:8080/notifications');  
    
    eventSource.onmessage = (event) => {  
      const message: string = event.data;  
      const newNotification: Notification = {  
        id: Date.now(),  
        userId: this.userId!, // Asegúrate de que userId esté definido  
        message: message,  
        read: false  
      };  
      this.openNotificationModal(newNotification); // Mostrar el modal con la nueva notificación  
    };
    eventSource.onerror = (error) => {  
      console.error('Error en EventSource:', error);  
      eventSource.close(); // Cerrar la conexión si hay un error  
  };   
  }  

  openNotificationModal(notification: Notification): void {  
    const dialogRef = this.dialog.open(NotificationModalComponent, {  
      data: notification // Pasar la notificación al modal  
    });  

    dialogRef.afterClosed().subscribe(() => {  
      this.markAsRead(notification.id); // Marcar como leída al cerrar el modal  
    });  
  }  

  markAsRead(notificationId: number): void {  
    this.notificationsService.markAsRead(notificationId).subscribe(() => {  
      // Aquí puedes manejar la lógica después de marcar como leída  
    });  
  }  

  selectRole(role: string) {  
    this.obtenerUbicacion(role);  
  }  

  obtenerUbicacion(role: string) {  
    if (navigator.geolocation) {  
      navigator.geolocation.getCurrentPosition((position) => {  
        const lat = position.coords.latitude;  
        const lon = position.coords.longitude;  
        this.locationService.setLocation(lat, lon); // Almacena la ubicación en el servicio  
        this.navegarPorRol(role); // Navegar después de obtener la ubicación  
      }, (error) => {  
        console.error('Error obteniendo la ubicación', error);  
        this.navegarPorRol(role); // Navegar incluso si hay un error  
      });  
    } else {  
      console.error('La geolocalización no es compatible con este navegador.');  
      this.navegarPorRol(role); // Navegar si la geolocalización no es soportada  
    }  
  }  

  navegarPorRol(role: string) {  
    if (role === 'buyer') {  
      this.router.navigate(['/buyer']);  
    }   
    else if (role === 'seller') {  
      this.router.navigate(['/seller']);  
    }  
  }  
}