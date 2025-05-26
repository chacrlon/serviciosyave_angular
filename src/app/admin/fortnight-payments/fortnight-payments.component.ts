import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminService } from '../../services/admin.service';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { AdminPayment, PaymentDetails } from '../../models/admin-payment.model';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'fortnight-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fortnight-payments.component.html',
  styleUrls: ['./fortnight-payments.component.css']
})
export class FortnightPaymentsComponent implements OnInit {
  pendingPayments: AdminPayment[] = [];
  selectedPayment: AdminPayment | null = null;
  reference: string = '';

  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private adminService: AdminService,  
    private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPendingPayments();
  }

  
  getPaymentMethodName(method: string): string {
    switch(method) {
      case 'PAGO_MOVIL': return 'Pago Móvil';
      case 'TRANSFERENCIA': return 'Transferencia Bancaria';
      case 'BINANCE': return 'Binance';
      default: return method;
    }
  }

  isLoading: boolean = false;

  loadPendingPayments(): void {
    this.isLoading = true;
    this.adminService.getPendingPayments().subscribe({
      next: (payments) => {
        this.pendingPayments = payments;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando pagos:', err);
        this.isLoading = false;
      }
    });
  }

openPaymentModal(payment: AdminPayment): void {
    console.log('Intentando abrir modal para el pago:', payment);
    this.selectedPayment = payment;
    this.reference = '';
    console.log('Estado actual de selectedPayment:', this.selectedPayment);
    
}

submitPayment(): void {
  this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedPayment || !this.reference) {
        this.errorMessage = 'La referencia es requerida';
        return;
    }

    this.adminService.updatePayment(this.selectedPayment.id, this.reference).subscribe({
        next: () => {
            // Recargar toda la lista en lugar de filtrar
            this.loadPendingPayments();
            this.successMessage = 'Pago registrado exitosamente';
            this.selectedPayment = null;
            setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
            this.errorMessage = 'Error al procesar el pago: ' + (err.error?.message || err.message);
            console.error(err);
        }
    });
}

  
  parsePaymentDetails(details: string): any {
    try {
      return JSON.parse(details);
    } catch (e) {
      return {};
    }
  }

  getPaymentDetailsSummary(payment: AdminPayment): string {
    const details = this.parsePaymentDetails(payment.paymentDetails);
    switch(payment.paymentMethod) {
      case 'PAGO_MOVIL':
        return `Banco: ${details.banco} - Tel: ${details.telefono}`;
      case 'TRANSFERENCIA':
        return `Cuenta: ${details.cuentaBancaria} - Titular: ${details.nombreTitular}`;
      case 'BINANCE':
        return `Email: ${details.email}`;
      default:
        return 'Detalles no disponibles';
    }
  }

  

}
