import { Component } from '@angular/core';  
import { CommonModule } from '@angular/common';  
import { HttpClient } from '@angular/common/http';  
import { FormsModule } from '@angular/forms';   

@Component({  
  selector: 'app-buyer',  
  standalone: true,  
  imports: [CommonModule, FormsModule],  
  templateUrl: './buyer.component.html',  
  styleUrls: ['./buyer.component.css']  
})  
export class BuyerComponent {  
  services: any[] = [];   
  selectedService: any;   
  modalVisible: boolean = false;   
  paymentMethodModalVisible: boolean = false;   
  paymentDetailsModalVisible: boolean = false;   
  referenceModalVisible: boolean = false;   
  selectedPaymentMethod: string | null = null;  

  // Variables para los detalles de pago  
  banco: string = '';  
  telefono: string = '';  
  cedulaRif: string = '';  
  numeroCuenta: string = '';  
  correoBinance: string = '';  
  monto: number | null = null;  
  referenciaPago: string = '';  

  // Propiedad para almacenar el tipo de cambio del dólar  
  exchangeRate: number | null = null;  

  constructor(private http: HttpClient) {  
    this.loadServices();  
    this.loadExchangeRate(); // Llamar al método para cargar el tipo de cambio  
  }  

  loadExchangeRate() {  
    this.http.get<number>('http://localhost:8080/api/currency/dolar')  
      .subscribe(response => {  
        this.exchangeRate = response; // Aquí guardarías el tipo de cambio como decimal  
      }, error => {  
        console.error('Error loading exchange rate:', error);  
      });  
  }  

  loadServices() {  
    this.http.get<any[]>('http://localhost:8080/api/service/')  
      .subscribe(response => {  
        this.services = response;  
      }, error => {  
        console.error('Error loading services:', error);  
      });  
  }  

  showModal(service: any) {  
    this.selectedService = service;  
    this.modalVisible = true;  
  }  

  closeModal() {  
    this.modalVisible = false;  
    this.selectedService = null;  
  }  

  openPaymentMethodModal() {  
    this.paymentMethodModalVisible = true;  
  }  

  closePaymentMethodModal() {  
    this.paymentMethodModalVisible = false;  
    this.selectedPaymentMethod = null;  
  }  

  selectPaymentMethod(method: string) {  
    this.selectedPaymentMethod = method;  
    this.paymentMethodModalVisible = false;  
    this.openPaymentDetailsModal();  
  }  

  openPaymentDetailsModal() {  
    this.paymentDetailsModalVisible = true;  
  }  

  closePaymentDetailsModal() {  
    this.paymentDetailsModalVisible = false;  
    this.resetPaymentDetails();  
  }  

  openReferenceModal() {  
    this.paymentDetailsModalVisible = false;  
    this.referenceModalVisible = true;  
  }  

  closeReferenceModal() {  
    this.referenceModalVisible = false;  
  }  

  // En BuyerComponent  
  confirmPayment() {
    const paymentPayload = {
      monto: this.calculatePrice(),
      divisa: this.currency(),
      metodo_pago: this.selectedPaymentMethod,
      vendorServiceId: this.selectedService.id,
      referencia: this.referenciaPago,
      estatus: 'procesando'
    };
  
    console.log('Pago procesado exitosamente:', paymentPayload);
  
    this.http.post('http://localhost:8080/api/payment/create', paymentPayload)
      .subscribe(response => {
        console.log('Pago procesado exitosamente:', response);
        this.closeReferenceModal();
        this.resetPaymentDetails();
      }, error => {
        console.error('Error al procesar el pago:', error);
      });
  }
  
  calculatePrice(): number {
    if (this.selectedPaymentMethod === 'binance') {
      return this.selectedService?.precio || 0; // Handle missing price
    } else if (this.selectedService?.precio && this.exchangeRate) {
      return this.selectedService.precio * this.exchangeRate;
    } else {
      return 0; // Handle cases where price or exchange rate is unavailable
    }
  }

  currency(): String {
    if (this.selectedPaymentMethod === 'binance') {
      return 'usdt'; // Handle missing price
    } else if (this.selectedPaymentMethod === 'transferenciaBancaria') {
      return 'bolivares';
    } else if (this.selectedPaymentMethod === 'pagoMovil') {
        return 'bolivares';
    } else {
      return 'EROR'; 
    }
  }

  resetPaymentDetails() {  
    this.banco = '';  
    this.telefono = '';  
    this.cedulaRif = '';  
    this.numeroCuenta = '';  
    this.correoBinance = '';  
    this.monto = null;  
    this.referenciaPago = '';  
    this.selectedPaymentMethod = null;  
  }  
}