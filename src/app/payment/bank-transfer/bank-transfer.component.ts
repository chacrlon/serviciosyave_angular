import { Component } from '@angular/core';  
import { FormsModule } from '@angular/forms'; // Importar FormsModule

@Component({  
  selector: 'app-bank-transfer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './bank-transfer.component.html',
  styleUrl: './bank-transfer.component.css'  
})  
export class BankTransferComponent {  
  bankTransfer = { account: '', accountHolderName: '', cedula: '' };  

  submit() {  
    console.log('Transferencia Registrada:', this.bankTransfer);  
    // Lógica para gestionar el registro de la transferencia  
  }  
}