import { Component, OnInit, OnDestroy } from '@angular/core';  
import { Router, ActivatedRoute } from '@angular/router';  
import { LocationService } from '../services/location.service';   
import { MatDialog } from '@angular/material/dialog';  
import { Notification } from '../models/Notification';  
import { NotificationsseService } from '../notification-modal/notificationsse.service';  
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';  

@Component({  
  selector: 'app-role-selection',  
  standalone: true,  
  templateUrl: './role-selection.component.html',  
  styleUrls: ['./role-selection.component.css']   
})  
export class RoleSelectionComponent implements OnInit, OnDestroy {   
  
  userId: number | undefined;  // Propiedad para almacenar el ID del usuario  
  private eventSource!: EventSource; // Propiedad para la conexión EventSource  

  constructor(  
    private router: Router,   
    private locationService: LocationService,  
    private route: ActivatedRoute,  
    private dialog: MatDialog,  
    private notificationsService: NotificationsseService  
  ) {}  

  ngOnInit(): void {  
    // Obtener el ID del usuario de los parámetros de la ruta  
    this.route.paramMap.subscribe(params => {  
        this.userId = +params.get('id')!;  
        console.log('ID de Usuario desde el componente RoleSelectionComponent:', this.userId);  
        this.loadNotifications(); // Cargar notificaciones al iniciar  
    });  

    // Inicializar la conexión para recibir notificaciones  
    this.initializeEventSource();  
}  
  
  initializeEventSource(): void {  
    this.eventSource = new EventSource('http://localhost:8080/notifications');  
    
    this.eventSource.onmessage = (event) => {  
        const message: string = event.data;  
        console.log('Mensaje recibido desde EventSource:', message); // Log del mensaje recibido  
        this.checkAndShowNotification(message); // Verificar y mostrar la notificación  
    };  
    
    this.eventSource.onerror = (error) => {  
        console.error('Error en EventSource:', error);  
        this.eventSource.close();  
    };   
}  

loadNotifications(): void {  
  console.log('Cargando notificaciones para el usuario:', this.userId); // Log al cargar notificaciones  
  this.notificationsService.getUserNotifications(this.userId!).subscribe(notifications => {  
      console.log('Notificaciones recuperadas:', notifications); // Log de las notificaciones recuperadas  
      const unreadNotifications = notifications.filter(notification => !notification.read);  
      if (unreadNotifications.length > 0) {  
          const newNotification = unreadNotifications[0]; // Tomar la primera notificación no leída  
          console.log('Mostrando notificación no leída:', newNotification); // Log de la notificación que se mostrará  
          this.openNotificationModal(newNotification); // Mostrar el modal con la notificación no leída  
      } else {  
          console.log('No hay notificaciones no leídas'); // Log si no hay notificaciones no leídas  
      }  
  }, error => {  
      console.error('Error al cargar las notificaciones:', error); // Log de error al cargar notificaciones  
  });  
}  

checkAndShowNotification(message: string): void {  
  console.log('Verificando y mostrando notificación con el mensaje:', message); // Log antes de recuperar notificaciones  
  this.notificationsService.getUserNotifications(this.userId!).subscribe(notifications => {  
      console.log('Notificaciones recuperadas:', notifications); // Log de las notificaciones recuperadas  
      const unreadNotifications = notifications.filter(notification => !notification.read);  
      if (unreadNotifications.length === 0) {  
          const newNotification: Notification = {  
              id: Date.now(),  
              userId: this.userId!,  
              message: message,  
              read: false  
          };  
          console.log('No hay notificaciones no leídas. Creando nueva notificación:', newNotification); // Log de nueva notificación  
          this.openNotificationModal(newNotification); // Mostrar el modal con la nueva notificación  
      } else {  
          console.log('Existen notificaciones no leídas:', unreadNotifications); // Log si hay notificaciones no leídas  
      }  
  }, error => {  
      console.error('Error al recuperar notificaciones:', error); // Log de error al recuperar notificaciones  
  });  
}   

openNotificationModal(notification: Notification): void {  
  console.log('Abriendo modal con la notificación:', notification); // Log al abrir el modal  
  const dialogRef = this.dialog.open(NotificationModalComponent, {  
      data: notification // Pasar la notificación al modal  
  });  

  dialogRef.afterClosed().subscribe(() => {  
      console.log('Modal cerrado. Marcando notificación como leída:', notification.id); // Log al cerrar el modal  
      this.markAsRead(notification.id); // Marcar como leída al cerrar el modal  
  });  
}   

markAsRead(notificationId: number): void {  
    this.notificationsService.markAsRead(notificationId).subscribe(() => {  
      console.log(`Notificación ${notificationId} marcada como leída`);  
    }, error => {  
        console.error(`Error al marcar la notificación ${notificationId} como leída:`, error); // Log de error al marcar como leída  
    });  
}  

ngOnDestroy() {  
    console.log('Cerrando EventSource en ngOnDestroy'); // Log al cerrar el componente  
    this.eventSource.close();  
}  

navegarPorRol(role: string) {  
    console.log(`Navegando por rol: ${role}`); // Log al navegar por rol  
    this.router.navigate([`/${role}`]);  
}  

selectRole(role: string) {  
    console.log(`Rol seleccionado: ${role}`); // Log al seleccionar un rol  
    this.obtenerUbicacion(role);  
}  

obtenerUbicacion(role: string) {  
    console.log('Obteniendo ubicación para el rol:', role); // Log al obtener ubicación  
    if (navigator.geolocation) {  
      navigator.geolocation.getCurrentPosition((position) => {  
        const { latitude: lat, longitude: lon } = position.coords;  
        console.log(`Ubicación obtenida - Latitud: ${lat}, Longitud: ${lon}`); // Log de la ubicación  
        this.locationService.setLocation(lat, lon);  
        this.navegarPorRol(role);  
      }, (error) => {  
        console.error('Error al obtener la ubicación:', error); // Log de error al obtener ubicación  
        this.navegarPorRol(role);  
      });  
    } else {  
      console.warn('La geolocalización no está soportada. Navegando por rol:', role); // Log si no se soporta geolocalización  
      this.navegarPorRol(role);  
    }  
  }  
}