import { Component, OnInit } from '@angular/core';  
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';  
import { SellerRegistrationService } from './seller-registration.service';  
import { Router } from '@angular/router';  
import { CommonModule } from '@angular/common'; // Importa CommonModule  

@Component({  
  selector: 'app-seller-registration',  
  standalone: true, // Asegúrate de que esté establecido como componente independiente  
  imports: [ReactiveFormsModule, CommonModule], // Agrega CommonModule a los imports  
  templateUrl: './seller-registration.component.html',  
  styleUrls: ['./seller-registration.component.css']  
})  
export class SellerRegistrationComponent implements OnInit {  

  registrationForm!: FormGroup;  
  registrationSuccess: boolean = false;  
  errorMessage: string = '';  
  isLoading: boolean = false; // Para indicar que está cargando  

  constructor(  
    private fb: FormBuilder,  
    private sellerService: SellerRegistrationService,  
    private router: Router  
  ) { }  

  ngOnInit(): void {  
    this.buildForm();  
  }  

  buildForm(): void {  
    this.registrationForm = this.fb.group({  
      name: ['', Validators.required],  
      email: ['', [Validators.required, Validators.email]],  
      yearsOfExperience: [0, [Validators.required, Validators.min(0)]],  
      serviceDescription: ['', Validators.required],  
      profilePicture: [''] // Opcional, no requerido por defecto  
    });  
  }  

  onSubmit(): void {  
    if (this.registrationForm.valid) {  
      this.isLoading = true; // Indica que la petición está en curso  
      this.errorMessage = ''; // Limpia errores anteriores  

      this.sellerService.registerSeller(this.registrationForm.value).subscribe({  
        next: (response) => {  
          console.log('Registro exitoso', response);  
          this.registrationSuccess = true;  
          // Opcional: Puedes guardar el ID del vendedor registrado en localStorage o similar  
          // localStorage.setItem('sellerId', response.id);  

          // Redirige después de un breve delay para mostrar el mensaje de éxito  
          setTimeout(() => {  
            this.router.navigate(['/categories']); // Ajusta la ruta según tu aplicación  
          }, 1500);  
        },  
        error: (error) => {  
          console.error('Error en el registro', error);  
          this.registrationSuccess = false;  
          this.isLoading = false; // Quita el indicador de carga  

          // Manejo de errores más específico  
          if (error.status === 400) {  
            this.errorMessage = 'Hay errores en los datos ingresados. Revise el formulario.';  
            // Opcional: Puedes iterar por los errores específicos del formulario desde error.error  
          } else if (error.status === 409) {  
            this.errorMessage = 'El email ya está registrado. Por favor, use otro.';  
          } else if (error.status === 500) {  
            this.errorMessage = 'Error interno del servidor. Inténtalo más tarde.';  
          } else {  
            this.errorMessage = 'Error al registrar el vendedor. Por favor, inténtalo de nuevo.';  
          }  
        },  
        complete: () => {  
          this.isLoading = false; // Quita el indicador de carga al finalizar (éxito o error)  
        }  
      });  
    } else {  
      this.errorMessage = 'Por favor, complete todos los campos requeridos correctamente.';  
    }  
  }  

  // Getter para acceder fácilmente a los controles del formulario  
  get form() { return this.registrationForm.controls; }  
}  