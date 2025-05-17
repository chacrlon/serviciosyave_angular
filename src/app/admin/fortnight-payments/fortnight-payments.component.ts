import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminService } from '../../services/admin.service';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { AdminPayment } from '../../models/admin-payment.model';

@Component({
  selector: 'fortnight-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fortnight-payments.component.html',
  styleUrls: ['./fortnight-payments.component.css']
})
export class FortnightPaymentsComponent implements OnInit {
  payments: AdminPayment[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  sortField: string = 'fechaPago,desc';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  private getPaymentMethod(payment: any): string {
    if (payment.binancePayment) return 'Binance';
    if (payment.bankTransfer) return 'Transferencia Bancaria';
    if (payment.mobilePayment) return 'Pago Móvil';
    return 'Desconocido';
  }

  loadPayments(): void {
    this.adminService.getAllSellerPayments(this.currentPage, this.pageSize, this.sortField)
      .subscribe({
        next: (response: PaginatedResponse<AdminPayment>) => {
          this.payments = response.content;
          this.totalItems = response.totalElements;
          this.totalPages = response.totalPages;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error cargando pagos:', err.status, err.message);
        }
      });
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadPayments();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.loadPayments();
  }

  approvePayment(paymentId: number): void {
    this.adminService.approvePayment(paymentId).subscribe({
      next: () => this.loadPayments(),
      error: (err: HttpErrorResponse) => {
        console.error('Error aprobando pago:', err.status, err.message);
      }
    });
  }

  rejectPayment(paymentId: number): void {
    this.adminService.rejectPayment(paymentId).subscribe({
      next: () => this.loadPayments(),
      error: (err: HttpErrorResponse) => {
        console.error('Error rechazando pago:', err.status, err.message);
      }
    });
  }
}