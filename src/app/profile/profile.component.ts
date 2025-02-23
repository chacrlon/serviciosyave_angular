import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userId: number | null = null;
  registrationForm!: FormGroup; // Formulario reactivo
  registrationSuccess: boolean = false; // Estado de éxito
  errorMessage: string = ''; // Mensaje de error
  isLoading: boolean = false; // Estado de carga

  // Variables para manejar archivos
  profilePicture: File | null = null;
  profilePictureUrl: string | null = null; // URL de la foto de perfil
  galleryImages: File[] = [];
  galleryImageUrls: string[] = []; // URLs de las imágenes de la galería

  constructor(
    private fb: FormBuilder, // FormBuilder para el formulario reactivo
    private http: HttpClient, // HttpClient para las peticiones HTTP
    private router: Router, // Router para redireccionar
    private cdr: ChangeDetectorRef // ChangeDetectorRef para manejar cambios en la vista
  ) {}

  ngOnInit(): void {
    //this.userId = this.authService.getUserId();
    this.buildForm(); // Construir el formulario al inicializar
  }

  // Construir el formulario reactivo
  buildForm(): void {
    this.registrationForm = this.fb.group({
      fullName: ['', Validators.required],
      idNumber: ['', Validators.required],
      gender: ['', Validators.required],
      profession: ['', Validators.required],
      yearsOfExperience: [0, [Validators.required, Validators.min(0)]],
      skillsDescription: ['', Validators.required],
      profilePicture: [''], // Opcional
      galleryImages: [''] // Opcional
    });
  }

  // Método para generar una URL temporal para las imágenes
  getImageUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  // Método para manejar la subida de la foto de perfil
  onProfilePictureChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.profilePicture = file;
      this.profilePictureUrl = this.getImageUrl(file); // Generar y almacenar la URL
      this.cdr.detectChanges(); // Notificar a Angular que debe verificar la vista
    }
  }

  // Método para manejar la subida de imágenes a la galería
  onGalleryImagesChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.galleryImages = Array.from(files);
      this.galleryImageUrls = this.galleryImages.map(file => this.getImageUrl(file)); // Generar y almacenar las URLs
      this.cdr.detectChanges(); // Notificar a Angular que debe verificar la vista
    }
  }

  // Método para enviar los datos al backend
  saveProfile(): void {
    if (this.registrationForm.valid) {
      this.isLoading = true; // Activar el estado de carga
      this.errorMessage = ''; // Limpiar mensajes de error anteriores

      const formData = new FormData();

      // Agregar los campos del formulario al FormData
      formData.append('fullName', this.registrationForm.get('fullName')?.value);
      formData.append('idNumber', this.registrationForm.get('idNumber')?.value);
      formData.append('gender', this.registrationForm.get('gender')?.value);
      formData.append('profession', this.registrationForm.get('profession')?.value);
      formData.append('yearsOfExperience', this.registrationForm.get('yearsOfExperience')?.value);
      formData.append('skillsDescription', this.registrationForm.get('skillsDescription')?.value);

      // Agregar la foto de perfil si existe
      if (this.profilePicture) {
        formData.append('profilePicture', this.profilePicture);
      }

      // Agregar las imágenes de la galería
      if (this.galleryImages && this.galleryImages.length > 0) {
        this.galleryImages.forEach((image, index) => {
          formData.append('galleryImages', image); // Usar el mismo nombre que en el backend
        });
      }


  // Verificar si el perfil ya existe
  this.http.get(`http://localhost:8080/api/sellers/${this.userId}`).subscribe({
    next: (existingProfile) => {
      // Si el perfil existe, actualizarlo
      this.http.put(`http://localhost:8080/api/sellers/${this.userId}`, formData).subscribe({
        next: (response) => {
          console.log('Perfil actualizado exitosamente', response);
          this.registrationSuccess = true;
          this.isLoading = false;
          setTimeout(() => {
            this.router.navigate(['/categories']);
          }, 1500);
        },
        error: (error) => {
          console.error('Error al actualizar el perfil', error);
          this.handleError(error);
        }
      });
    },
    error: (error) => {
      if (error.status === 404) {
        // Si el perfil no existe, crearlo
        this.http.post('http://localhost:8080/api/sellers/register', formData).subscribe({
          next: (response) => {
            console.log('Perfil guardado exitosamente', response);
            this.registrationSuccess = true;
            this.isLoading = false;
            setTimeout(() => {
              this.router.navigate(['/categories']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error al guardar el perfil', error);
            this.handleError(error);
          }
        });
      } else {
        this.handleError(error);
      }
    }
  });
} else {
  this.errorMessage = 'Por favor, complete todos los campos requeridos correctamente.';
}
}

handleError(error: any): void {
this.registrationSuccess = false;
this.isLoading = false;

if (error.status === 400) {
  this.errorMessage = 'Hay errores en los datos ingresados. Revise el formulario.';
} else if (error.status === 409) {
  this.errorMessage = 'El email ya está registrado. Por favor, use otro.';
} else if (error.status === 500) {
  this.errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
} else {
  this.errorMessage = 'Error al registrar el perfil. Por favor, inténtalo de nuevo.';
}
}

  // Método para cancelar y redirigir
  cancel(): void {
    this.router.navigate(['/role-selection']); // Ajusta la ruta según tu aplicación
  }

  // Getter para acceder fácilmente a los controles del formulario
  get form() {
    return this.registrationForm.controls;
  }
}