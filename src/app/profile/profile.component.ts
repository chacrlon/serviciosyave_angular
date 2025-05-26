import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { latLng, tileLayer } from 'leaflet';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LeafletModule ],
})
export class ProfileComponent implements OnInit {
  
  userId: number | null = null;
  currentStep: number = 1;
  totalSteps: number = 2;
  registrationForm!: FormGroup;
  registrationSuccess: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  subcategories: any[] = [];
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

   mapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      })
    ],
    zoom: 12,
    center: latLng(10.4806, -66.9036) // Coordenadas iniciales (Caracas)
  };

  selectedLatitude: number | null = null;
  selectedLongitude: number | null = null;
  // Método para capturar clics en el mapa
  onMapClick(event: any): void {
    this.selectedLatitude = event.latlng.lat;
    this.selectedLongitude = event.latlng.lng;
    this.cdr.detectChanges();
  }


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.userId;
    if (!this.userId) this.router.navigate(['/login']);
    this.buildForm();
    this.loadSubcategories();
  }

  ngAfterViewInit(): void {
  if (this.currentStep === 1) {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize')); // Fuerza redibujado del mapa
    }, 300);
  }
}

  buildForm(): void {
    this.registrationForm = this.fb.group({
      // Paso 1: Verificación
      fullName: ['', Validators.required],
      dniFrontName: ['', Validators.required],
      dniBackName: ['', Validators.required],
      selfieName: ['', Validators.required],
      profilePicture: ['', Validators.required],
      coverageRadius: [5, Validators.required], // Campo nuevo

      // Paso 2: Información Profesional
      profession: ['', Validators.required],
      yearsOfExperience: [0, [Validators.required, Validators.min(0)]],
      skillsDescription: ['', Validators.required],
      universityTitleName: ['', Validators.required],
      certificationsNames: [[]],
      selectedSubcategories: [[], Validators.required] // Campo nuevo
    });
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1: 
        return !!(
          this.selectedLatitude !== null &&
          this.selectedLongitude !== null &&
          this.registrationForm.get('coverageRadius')?.valid
        );
        
      case 2: 
        return !!(
          this.registrationForm.get('selectedSubcategories')?.valid &&
          this.registrationForm.get('universityTitleName')?.valid
        );
        
      default: 
        return false;
    }
  }

  loadSubcategories(): void {
  this.http.get('http://localhost:8080/api/subcategories').subscribe({
    next: (res: any) => this.subcategories = res,
    error: (err) => console.error('Error cargando subcategorías', err)
  });
}

toggleSubcategory(subcategoryId: number): void {
  const selected = this.registrationForm.get('selectedSubcategories')?.value;
  const index = selected.indexOf(subcategoryId);
  
  if (index > -1) {
    selected.splice(index, 1);
  } else {
    selected.push(subcategoryId);
  }
}

  
  nextStep(): void {
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  previousStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  subcategoriesList: any[] = []; // Cargar desde API

onSubcategoryChange(event: any, subcategoryId: number): void {
  const selected = this.registrationForm.get('selectedSubcategories')?.value;
  
  if (event.target.checked) {
    selected.push(subcategoryId);
  } else {
    const index = selected.indexOf(subcategoryId);
    if (index > -1) selected.splice(index, 1);
  }
  
  this.registrationForm.get('selectedSubcategories')?.setValue(selected);
}

  onFileSelected(event: any, field: string): void {
    const files = event.target.files;
    if (!files) return;

    if (field === 'galleryImages' && files.length === 0) {
      this.galleryImages = [];
      this.galleryImageUrls = [];
      this.registrationForm.get('galleryImagesNames')?.setValue([]);
      return;
    }

    if (['certifications', 'galleryImages'].includes(field)) {
      const fileList = Array.from(files) as File[];
      Promise.all(fileList.map(file => this.convertFileToBase64(file)))
        .then(base64Files => {
          if (field === 'certifications') {
            this.certifications = fileList;
            this.registrationForm.get('certificationsNames')?.setValue(base64Files);
          } else {
            this.galleryImages = fileList;
            this.galleryImageUrls = fileList.map(file => URL.createObjectURL(file));
            this.registrationForm.get('galleryImagesNames')?.setValue(base64Files);
          }
          this.cdr.detectChanges();
        });
    } else {
      const file = files[0];
      this.convertFileToBase64(file).then(base64 => {
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
      });
    }
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }

  saveProfile(): void {
    this.markFormGroupTouched(this.registrationForm);
    if (this.registrationForm.invalid) {
      this.errorMessage = 'Revise los campos obligatorios';
      return;
    }

    const sellerData = {
      ...this.registrationForm.value,
      user: {id: this.userId},
       latitude: this.selectedLatitude,
    longitude: this.selectedLongitude,
    serviceArea: 'Generado automáticamente', // Lo calcula el backend
    status: 'PENDIENTE',
      createdAt: new Date().toISOString()
    };

    this.sendToBackend(sellerData);
  }

  private sendToBackend(data: any): void {
    this.isLoading = true;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.token}`
    });

    this.http.post('http://localhost:8080/api/sellers/register', data, { headers })
      .subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) this.markFormGroupTouched(control);
    });
  }

  private handleSuccess(): void {
    this.registrationSuccess = true;
    this.isLoading = false;
    setTimeout(() => this.router.navigate(['/dashboard']), 1500);
  }

  private handleError(error: any): void {
    this.isLoading = false;
    this.errorMessage = this.getErrorMessage(error);
    if (error.status === 403) this.router.navigate(['/login']);
  }

  private getErrorMessage(error: any): string {
    type ErrorCode = 400 | 403 | 409 | 500;
    const status: ErrorCode = [400, 403, 409, 500].includes(error.status) 
      ? error.status 
      : 500;

    const messages: Record<ErrorCode | number, string> = {
      400: 'Error en los datos enviados',
      403: 'Autenticación requerida',
      409: 'El perfil ya existe',
      500: 'Error del servidor'
    };

    return messages[status] || 'Error desconocido';
  }
}