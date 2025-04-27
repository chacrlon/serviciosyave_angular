import { Component } from '@angular/core';  
import { FormsModule } from '@angular/forms';  
import { CommonModule } from '@angular/common';  
import { HttpClient } from '@angular/common/http';  
import { Injectable } from '@angular/core';  
import { LocationService } from '../services/location.service';

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
  selectedServiceId: number | null = null; // ID del servicio seleccionado para editar

  categoria = [ 
    {  
      nombre: 'Servicios de Transporte',  
      subcategoria: [  
        'Transporte de Personas',  
        'Transporte de Carga',  
        'Taxi',  
        'Logística de Envíos'  
      ]  
    }  
  ];   

   serviceData = {  
    nombre: '',  
    descripcion: '',  
    precio: 0,  
    destacado: false,  
    categoria: '',  
    subcategoria: '',  
    remoto: '',
    allowNegotiation: false,
    latitude: 0, 
    longitude: 0 
  };  

  subcategoria: string[] = []; 
  services: any[] = []; 
  notificationMessage: string | null = null;   
  location: { latitude: number; longitude: number } | null = null;   


  constructor(private http: HttpClient, private locationService: LocationService) {  
    this.loadServices(); 
    this.locationService.location$.subscribe(location => {  
      this.location = location;
      if (location) {      
    this.serviceData.latitude = location.latitude; 
    this.serviceData.longitude = location.longitude; 
      }  
    });  
  }  

  openModal(type: string) {  
    this.modalType = type;  
    this.notificationMessage = null;  
// Aqui se cargan los datos del metodo de pago cuando se carga el modal
    if (type === 'bankTransfer') {  
      this.loadBankTransfer();  
    } else if (type === 'binance') {  
      this.loadBinanceEmail();  
    } else if (type === 'mobile') {  
      this.loadMobilePayment();   
    }  
  }  

  closeModal() {  
    this.modalType = null;  
    this.resetFormData();  
  }  

  resetFormData() {  
    this.bankTransferData = { cuentaBancaria: '', nombreTitular: '', rif: '' };  
    this.binanceData = { binanceEmail: '' };  
    this.mobileData = { cedula: '', numeroTelefono: '', banco: '' };  
    this.serviceData = {  
      nombre: '',  
      descripcion: '',  
      precio: 0,  
      destacado: false,  
      categoria: '',  
      subcategoria: '', 
      remoto: '',  
      allowNegotiation: false,
      latitude: 0,  
      longitude: 0  
    };  
}  

  // Método para seleccionar el servicio y cargar sus datos para editar  
  editService(service: any) {  
    this.serviceData = {  
      nombre: service.nombre,  
      descripcion: service.descripcion,  
      precio: service.precio,  
      destacado: service.destacado,  
      categoria: service.categoria,  
      subcategoria: service.subcategoria,  
      remoto: service.remoto,
      allowNegotiation: service.allowNegotiation,
      latitude: this.serviceData.latitude, 
      longitude: this.serviceData.longitude
    };  
    this.selectedServiceId = service.id; 
  }    

  // En SellerComponent
setPaymentMethod(method: string) {
  this.http.patch('http://localhost:8080/api/users/payment-method', { paymentMethod: method })
    .subscribe(
      () => {
        this.notificationMessage = 'Método de pago actualizado correctamente';
        this.closeModal();
      },
      error => {
        console.error('Error actualizando método de pago:', error);
        this.notificationMessage = 'Error al actualizar el método de pago';
      }
    );
}

  // Método para actualizar el servicio existente  
  updateService() {  
    if (this.selectedServiceId !== null) {  
      this.http.put(`http://localhost:8080/api/service/${this.selectedServiceId}`, this.serviceData)  
        .subscribe(response => {  
          console.log('Service updated:', response);  
          this.notificationMessage = "Servicio actualizado con éxito";  
          this.loadServices();  
          this.resetFormData();  
          this.selectedServiceId = null; 
        }, error => {  
          console.error('Error updating service:', error);  
          this.notificationMessage = "Error al actualizar el servicio";  
        });  
    }  
  }  

  submitService() {  
    if (this.selectedServiceId !== null) {  
      this.updateService();  
    } else {  
      this.http.post('http://localhost:8080/api/service/create', this.serviceData)  
        .subscribe(response => {  
          console.log('Service Response:', response);  
          this.notificationMessage = "Servicio registrado con éxito";  
          this.loadServices();  
          this.resetFormData();  
        }, error => {  
          console.error('Error registering service:', error);  
          this.notificationMessage = "Error al registrar el servicio";  
        });  
    }  
}  

onEstadoChange(categoriaSeleccionado: string) {  
    const categoria = this.categoria.find(e => e.nombre === categoriaSeleccionado);  
    this.subcategoria = categoria ? categoria.subcategoria : [];  
    this.serviceData.subcategoria = ''; // Limpiar subcategoría al cambiar categoría  
}    
 

  loadServices() {  
    this.http.get('http://localhost:8080/api/service/user') 
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

  loadBankTransfer() {  
    this.http.get('http://localhost:8080/api/banktransfer/user') 
      .subscribe((response: any) => {  
        if (response.bankTransfers) {   
          this.bankTransferData = response.bankTransfers; 
        }  
      }, error => {  
        console.error('Error loading bank transfer:', error);  
        this.notificationMessage = "Error al cargar la transferencia bancaria";  
      });  
  }  

  loadBinanceEmail() {  
    this.http.get('http://localhost:8080/api/binance/user/email')
      .subscribe((response: any) => {  
        this.binanceData.binanceEmail = response.email; 
      }, error => {  
        console.error('Error loading Binance email:', error);  
        this.notificationMessage = "Error al cargar el email de Binance";  
      });  
  }

  submitBinance() {  
    const binancePayload = {  
      binanceEmail: this.binanceData.binanceEmail  
    };  

    this.http.post('http://localhost:8080/api/binance/create', binancePayload)  
      .subscribe(response => {  
        console.log('Binance Response:', response);  
        this.notificationMessage = "Método de pago guardado con éxito";  
        this.closeModal();  
        this.resetFormData();  
      }, error => {  
        console.error('Error creating Binance payment method:', error);  
        this.notificationMessage = "Error al registrar método de pago";  
      });  
  }  

  loadMobilePayment() {  
    this.http.get('http://localhost:8080/api/mobilepayment/user')
      .subscribe((response: any) => {  
        if (response.mobilePayment) {  
          this.mobileData = response.mobilePayment;
        } else {  
          this.mobileData = { cedula: '', numeroTelefono: '', banco: '' }; 
        }  
      }, error => {  
        console.error('Error loading mobile payment:', error);  
        this.notificationMessage = "Error al cargar el pago móvil";  
      });  
  }

  submitMobile() {  
    this.http.post('http://localhost:8080/api/mobilepayment/create', this.mobileData)  
      .subscribe(response => {  
        console.log('Mobile Response:', response);  
        this.notificationMessage = "Método de pago guardado con éxito";  
        this.closeModal();  
        this.resetFormData();  
      }, error => {  
        console.error('Error creating mobile payment method:', error);  
        this.notificationMessage = "Error al registrar método de pago";  
      });  
  }  
}