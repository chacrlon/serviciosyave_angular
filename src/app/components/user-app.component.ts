import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'user-app',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './user-app.component.html'
})
export class UserAppComponent implements OnInit {

  users: User[] = [];
  paginator: any = {};

  constructor(
    private router: Router,
    private service: UserService,
    private sharingData: SharingDataService,
    private authService: AuthService,
    private negotiationService: NegotiationService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.addUser();
    this.removeUser();
    this.findUserById();
    this.pageUsersEvent();
    this.handlerLogin();
    this.onlyLogin();
  }

  ngAfetViewInit(): void {

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
                    this.loadNotifications(success);
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

  loadNotifications(data: any): void {
    const dialogRef = this.dialog.open(DialogCounterOfferComponent, {  
      data: data,  
      width: '400px',  
      disableClose: true  
    });
          dialogRef.afterClosed().subscribe(
            event => {
              this.negotiationService.connectToSSE().subscribe(
                success => {            
                  this.loadNotifications(success);
                }
              );
            }
          );
  }

}