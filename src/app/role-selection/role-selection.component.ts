import { Component, OnInit } from '@angular/core';  
import { Router, ActivatedRoute } from '@angular/router';  
import { HttpClient } from '@angular/common/http';  
import { LocationService } from '../services/location.service';   
import { NotificationsSSEComponent } from '../notifications-sse/notifications-sse.component';  

@Component({  
  selector: 'app-role-selection',  
  standalone: true,  
  imports: [NotificationsSSEComponent],  
  templateUrl: './role-selection.component.html',  
  styleUrls: ['./role-selection.component.css']  
})  
export class RoleSelectionComponent implements OnInit {   

  userId: number | undefined;  // Propiedad para almacenar el ID del usuario  

  constructor(  
    private router: Router,   
    private http: HttpClient,   
    private locationService: LocationService,  
    private route: ActivatedRoute  // Inyección de ActivatedRoute  
  ) {}  

  ngOnInit(): void {  
    // Obtener el ID del usuario de los parámetros de la ruta  
    this.route.paramMap.subscribe(params => {  
      this.userId = +params.get('id')!;  // Convertir el ID a número y almacenarlo  
      console.log('ID de Usuario desde el componente RoleSelectionComponent:', this.userId);  
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