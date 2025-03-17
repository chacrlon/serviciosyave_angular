import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class ProfileComponent implements OnInit {
  userId: number | null = null;
  currentStep: number = 1;
  totalSteps: number = 4;
  registrationForm!: FormGroup;
  registrationSuccess: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  // Archivos
  profilePicture: File | null = null;
  profilePictureUrl: string | null = null;
  dniFront: File | null = null;
  dniFrontUrl: string | null = null;
  dniBack: File | null = null;
  dniBackUrl: string | null = null;
  selfie: File | null = null;
  selfieUrl: string | null = null;
  universityTitle: File | null = null;
  certifications: File[] = [];
  galleryImages: File[] = [];
  galleryImageUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.userId; // Obtener el ID del usuario autenticado
    if (!this.userId) {
      this.router.navigate(['/login']); // Redirigir al login si no hay usuario autenticado
    }
    this.buildForm();
  }

  buildForm(): void {
    this.registrationForm = this.fb.group({
      // Step 1
      fullName: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(18)]],
      birthdate: ['', Validators.required],
      idNumber: ['', Validators.required],
      gender: ['', Validators.required],
      city: ['', Validators.required],
      profilePicture: [''], // Campo para la foto de perfil en Base64

      // Step 2
      profession: ['', Validators.required],
      yearsOfExperience: [0, [Validators.required, Validators.min(0)]],
      skillsDescription: ['', Validators.required],
      modalities: this.fb.group({
        presencial: [false],
        online: [false],
        hibrido: [false],
      }),

      // Step 3
      dniFrontName: [''], // Campo para el DNI frente en Base64
      dniBackName: [''], // Campo para el DNI dorso en Base64
      selfieName: [''], // Campo para la selfie en Base64
      universityTitleName: [''], // Campo para el título universitario en Base64
      certificationsNames: [[]], // Lista de certificaciones en Base64

      // Step 4
      galleryImagesNames: [[]], // Lista de imágenes de galería en Base64
    });
  }

  nextStep(): void {
    if (this.currentStep === 1 && !this.registrationForm.get('fullName')?.valid) return;
    if (this.currentStep === 2 && !this.registrationForm.get('profession')?.valid) return;

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Métodos para manejar archivos
  onFileSelected(event: any, field: string): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (field === 'certifications' || field === 'galleryImages') {
        const fileList = Array.from(files) as File[]; // Tipar explícitamente como File[]
        Promise.all(fileList.map((file) => this.convertFileToBase64(file)))
          .then((base64Files) => {
            if (field === 'certifications') {
              this.certifications = fileList;
              this.registrationForm.get('certificationsNames')?.setValue(base64Files);
            } else if (field === 'galleryImages') {
              this.galleryImages = fileList;
              this.galleryImageUrls = fileList.map((file) => URL.createObjectURL(file));
              this.registrationForm.get('galleryImagesNames')?.setValue(base64Files);
            }
            this.cdr.detectChanges();
          })
          .catch((error) => {
            console.error('Error al convertir archivos a Base64:', error);
          });
      } else {
        const file = files[0] as File; // Tipar explícitamente como File
        this.convertFileToBase64(file)
          .then((base64) => {
            switch (field) {
              case 'profilePicture':
                this.profilePicture = file;
                this.profilePictureUrl = URL.createObjectURL(file);
                this.registrationForm.get('profilePicture')?.setValue(base64);
                break;
              case 'dniFront':
                this.dniFront = file;
                this.dniFrontUrl = URL.createObjectURL(file);
                this.registrationForm.get('dniFrontName')?.setValue(base64);
                break;
              case 'dniBack':
                this.dniBack = file;
                this.dniBackUrl = URL.createObjectURL(file);
                this.registrationForm.get('dniBackName')?.setValue(base64);
                break;
              case 'selfie':
                this.selfie = file;
                this.selfieUrl = URL.createObjectURL(file);
                this.registrationForm.get('selfieName')?.setValue(base64);
                break;
              case 'universityTitle':
                this.universityTitle = file;
                this.registrationForm.get('universityTitleName')?.setValue(base64);
                break;
            }
            this.cdr.detectChanges();
          })
          .catch((error) => {
            console.error('Error al convertir archivo a Base64:', error);
          });
      }
    }
  }

  // Método para convertir un archivo a Base64
  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]; // Extraer solo la parte Base64
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  saveProfile(): void {
    // Marcar todos los campos como "touched" para mostrar errores de validación
    this.markFormGroupTouched(this.registrationForm);

    // Verificar si el formulario es válido
    if (this.registrationForm.invalid) {
      console.log('Formulario inválido. Errores:', this.registrationForm.errors);
      console.log('Estado del formulario:', this.registrationForm.value);
      console.log('Errores por campo:');
      Object.keys(this.registrationForm.controls).forEach((key) => {
        const control = this.registrationForm.get(key);
        if (control?.invalid) {
          console.log(`Campo: ${key}, Errores:`, control.errors);
        }
      });
      this.errorMessage = 'Revise los campos marcados.';
      return;
    }

    // Si el formulario es válido, proceder con el envío
    this.isLoading = true;
    this.errorMessage = '';

    // Crear el objeto Seller con los datos del formulario
    const sellerData = {
      ...this.registrationForm.value,
      userId: this.userId,
      createdAt: new Date().toISOString(), // Fecha de creación
    };

    // Obtener el token JWT del servicio de autenticación
    const token = this.authService.token;

    if (!token) {
      this.errorMessage = 'No se encontró el token de autenticación. Por favor, inicie sesión nuevamente.';
      this.isLoading = false;
      return;
    }

    // Llamada al backend con el token en las cabeceras
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http.post('http://localhost:8080/api/sellers/register', sellerData, { headers }).subscribe({
      next: () => {
        this.registrationSuccess = true;
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/role-selection']), 1500);
      },
      error: (error) => {
        console.error('Error completo:', error);
        console.error('Mensaje del servidor:', error.error?.message);
        this.isLoading = false;
        this.handleError(error);
      },
    });
  }

  // Método para marcar todos los campos del formulario como "touched"
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Método para manejar errores
  private handleError(error: any): void {
    this.registrationSuccess = false;
    this.isLoading = false;

    if (error.status === 400) {
      this.errorMessage = 'Hay errores en los datos ingresados. Revise el formulario.';
    } else if (error.status === 403) {
      this.errorMessage = 'No tiene permisos para realizar esta acción. Por favor, inicie sesión nuevamente.';
      this.router.navigate(['/login']); // Redirigir al login si el token no es válido
    } else if (error.status === 409) {
      this.errorMessage = 'El perfil ya existe. Por favor, actualice la información.';
    } else if (error.status === 500) {
      this.errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
    } else {
      this.errorMessage = 'Error al registrar el perfil. Por favor, inténtalo de nuevo.';
    }
  }
}