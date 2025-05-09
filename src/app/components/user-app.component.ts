import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../models/user';
import { UserService } from '../services/user.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { SharingDataService } from '../services/sharing-data.service';
import { AuthService } from '../services/auth.service';
import { NegotiationService } from '../negotiation-modal/service/negotiation.service';
import { DialogCounterOfferComponent } from './dialog-counteroffer/dialog-counteroffer.component';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsseService } from '../notification-modal/notificationsse.service';
import { Subscription } from 'rxjs';
import { Notification } from '../models/Notification';  
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';

@Component({
  selector: 'user-app',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './user-app.component.html'
})
export class UserAppComponent implements OnInit {

  users: User[] = [];
  paginator: any = {};

  userId: number | undefined;  
  notifications: Notification[] = [];  
  private subscriptions: Subscription[] = [];  
  private isModalOpen = false; // Variable para rastrear el estado del modal

  constructor(
    private router: Router,
    private service: UserService,
    private sharingData: SharingDataService,
    private authService: AuthService,
    private negotiationService: NegotiationService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notificationsseService: NotificationsseService,
    private cdr: ChangeDetectorRef,  
    
  ) { }

  ngOnInit(): void {
    this.addUser();
    this.removeUser();
    this.findUserById();
    this.pageUsersEvent();
    this.handlerLogin();
    this.onlyLogin();

    if(this.authService.token) {
      this.userId = this.authService.userId; // Asignar el userId desde el token

      this.subscriptions.push(  
        this.notificationsseService.notifications$.subscribe((notification: Notification) => {  
          if (notification && notification.userId === this.userId) {  
            console.log('Nueva notificación recibida:', notification);  
            this.notifications.push(notification);  
            this.cdr.detectChanges();  
          }  
        })  
      );  
      
      this.notificationsseService.connectToSSE().subscribe(
        success => {
          this.loadNotifications();
        }
      );  
    }
  }

  ngAfterViewInit(): void {
    if(this.authService.token) {

      this.subscriptions.push(  
        this.notificationsseService.notifications$.subscribe((notification: Notification) => {  
          if (notification && notification.userId === this.userId) {  
            console.log('Nueva notificación recibida:', notification);  
            this.notifications.push(notification);  
            this.cdr.detectChanges();  
          }  
        })  
      );  
    }
  }
 

  handlerLogin() {  
    this.sharingData.handlerLoginEventEmitter.subscribe(({ username, password }) => {  
        console.log(username + ' ' + password);  

        this.authService.loginUser({ username, password }).subscribe({  
            next: response => {  
                const token = response.token;  
                const userId = response.userDetails.userId;  // Accede al userId desde userDetails  
                console.log(token);  
                console.log(userId);  
                this.userId = userId;
            
                const payload = this.authService.getPayload(token);  

                const user = { username: payload.sub, id: userId }; // Agregas el id al objeto user  
                const login = {  
                    user,  
                    isAuth: true,  
                    isAdmin: payload.isAdmin  
                };  
                
                this.authService.token = token;  
                this.authService.user = login;  

                this.negotiationService.connectToSSE().subscribe(
                  success => {            
                    this.loadCounterOfferNotifications(success);
                  }
                );

                this.loadNotifications();

                this.notificationsseService.connectToSSE().subscribe(
                  success => {
                    this.loadNotifications();
                  }
                );  

                // Navegar a RoleSelectionComponent pasando el userId como parámetro  
                this.router.navigate(['/role-selection', { id: userId }]);  

            },  
            error: error => {  
              console.log('Error completo:', error);
              if (error.error.userId) { // Si viene el ID
                this.router.navigate(['/app-code-verify', { id: error.error.userId }]);
                Swal.fire('Verifica tu correo', error.error.message, 'warning');
            } else {
                Swal.fire('Error', error.error.message, 'error');
            }
             
          }  
      });  
  });  
}

  onlyLogin() {  
    this.sharingData.onlyLoginEventEmitter.subscribe(({ username, password }) => {  
        console.log(username + ' ' + password);  

        this.authService.loginUser({ username, password }).subscribe({  
            next: response => {  
                const token = response.token;  
                const userId = response.userDetails.userId;  // Accede al userId desde userDetails  
                console.log(token);  
                console.log(userId);  
                const payload = this.authService.getPayload(token);  

                const user = { username: payload.sub, id: userId }; // Agregas el id al objeto user  
                const login = {  
                    user,  
                    isAuth: true,  
                    isAdmin: payload.isAdmin  
                };  
                
                this.authService.token = token;  
                this.authService.user = login;  

            },  
            error: error => {  
                if (error.status == 401) {  
                    Swal.fire('Error en el Login', error.error.message, 'error');  
                } else {  
                    throw error;  
                }  
            }  
        });  
    });  
  }

  pageUsersEvent() {
    this.sharingData.pageUsersEventEmitter.subscribe(pageable => {
      this.users = pageable.users;
      this.paginator = pageable.paginator;
    });
  }

  findUserById() {
    this.sharingData.findUserByIdEventEmitter.subscribe(id => {

      const user = this.users.find(user => user.id == id);

      this.sharingData.selectUserEventEmitter.emit(user);
    })
  }

  addUser() {
    this.sharingData.newUserEventEmitter.subscribe(user => {
      if (user.id > 0) {
        this.service.update(user).subscribe(
          {
            next: (userUpdated) => {
              this.users = this.users.map(u => (u.id == userUpdated.id) ? { ...userUpdated } : u);
              this.router.navigate(['/users'], {
                state: {
                  users: this.users,
                  paginator: this.paginator
               } });
            
              Swal.fire({
                title: "Actualizado!",
                text: "Usuario editado con exito!",
                icon: "success"
              });
            },
            error: (err) => {
              // console.log(err.error)
              if (err.status == 400) {
                this.sharingData.errorsUserFormEventEmitter.emit(err.error);
              }
            }
          })

      } else {
        this.service.create(user).subscribe( {
          next: userNew =>  {
          console.log(user)
          this.users = [... this.users, { ...userNew }];

            this.router.navigate(['/users'], {
              state: {
                users: this.users,
                paginator: this.paginator
             } });
            
            Swal.fire({
              title: "Creado nuevo usuario!",
              text: "Usuario creado con exito!",
              icon: "success"
            });
          },
          error: (err) => {
            if (err.status == 400) {
              this.sharingData.errorsUserFormEventEmitter.emit(err.error);
            }

        }})
      }

    })
  }

  removeUser(): void {
    this.sharingData.idUserEventEmitter.subscribe(id => {
      Swal.fire({
        title: "Seguro que quiere eliminar?",
        text: "Cuidado el usuario sera eliminado del sistema!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si"
      }).then((result) => {
        if (result.isConfirmed) {

          this.service.remove(id).subscribe(() => {
            this.users = this.users.filter(user => user.id != id);
            this.router.navigate(['/users/create'], { skipLocationChange: true }).then(() => {
              this.router.navigate(['/users'], {
                state: {
                  users: this.users,
                  paginator: this.paginator
               } });
            });
          })


          Swal.fire({
            title: "Eliminado!",
            text: "Usuario eliminado con exito.",
            icon: "success"
          });
        }
      });
    });
  }

  loadCounterOfferNotifications(data: any): void {
    const dialogRef = this.dialog.open(DialogCounterOfferComponent, {  
      data: data,  
      width: '400px',  
      disableClose: true  
    });
          dialogRef.afterClosed().subscribe(
            event => {
              this.negotiationService.connectToSSE().subscribe(
                success => {            
                  this.loadCounterOfferNotifications(success);
                }
              );
            }
          );
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
          
          // Filtrar y obtener solo la primera notificación no leída  
          const unreadNotifications = notifications.filter(n => !n.read);  
          
          if (unreadNotifications.length > 0) {  
            const newNotification = unreadNotifications[0];  
            console.log('Mostrando notificación no leída:', newNotification);  
            this.notifications.push(newNotification);  
            newNotification.userId != this.userId ? this.openNotificationModal(newNotification) : null;  
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
      if (this.isModalOpen) return; // Si ya está abierto, no hacer nada  
    
      this.isModalOpen = true; // Marcar el modal como abierto  
      console.log('Abriendo modal con la notificación:', notification);  
      const dialogRef = this.dialog.open(NotificationModalComponent, {  
        data: notification,  
        width: '400px',  
        disableClose: true  
      });  
    
      this.subscriptions.push(  
        dialogRef.afterClosed().subscribe(() => {
          this.isModalOpen = false; // Marcar el modal como cerrado al cerrarse el diálogo  
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
            this.loadNotifications();
          },  
          error: (error: Error) => {  
            console.error(`Error al marcar la notificación ${notificationId} como leída:`, error);  
          }  
        })  
      );  
    }

    ngOnDestroy(): void {  
      console.log('Limpiando recursos del componente');  
      this.subscriptions.forEach(sub => sub.unsubscribe());  
      this.notificationsseService.disconnectSSE();
      this.negotiationService.disconnectSSE();
    }

}