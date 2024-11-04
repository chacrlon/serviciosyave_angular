import { Component } from '@angular/core';  
import { Router } from '@angular/router';  
import { HttpClient } from '@angular/common/http';  
import { LocationService } from '../services/location.service'; // Asegúrate de importar el servicio  

@Component({  
  selector: 'app-role-selection',  
  standalone: true,  
  templateUrl: './role-selection.component.html',  
  styleUrls: ['./role-selection.component.css']  
})  
export class RoleSelectionComponent {  
  constructor(private router: Router, private http: HttpClient, private locationService: LocationService) {}  

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