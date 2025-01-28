import { Component, OnInit } from '@angular/core';  
import { MoneyNowService } from './money-now.service';   
import { MoneyNow } from '../models/MoneyNow';  
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule    
import { AcceptOfferRequest } from '../models/AcceptOfferRequest'; 

@Component({  
  selector: 'app-money-now',  
  standalone: true,  
  imports: [CommonModule, FormsModule], // Agregar FormsModule aquí 
  templateUrl: './money-now.component.html',  
  styleUrls: ['./money-now.component.css']  
})  
export class MoneyNowComponent implements OnInit {  
  necesidades: MoneyNow[] = [];  
  negotiating: boolean = false; // Para controlar el estado de la negociación  

  negotiationDetails = {   
    amount: '',   
    justification: '',   
    currentNeccesity: null as MoneyNow | null // Especificar que puede ser MoneyNow o null  
  };
  constructor(private moneyNowService: MoneyNowService) {}  

  ngOnInit(): void {  
    this.cargarNecesidades();  
  }  

  aceptarOferta(necesidad: MoneyNow): void {
    const request: AcceptOfferRequest = {
      necesidadId: 123, // Usar el id de la necesidad
      professionalUserId: 123 // Aquí debes usar el ID del profesional autenticado
    };

    this.moneyNowService.aceptarOferta(request).subscribe({
      next: (response) => {
        console.log('Oferta aceptada:', response);
        alert('Oferta aceptada correctamente');
      },
      error: (err) => {
        console.error('Error al aceptar oferta:', err);
        alert('Error al aceptar la oferta');
      }
    });
  } 

  cargarNecesidades(): void {  
    this.moneyNowService.obtenerNecesidades().subscribe({  
      next: (data) => {  
        this.necesidades = data;  
      },  
      error: (error) => {  
        console.error('Error al cargar las necesidades:', error);  
      }  
    });  
  }  

  abrirNegociacion(necesidad: MoneyNow): void {  
    // Empieza el proceso de negociación  
    this.negotiating = true;  
    this.negotiationDetails.currentNeccesity = necesidad; // Guardar la necesidad en negociación  
    this.negotiationDetails.amount = ''; // Reiniciar el monto  
    this.negotiationDetails.justification = ''; // Reiniciar la justificación  
  }  

  enviarNegociacion(): void {  
    // Validar monto y justificación  
    if (!this.validarNegociacion(this.negotiationDetails.amount, this.negotiationDetails.justification)) {  
      return; // No hacer nada si la validación falla  
    }  
    
    // Aquí iría la lógica para enviar la propuesta de negociación a la aplicación  
    console.log('Enviando propuesta de negociación:', this.negotiationDetails);  
    
    // Cerrar el formulario después de enviar  
    this.negotiating = false;  
  }  

  validarNegociacion(amount: string, justification: string): boolean {  
    // Validar que el monto es un número positivo  
    if (isNaN(Number(amount)) || Number(amount) <= 0) {  
      alert('Por favor, ingrese un monto válido.');  
      return false;  
    }  

    // Validar que la justificación no es solo números y tiene un límite de 20 caracteres  
    if (justification.length > 20 || /^\d+$/.test(justification)) {  
      alert('La justificación debe tener un máximo de 20 caracteres y no puede contener solo números.');  
      return false;  
    }  

    return true;  
  }  

}