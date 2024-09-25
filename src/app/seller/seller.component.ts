import { Component } from '@angular/core';  
import { FormsModule } from '@angular/forms';  
import { CommonModule } from '@angular/common';  
import { HttpClient } from '@angular/common/http';  
import { Injectable } from '@angular/core';  

@Component({  
  selector: 'app-seller',  
  standalone: true,  
  imports: [FormsModule, CommonModule],  
  templateUrl: './seller.component.html',  
  styleUrls: ['./seller.component.css']  
})  
@Injectable({  
  providedIn: 'root'  
})  
export class SellerComponent {  
  modalType: string | null = null;  
  bankTransferData = { cuentaBancaria: '', nombreTitular: '', rif: '' };  
  binanceData = { binanceEmail: '' };  
  mobileData = { cedula: '', numeroTelefono: '', banco: '' };  
  serviceData = { nombre: '', descripcion: '', precio: 0, destacado: false }; // Para el servicio  
  services: any[] = []; // Array para almacenar los servicios registrados  
  notificationMessage: string | null = null;  

  constructor(private http: HttpClient) {  
    this.loadServices(); // Cargar servicios al inicio  
  }  

  openModal(type: string) {  
    this.modalType = type;  
    this.notificationMessage = null;  
  }  

  closeModal() {  
    this.modalType = null;  
    this.resetFormData();  
  }  

  resetFormData() {  
    this.bankTransferData = { cuentaBancaria: '', nombreTitular: '', rif: '' };  
    this.binanceData = { binanceEmail: '' };  
    this.mobileData = { cedula: '', numeroTelefono: '', banco: '' };  
    this.serviceData = { nombre: '', descripcion: '', precio: 0, destacado: false }; // Resetear el formulario de servicio  
  }  

  submitService() {  
    this.http.post('http://localhost:8080/api/service/create', this.serviceData)  
      .subscribe(response => {  
        console.log('Service Response:', response);  
        this.notificationMessage = "Servicio registrado con éxito";  
        this.loadServices(); // Recargar servicios después de registrar uno nuevo  
        this.resetFormData(); // Limpiar formulario después de la inscripción  
      }, error => {  
        console.error('Error registering service:', error);  
        this.notificationMessage = "Error al registrar el servicio";  
      });  
  }  

  loadServices() {  
    this.http.get('http://localhost:8080/api/service/') // Cambiar a la URL de tu API  
      .subscribe((response: any) => {  
        this.services = response;  
      }, error => {  
        console.error('Error loading services:', error);  
        this.notificationMessage = "Error al cargar los servicios";  
      });  
  }  

  submitBankTransfer() {  
    this.http.post('http://localhost:8080/api/banktransfer/create', this.bankTransferData)  
      .subscribe(response => {  
        console.log('Bank Transfer Response:', response);  
        this.notificationMessage = "Método de pago guardado con éxito";  
        this.closeModal();  
      }, error => {  
        console.error('Error creating bank transfer:', error);  
        this.notificationMessage = "Error al registrar método de pago";  
      });  
  }  

  submitBinance() {  
    const binancePayload = {  
      binanceEmail: this.binanceData.binanceEmail,  
      vendorService: null,  
      user: null  
    };  

    this.http.post('http://localhost:8080/api/binance/create', binancePayload)  
      .subscribe(response => {  
        console.log('Binance Response:', response);  
        this.notificationMessage = "Método de pago guardado con éxito";  
        this.closeModal();  
      }, error => {  
        console.error('Error creating Binance payment method:', error);  
        this.notificationMessage = "Error al registrar método de pago";  
      });  
  }  

  submitMobile() {  
    this.http.post('http://localhost:8080/api/mobilepayment/create', this.mobileData)  
      .subscribe(response => {  
        console.log('Mobile Payment Response:', response);  
        this.notificationMessage = "Método de pago guardado con éxito";  
        this.closeModal();  
      }, error => {  
        console.error('Error creating mobile payment:', error);  
        this.notificationMessage = "Error al registrar método de pago";  
      });  
  }  
}