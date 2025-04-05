import { Component, OnInit } from '@angular/core';
import { PaginatedResponse } from '../models/paginated-response.model';
import { AdminPayment } from '../models/admin-payment.model';
import { HttpErrorResponse } from '@angular/common/http'; // Importa HttpErrorResponse
import { AdminService } from '../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})

export class AdminComponent implements OnInit {
    payments: AdminPayment[] = []; // Lista de pagos
    currentPage: number = 0; // Página actual
    pageSize: number = 10; // Tamaño de la página
    totalItems: number = 0; // Total de elementos
    totalPages: number = 0; // Total de páginas
    sortField: string = 'fechaPago,desc'; // Campo de ordenación
  
    constructor(private adminService: AdminService) {}
  
    ngOnInit(): void {
      this.loadPayments(); // Cargar los pagos al iniciar el componente
    }

    private getPaymentMethod(payment: any): string {
        if (payment.binancePayment) return 'Binance';
        if (payment.bankTransfer) return 'Transferencia Bancaria';
        if (payment.mobilePayment) return 'Pago Móvil';
        return 'Desconocido';
      }
  
    // Cargar los pagos con paginación
    loadPayments(): void {
      this.adminService.getAllSellerPayments(this.currentPage, this.pageSize, this.sortField)
        .subscribe({
          next: (response: PaginatedResponse<AdminPayment>) => {
            this.payments = response.content; // Asignar los pagos
            this.totalItems = response.totalElements; // Total de elementos
            this.totalPages = response.totalPages; // Total de páginas
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error cargando pagos:', err.status, err.message);
          }
        });
    }
  
    // Cambiar de página
    onPageChange(newPage: number): void {
      this.currentPage = newPage;
      this.loadPayments(); // Recargar los pagos
    }
  
    // Cambiar el tamaño de la página
    onPageSizeChange(newSize: number): void {
      this.pageSize = newSize;
      this.currentPage = 0; // Reiniciar a la primera página
      this.loadPayments(); // Recargar los pagos
    }
  
    // Aprobar un pago
    approvePayment(paymentId: number): void {
      this.adminService.approvePayment(paymentId).subscribe({
        next: () => this.loadPayments(), // Recargar los pagos después de aprobar
        error: (err: HttpErrorResponse) => {
          console.error('Error aprobando pago:', err.status, err.message);
        }
      });
    }
  
    // Rechazar un pago
    rejectPayment(paymentId: number): void {
      this.adminService.rejectPayment(paymentId).subscribe({
        next: () => this.loadPayments(), // Recargar los pagos después de rechazar
        error: (err: HttpErrorResponse) => {
          console.error('Error rechazando pago:', err.status, err.message);
        }
      });
    }
  }