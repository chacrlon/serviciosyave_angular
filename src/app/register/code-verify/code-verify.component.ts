import { Component } from '@angular/core';  
import { ActivatedRoute, Router } from '@angular/router';  
import { RegisterService } from '../register.service';   
import Swal from 'sweetalert2';  
import { FormsModule } from '@angular/forms';  

@Component({  
  selector: 'app-code-verify',  
  standalone: true,  
  imports: [FormsModule],  
  templateUrl: './code-verify.component.html',  
  styleUrls: ['./code-verify.component.css']  
})  
export class CodeVerifyComponent {  
  verificationCode: string = ''; // Almacena el código ingresado por el usuario  
  userId: number = 0;  

  constructor(private route: ActivatedRoute, private router: Router, private registerService: RegisterService) {  
    // Captura el ID del parámetro de la ruta  
    this.route.params.subscribe(params => {  
      this.userId = +params['id']; // Captura el ID del parámetro de la ruta  
    });  
  }  

  onVerifyCode(): void {  
    this.registerService.verifyUser(this.userId, this.verificationCode).subscribe({  
      next: (response) => {  
        Swal.fire('Éxito', response, 'success'); // Aquí también usas el `response` directamente, ya que ahora es texto  
        this.router.navigate(['/login']);   
      },  
      error: (err) => {  
        console.error('Error durante la verificación: ', err);  
        const errorMessage = err.error?.message || err.message;  
        Swal.fire('Error', 'Código de verificación inválido. Detalles: ' + errorMessage, 'error');  
      }  
    });  
}  
}