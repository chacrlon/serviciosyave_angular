import { Component } from '@angular/core';  
import { FormsModule } from '@angular/forms'; // Importar FormsModule

@Component({  
  selector: 'app-mobile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mobile.component.html',
  styleUrl: './mobile.component.css' 
})  
export class MobilePaymentComponent {  
  mobilePayment = { cedula: '', phoneNumber: '' };  

  submit() {  
    console.log('Pago Móvil Registrado:', this.mobilePayment);  
    // Lógica para gestionar el registro del pago móvil  
  }  
}