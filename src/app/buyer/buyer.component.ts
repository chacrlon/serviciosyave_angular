import { Component } from '@angular/core';  
import { CommonModule } from '@angular/common'; // Importar CommonModule  
import { HttpClient } from '@angular/common/http';  

@Component({  
  selector: 'app-buyer',  
  standalone: true, // Establecido como un componente independiente  
  imports: [CommonModule], // Agregar CommonModule aquí  
  templateUrl: './buyer.component.html',  
  styleUrls: ['./buyer.component.css']  
})  
export class BuyerComponent {  
  services: any[] = []; // Arreglo para almacenar los servicios  

  constructor(private http: HttpClient) {   
    this.loadServices(); // Cargar servicios al inicio  
  }  

  loadServices() {  
    this.http.get<any[]>('http://localhost:8080/api/service/') // Cambia a la URL de tu API  
      .subscribe(response => {  
        console.log('Servicios:', response); // Ver respuesta aquí  
        this.services = response;  
      }, error => {  
        console.error('Error loading services:', error);  
      });  
  }  
}