import { Component, Input, OnInit } from '@angular/core';  
import { Router, RouterLink, RouterModule } from '@angular/router';  
import { User } from '../../models/user';  
import { AuthService } from '../../services/auth.service';   
import { CommonModule } from '@angular/common';  // Importa CommonModule   
import { NotificationsComponent } from '../../notifications/notifications.component';

@Component({  
  selector: 'navbar',  
  standalone: true,  
  imports: [RouterModule, CommonModule, RouterLink, NotificationsComponent],  
  templateUrl: './navbar.component.html',  
  styleUrls: ['./navbar.component.css'] 
})  
export class NavbarComponent implements OnInit {  // Implementa OnInit  

  isAuthenticated: boolean = false; // Agrega esta propiedad para almacenar el estado de autenticación  

  constructor(private authService: AuthService,  
    private router: Router  
  ){}  

  ngOnInit() {  
    this.authService.authStatus$.subscribe(isAuth => {  
        // Actualiza el estado del componente según el estado de autenticación  
        this.isAuthenticated = isAuth;  
    });  
  }  

  @Input() users: User[] = [];  
  @Input() paginator = {}  

  get login() {  
    return this.authService.user;  
  }  

  get admin() {  
    return this.authService.isAdmin();  
  }  

  handlerLogout() {  
    this.authService.logout();  
    this.router.navigate(['/login'])  
  }  
}