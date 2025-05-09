// src/app/register/register.component.ts  

import { Component } from '@angular/core';  
import { User } from '../models/user';  
import { RegisterService } from './register.service';  
import { Router } from '@angular/router';  
import { FormsModule, NgForm } from '@angular/forms';  
import Swal from 'sweetalert2';  
import { CommonModule } from '@angular/common'; // Importar CommonModule  

@Component({  
  selector: 'app-register',  
  standalone: true,  
  imports: [FormsModule, CommonModule] ,
  templateUrl: './register.component.html',  
  styleUrls: ['./register.component.css'] // Este es el archivo CSS automáticamente asociado  
})  
export class RegisterComponent {  
  user: User;  

  constructor(private registerService: RegisterService, private router: Router) {  
    this.user = new User();  
  }  

  onSubmit(form: NgForm): void {  
  console.log('Contraseña enviada:', this.user.password);
    this.registerService.register(this.user).subscribe({  
      next: (response) => {  
        Swal.fire('Éxito', 'Usuario registrado correctamente. Verifica tu correo para completar el registro.', 'success');  
        this.router.navigate(['/app-code-verify', { id: response.id }]);  
      },  
      error: (err) => {  
        Swal.fire('Error', 'No se pudo registrar. Inténtalo de nuevo. ' + JSON.stringify(err.error), 'error');  
      }  
    });  
  }  

  onClear(form: NgForm): void {  
    form.reset();  
    this.user = new User();  
  }  
}