import { Component, OnInit, OnDestroy } from '@angular/core';  
import { Router, ActivatedRoute } from '@angular/router';  
import { LocationService } from '../services/location.service';  
import { MatDialog } from '@angular/material/dialog';  
import { Notification } from '../models/Notification';  
import { NotificationsseService } from '../notification-modal/notificationsse.service';  
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';  
import { Subscription } from 'rxjs';  
import { CommonModule } from '@angular/common';  
import { ChangeDetectorRef } from '@angular/core';  

interface GeolocationError {  
  code: number;  
  message: string;  
}  

@Component({  
  selector: 'app-role-selection',  
  standalone: true,  
  templateUrl: './role-selection.component.html',  
  styleUrls: ['./role-selection.component.css'],  
  imports: [CommonModule]  
})  
export class RoleSelectionComponent implements OnInit, OnDestroy {  
  userId: number | undefined;  
  notifications: Notification[] = [];  
  private subscriptions: Subscription[] = [];  

  constructor(  
    private cdr: ChangeDetectorRef,  
    private router: Router,  
    private locationService: LocationService,  
    private route: ActivatedRoute,  
    private dialog: MatDialog,  
    private notificationsseService: NotificationsseService  
  ) {}  

  ngOnInit(): void {  
    this.subscriptions.push(  
      this.route.paramMap.subscribe(params => {  
        this.userId = +params.get('id')!;  
        console.log('ID de Usuario desde el componente RoleSelectionComponent:', this.userId);  
        this.loadNotifications();  
      })  
    );  
  
    this.subscriptions.push(  
      this.notificationsseService.notifications$.subscribe((notification: Notification) => {  
        if (notification && notification.userId === this.userId) {  
          console.log('Nueva notificación recibida:', notification);  
          this.notifications.push(notification);  
          this.cdr.detectChanges();  
        }  
      })  
    );  

    this.notificationsseService.connectToSSE();  
  }  

  ngAfterViewInit() { 

    this.subscriptions.push(  
      this.route.paramMap.subscribe(params => {  
        this.userId = +params.get('id')!;  
        console.log('ID de Usuario desde el componente RoleSelectionComponent:', this.userId);  
        this.loadNotifications();  
      })  
    );  
  
    this.subscriptions.push(  
      this.notificationsseService.notifications$.subscribe((notification: Notification) => {  
        if (notification && notification.userId === this.userId) {  
          console.log('Nueva notificación recibida:', notification);  
          this.notifications.push(notification);  
          this.cdr.detectChanges();  
        }  
      })  
    );  

    this.notificationsseService.connectToSSE();  
    }  


  loadNotifications(): void {  
    if (!this.userId) {  
      console.warn('No se puede cargar notificaciones: userId no definido');  
      return;  
    }  

    this.subscriptions.push(  
      this.notificationsseService.getUserNotifications(this.userId).subscribe({  
        next: (notifications: Notification[]) => {  
          console.log('Notificaciones recuperadas:', notifications);  
          const unreadNotifications = notifications.filter(n => !n.read);  
          if (unreadNotifications.length > 0) {  
            const newNotification = unreadNotifications[0];  
            console.log('Mostrando notificación no leída:', newNotification);  
            this.openNotificationModal(newNotification);  
          } else {  
            console.log('No hay notificaciones no leídas');  
          }  
        },  
        error: (error: Error) => {  
          console.error('Error al cargar las notificaciones:', error);  
        }  
      })  
    );  
  }  

  openNotificationModal(notification: Notification): void {  
    console.log('Abriendo modal con la notificación:', notification);  
    const dialogRef = this.dialog.open(NotificationModalComponent, {  
      data: notification,  
      width: '400px',  
      disableClose: true  
    });  

    this.subscriptions.push(  
      dialogRef.afterClosed().subscribe(() => {  
        if (notification.id) {  
          console.log('Modal cerrado. Marcando notificación como leída:', notification.id);  
          this.markAsRead(notification.id);  
        }  
      })  
    );  
  }  

  markAsRead(notificationId: number): void {  
    this.subscriptions.push(  
      this.notificationsseService.markAsRead(notificationId).subscribe({  
        next: () => {  
          console.log(`Notificación ${notificationId} marcada como leída`);  
        },  
        error: (error: Error) => {  
          console.error(`Error al marcar la notificación ${notificationId} como leída:`, error);  
        }  
      })  
    );  
  }  

  markNotificationAsRead(notification: Notification): void {  
  if (notification.id) { // Verifica que el ID no sea undefined  
    this.markAsRead(notification.id); // Marca la notificación como leída  
    this.notifications = this.notifications.filter(n => n.id !== notification.id); // Elimina la notificación de la lista  
  } else {  
    console.error('No se puede marcar la notificación como leída: ID es undefined', notification);  
  }  
} 

  ngOnDestroy(): void {  
    console.log('Limpiando recursos del componente');  
    this.subscriptions.forEach(sub => sub.unsubscribe());  
    this.notificationsseService.disconnectSSE();  
  }  

  navegarPorRol(role: string): void {  
    console.log(`Navegando por rol: ${role}`);  
    this.router.navigate([`/${role}`]);  
  }  

  selectRole(role: string): void {  
    console.log(`Rol seleccionado: ${role}`);  
    this.obtenerUbicacion(role);  
  }  

  obtenerUbicacion(role: string): void {  
    console.log('Obteniendo ubicación para el rol:', role);  
    
    if (!navigator.geolocation) {  
      console.warn('La geolocalización no está soportada. Navegando por rol:', role);  
      this.navegarPorRol(role);  
      return;  
    }  

    navigator.geolocation.getCurrentPosition(  
      (position: GeolocationPosition) => {  
        const { latitude: lat, longitude: lon } = position.coords;  
        console.log(`Ubicación obtenida - Latitud: ${lat}, Longitud: ${lon}`);  
        this.locationService.setLocation(lat, lon);  
        this.navegarPorRol(role);  
      },  
      (error: GeolocationError) => {  
        console.error('Error al obtener la ubicación:', error);  
        this.navegarPorRol(role);  
      },  
      {  
        enableHighAccuracy: true,  
        timeout: 5000,  
        maximumAge: 0  
      }  
    );  
  }  
}