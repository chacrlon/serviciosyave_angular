import { Component, OnInit } from '@angular/core';  
import { PaymentService } from './paymentService';  // Asegúrate que el nombre del archivo sea correcto  
import { PaymentDTO } from '../models/PaymentDTO';   
import { CommonModule } from '@angular/common'; // Importa CommonModule aquí  
import { FormsModule } from '@angular/forms';   

@Component({  
  selector: 'app-payment',  
  standalone: true,   
  imports: [CommonModule, FormsModule],   
  templateUrl: './payment-component.component.html', // Corrige el nombre de tu archivo si es diferente  
  styleUrls: ['./payment-component.component.css'] // Cambia styleUrl a styleUrls  
})  
export class PaymentComponent implements OnInit {  
  payments: PaymentDTO[] = [];  

  constructor(private paymentService: PaymentService) { }  

  ngOnInit(): void {  
    this.loadPayments();  
  }  

  loadPayments(): void {  
    this.paymentService.getAllPayments().subscribe({  
      next: (data) => this.payments = data,  
      error: (err) => console.error('Error al cargar los pagos', err)  
    });  
  }  

  approvePayment(id: number): void {  
    this.paymentService.approvePayment(id).subscribe({  
      next: () => this.loadPayments(), // Recargar después de aprobar  
      error: (err) => console.error('Error al aprobar el pago', err)  
    });  
  }  

  rejectPayment(id: number): void {  
    this.paymentService.rejectPayment(id).subscribe({  
      next: () => this.loadPayments(), // Recargar después de rechazar  
      error: (err) => console.error('Error al rechazar el pago', err)  
    });  
  }  
}