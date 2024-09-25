import { Component } from '@angular/core';  
import { FormsModule } from '@angular/forms'; // Importar FormsModule

@Component({  
  selector: 'app-binance',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './binance.component.html',
  styleUrl: './binance.component.css'
})  
export class BinanceComponent {  
  binance = { email: '' };  

  submit() {  
    console.log('Binance Registrado:', this.binance);  
    // Lógica para gestionar el registro en Binance  
  }  
}