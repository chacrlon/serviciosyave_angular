import { Component, OnInit } from '@angular/core';  
import { MoneyNowService } from './money-now.service'; 
import { AuthService } from '../services/auth.service';   
import { MoneyNow } from '../models/MoneyNow';  
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  
import { AcceptOfferRequest } from '../models/AcceptOfferRequest'; 
import { MatDialog } from '@angular/material/dialog';
import { NegotiationModalComponent } from '../negotiation-modal/negotiation-modal.component';
import { LocationService } from '../services/location.service';

interface GeolocationError {  
  code: number;  
  message: string;  
}
@Component({  
  selector: 'app-money-now',  
  standalone: true,  
  imports: [CommonModule, FormsModule],
  templateUrl: './money-now.component.html',  
  styleUrls: ['./money-now.component.css']  
})  
export class MoneyNowComponent implements OnInit {  
  necesidades: MoneyNow[] = [];  
  negotiating: boolean = false;
  userId: number; // Asegúrate de obtener este valor del servicio de autenticación
  location: { latitude: number; longitude: number } | null = null;  

  negotiationDetails = {   
    amount: '',   
    justification: '',   
    currentNeccesity: null as MoneyNow | null
  };
  constructor(private dialog: MatDialog, private moneyNowService: MoneyNowService,
    private authService: AuthService,
    private locationService: LocationService,

  ) {
      this.userId = this.authService.userId;
    } 

  ngOnInit(): void {
    this.obtenerUbicacion();
  }  

aceptarOferta(necesidad: MoneyNow): void {
    const request: AcceptOfferRequest = {
      necesidadId: necesidad.id,
      professionalUserId: this.userId
    };

    this.moneyNowService.aceptarOferta(request).subscribe({
      next: (response) => {
        alert('¡Se le ha notificado al usuario para que te contacte!');
        this.cargarNecesidades(this.location);
      },
      error: (err) => {
        alert('Error en el sistema, intentelo luego');
        console.error('Error:', err);
      }
    });
  }


  cargarNecesidades(location: { latitude: number; longitude: number } | null): void {  
    this.moneyNowService.obtenerNecesidades(location).subscribe({  
      next: (data) => {  
        this.necesidades = data;  
      },  
      error: (error) => {  
        console.error('Error al cargar las necesidades:', error);  
      }  
    });  
  }  

  abrirNegociacion(necesidad: MoneyNow): void {
    const dialogRef = this.dialog.open(NegotiationModalComponent, {
      data: {
        type: 'requirement',
        ineedId: necesidad.id,
        userId: this.userId,
        userId2: necesidad.userId,
        currentOffer: 1,
        isInitialOffer: true,
        presupuestoInicial: necesidad.presupuesto,
        titleService: necesidad.titulo
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('El diálogo se cerró');
    });
  } 


  enviarNegociacion(): void {
    if (this.validarNegociacion()) { // Corregir la condición
      const negotiationData = {
        ineedId: this.negotiationDetails.currentNeccesity?.id,
        senderUserId: this.userId,
        receiverUserId: this.negotiationDetails.currentNeccesity?.userId,
        amount: this.negotiationDetails.amount,
        justification: this.negotiationDetails.justification
      };
  
      this.moneyNowService.enviarNegociacion(negotiationData).subscribe({
        next: (res) => {
          this.negotiating = false;
          console.log('Negociación enviada:', res);
        },
        error: (err) => console.error('Error:', err)
      });
    }
  }
 

validarNegociacion(): boolean { // Quitar parámetros
    const amount = this.negotiationDetails.amount;
    const justification = this.negotiationDetails.justification;
    
    if (isNaN(Number(amount))) {  
      alert('Por favor, ingrese un monto válido.');  
      return false;  
    }  
    
    if (Number(amount) <= 0) {
      alert('El monto debe ser mayor a 0.');  
      return false;  
    }
    
    if (justification.length > 20) {  
      alert('La justificación debe tener máximo 20 caracteres.');  
      return false;  
    }  
    
    if (/^\d+$/.test(justification)) {  
      alert('La justificación no puede contener solo números.');  
      return false;  
    }  
    
    return true;  
  }

  obtenerUbicacion(): void {      
    if (!navigator.geolocation) {  
      console.warn('La geolocalización no está soportada:');   
      return;  
    }  

    navigator.geolocation.getCurrentPosition(  
      (position: GeolocationPosition) => {  
        const { latitude: lat, longitude: lon } = position.coords;  
        console.log(`Ubicación obtenida - Latitud: ${lat}, Longitud: ${lon}`);  
        this.locationService.setLocation(lat, lon);
        this.location = { latitude: lat, longitude: lon };
        this.cargarNecesidades(this.location);  
 
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
}