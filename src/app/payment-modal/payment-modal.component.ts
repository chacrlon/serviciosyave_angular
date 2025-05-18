import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.css'
})
export class PaymentModalComponent implements OnInit {
  selectedPaymentMethod: string | null = null;
  paymentMethodModalVisible = true;
  paymentDetailsModalVisible = false;
  referenceModalVisible = false;
  exchangeRate: number | null = null;
  
  // Campos del formulario
  referenciaPago = '';
  telefono = '';
  numeroCuenta = '';
  correoBinance = '';

  constructor(
    public dialogRef: MatDialogRef<PaymentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadExchangeRate();
  }

  loadExchangeRate() {
    this.http.get<number>('http://localhost:8080/api/currency/dolar')
      .subscribe(response => {
        this.exchangeRate = response;
      }, error => {
        console.error('Error loading exchange rate:', error);
      });
  }

  selectPaymentMethod(method: string) {
    this.selectedPaymentMethod = method;
    this.paymentMethodModalVisible = false;
    this.paymentDetailsModalVisible = true;
  }

  openReferenceModal() {
    this.paymentDetailsModalVisible = false;
    this.referenceModalVisible = true;
  }

confirmPayment() {
  const paymentPayload = {
    monto: this.calculatePrice(),
    divisa: this.selectedPaymentMethod === 'binance' ? 'usdt' : 'bolivares',
    metodoPago: this.selectedPaymentMethod,
    vendorServiceId: this.data.vendorServiceId,  // Puede ser undefined
    ineedId: this.data.ineedId,                  // Puede ser undefined
    userId: this.data.userId,
    receiverId: this.data.userId2,
    referencia: this.referenciaPago,
    estatus: 'procesando',
    ...this.getPaymentMethodFields()
  };

  // Validación básica
  if (!paymentPayload.vendorServiceId && !paymentPayload.ineedId) {
    alert('Error: No se especificó ningún recurso para el pago');
    return;
  }

  this.http.post('http://localhost:8080/api/payment/create', paymentPayload)
    .subscribe({
      next: (response) => {
        console.log('Pago registrado:', response);
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error procesando pago:', error);
        alert('Error al registrar el pago');
      }
    });
}

  private getPaymentMethodFields() {
    const fields: any = {};
    if (this.selectedPaymentMethod === 'pagoMovil') {
      fields.telefono = this.telefono;
    } else if (this.selectedPaymentMethod === 'transferenciaBancaria') {
      fields.numeroCuenta = this.numeroCuenta;
    } else if (this.selectedPaymentMethod === 'binance') {
      fields.emailBinance = this.correoBinance;
    }
    return fields;
  }

  calculatePrice(): number {
    if (this.selectedPaymentMethod === 'binance') {
      return this.data.precio;
    }
    return this.data.precio * (this.exchangeRate || 1);
  }

  close() {
    this.dialogRef.close(false);
  }
}