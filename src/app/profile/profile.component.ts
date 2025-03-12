import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service'; // Asegúrate de importar el servicio

@Component({
  selector: 'profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {
  userId: number | undefined; 
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
    private token: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.token.userId;// Obtener el ID del usuario autenticado
    console.log('ID de Usuario desde el componente RoleSelectionComponent:', this.userId); 
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
      
      // Step 2
      profession: ['', Validators.required],
      yearsOfExperience: [0, [Validators.required, Validators.min(0)]],
      skillsDescription: ['', Validators.required],
      modalities: this.fb.group({
        presencial: [false],
        online: [false],
        hibrido: [false]
      }),
      
      // Step 3
      universityTitle: [''],
      
      // Step 4 (galería)
      galleryImages: ['']
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
    const file = event.target.files[0];
    if (file) {
      switch(field) {
        case 'profilePicture':
          this.profilePicture = file;
          this.profilePictureUrl = URL.createObjectURL(file);
          break;
        case 'dniFront':
          this.dniFront = file;
          this.dniFrontUrl = URL.createObjectURL(file);
          break;
        case 'dniBack':
          this.dniBack = file;
          this.dniBackUrl = URL.createObjectURL(file);
          break;
        case 'selfie':
          this.selfie = file;
          this.selfieUrl = URL.createObjectURL(file);
          break;
        case 'universityTitle':
          this.universityTitle = file;
          break;
        case 'certifications':
          this.certifications = Array.from(event.target.files);
          break;
        case 'galleryImages':
          this.galleryImages = Array.from(event.target.files);
          this.galleryImageUrls = this.galleryImages.map(file => URL.createObjectURL(file));
          break;
      }
      this.cdr.detectChanges();
    }
  }

  saveProfile(): void {
    // Verificación de formulario inválido
    if (this.registrationForm.invalid) {
      console.log('Formulario inválido. Errores:', this.registrationForm.errors);
      this.errorMessage = 'Revise los campos marcados.';
      return;
    }
  
    if (this.registrationForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
  
      // Logs de depuración
      console.log('Form Data:', this.registrationForm.value);
      console.log('User ID:', this.userId);
      console.log('Archivos:', {
        profilePicture: this.profilePicture,
        dniFront: this.dniFront,
        dniBack: this.dniBack,
        selfie: this.selfie,
        universityTitle: this.universityTitle,
        certifications: this.certifications.length,
        galleryImages: this.galleryImages.length
      });
  
      const formData = new FormData();
      const modalitiesForm = this.registrationForm.get('modalities')?.value;
      const selectedModalities = Object.keys(modalitiesForm).filter(key => modalitiesForm[key]);
      
      Object.keys(this.registrationForm.value).forEach(key => {
        if (key === 'modalities') {
          formData.append(key, JSON.stringify(selectedModalities));
        } else {
          formData.append(key, this.registrationForm.get(key)?.value);
        }
      });
  
      // Verificación de FormData
      formData.forEach((value, key) => {
        console.log('FormData entry:', key, value);
      });
  
      // Archivos
      if (this.profilePicture) formData.append('profilePicture', this.profilePicture);
      if (this.dniFront) formData.append('dniFront', this.dniFront);
      if (this.dniBack) formData.append('dniBack', this.dniBack);
      if (this.selfie) formData.append('selfie', this.selfie);
      if (this.universityTitle) formData.append('universityTitle', this.universityTitle);
      this.certifications.forEach((cert, index) => formData.append(`certification_${index}`, cert));
      this.galleryImages.forEach((img, index) => formData.append(`gallery_${index}`, img));
      
      formData.append('userId', this.userId?.toString() || '');
  
      // Llamada al backend
      this.http.post('http://localhost:8080/api/sellers/register', formData).subscribe({
        next: (response) => {
          this.registrationSuccess = true;
          this.isLoading = false;
          setTimeout(() => this.router.navigate(['/role-selection']), 1500);
        },
        error: (error) => {
          console.error('Error completo:', error);
          console.error('Mensaje del servidor:', error.error?.message);
          this.isLoading = false;
          this.handleError(error);
        }
      });
    } else {
      this.errorMessage = 'Por favor, complete todos los campos requeridos correctamente.';
    }
  }

  // Método para manejar errores
  private handleError(error: any): void {
    this.registrationSuccess = false;
    this.isLoading = false;

    if (error.status === 400) {
      this.errorMessage = 'Hay errores en los datos ingresados. Revise el formulario.';
    } else if (error.status === 409) {
      this.errorMessage = 'El perfil ya existe. Por favor, actualice la información.';
    } else if (error.status === 500) {
      this.errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
    } else {
      this.errorMessage = 'Error al registrar el perfil. Por favor, inténtalo de nuevo.';
    }
  }
}

