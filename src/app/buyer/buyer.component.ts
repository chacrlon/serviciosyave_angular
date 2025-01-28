import { Component, OnInit } from '@angular/core';  
import { CommonModule } from '@angular/common';  
import { HttpClient } from '@angular/common/http';  
import { FormsModule } from '@angular/forms';   
import { Router, ActivatedRoute } from '@angular/router'; 
import { LocationService } from '../services/location.service'; 

interface GeolocationError {  
  code: number;  
  message: string;  
} 

@Component({  
  selector: 'app-buyer',  
  standalone: true,  
  imports: [CommonModule, FormsModule],  
  templateUrl: './buyer.component.html',  
  styleUrls: ['./buyer.component.css']  
})  
export class BuyerComponent implements OnInit{  
  userId: number | undefined;  
  services: any[] = [];   
  selectedService: any;   
  modalVisible: boolean = false;   
  paymentMethodModalVisible: boolean = false;   
  paymentDetailsModalVisible: boolean = false;   
  referenceModalVisible: boolean = false;   
  selectedPaymentMethod: string | null = null;  

  filter = {  
    categoria: null,
    subcategoria: null,
    minPrecio: null,  
    maxPrecio: null,  
    destacado: null,
    latitude: null,
    longitude: null
  };  

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
  // Para almacena la ubicación  
  location: { latitude: number; longitude: number } | null = null;  

  constructor(private http: HttpClient, private locationService: LocationService, private router: Router, private route: ActivatedRoute) {  
    // No es necesario llamar a loadServices aquí  
  }  

  ngOnInit(): void { // Implementar ngOnInit  
    this.route.queryParams.subscribe(params => {  
      this.userId = +params['id']; // Obtener el userId de los parámetros de consulta  
      console.log('User ID recibido en BuyerComponent:', this.userId);  
    });  

    this.loadServices();  
    this.loadExchangeRate(); // Llamar al método para cargar el tipo de cambio  
  } 
// Acceder a la interfaz para publicar una necesidad y ofertar un monto, esto es para rol de buyer  
  publicarNecesidad(): void {  
    console.log('Publicando necesidad...');  
    // Puedes abrir un modal aquí o redirigir a otra página  
    this.router.navigate(['/necesito'], { queryParams: { id: this.userId } });   // Asegúrate de que esta ruta esté definida en tu enrutador  
  }

  obtenerUbicacion(role: string): void {  
    console.log('Obteniendo ubicación para el rol:', role);  
    
    if (!navigator.geolocation) {  
      console.warn('La geolocalización no está soportada. Navegando por rol:', role);   
      return;  
    }  

    navigator.geolocation.getCurrentPosition(  
      (position: GeolocationPosition) => {  
        const { latitude: lat, longitude: lon } = position.coords;  
        console.log(`Ubicación obtenida - Latitud: ${lat}, Longitud: ${lon}`);  
        this.locationService.setLocation(lat, lon);  
      },  
      (error: GeolocationError) => {  
        console.error('Error al obtener la ubicación:', error);   
      },  
      {  
        enableHighAccuracy: true,  
        timeout: 5000,  
        maximumAge: 0  
      }  
    );  
  }  
// ---------------------------------------------------------------------------------------


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

  applyFilters() {  
    // Enviamos el objeto filter como cuerpo de la solicitud  
    this.http.post<any[]>('http://localhost:8080/api/service/filter', this.filter)  
      .subscribe(response => {  
        this.services = response;  
      }, error => {  
        console.error('Error applying filters:', error);  
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