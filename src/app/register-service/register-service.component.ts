import { Component } from '@angular/core';  
import { FormsModule } from '@angular/forms'; // Importar FormsModule

@Component({  
  selector: 'app-register-service',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-service.component.html',
  styleUrl: './register-service.component.css' 
})  
export class RegisterServiceComponent {  
  service = { name: '', description: '', price: 0 };  

  submitService() {  
    console.log('Servicio Registrado:', this.service);  
    // Lógica para gestionar el registro del servicio  
  }  
}