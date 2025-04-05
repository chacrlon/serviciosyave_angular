import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
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
    this.userId = this.authService.userId;
    if (!this.userId) this.router.navigate(['/login']);
    this.buildForm();
  }

  buildForm(): void {
    this.registrationForm = this.fb.group({
      // Paso 1
      fullName: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(18)]],
      birthdate: ['', Validators.required],
      idNumber: ['', Validators.required],
      gender: ['', Validators.required],
      city: ['', Validators.required],
      profilePicture: ['', Validators.required],

      // Paso 2
      profession: ['', Validators.required],
      yearsOfExperience: [0, [Validators.required, Validators.min(0)]],
      skillsDescription: ['', Validators.required],
      modalities: this.fb.group({
        presencial: [false],
        online: [false]
      }, { validators: this.atLeastOneCheckboxChecked() }),

      // Paso 3
      dniFrontName: ['', Validators.required],
      dniBackName: ['', Validators.required],
      selfieName: ['', Validators.required],
      universityTitleName: ['', Validators.required],
      certificationsNames: [[]],

      // Paso 4 (Opcional)
      galleryImagesNames: [[]]
    });
  }

  private atLeastOneCheckboxChecked(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control as FormGroup;
      const hasSelection = Object.values(group.controls).some(control => control.value);
      return hasSelection ? null : { atLeastOneRequired: true };
    };
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1: return !!(
        this.registrationForm.get('fullName')?.valid &&
        this.registrationForm.get('age')?.valid &&
        this.registrationForm.get('birthdate')?.valid &&
        this.registrationForm.get('profilePicture')?.valid
      );
      
      case 2: return !!(
        this.registrationForm.get('profession')?.valid &&
        this.registrationForm.get('skillsDescription')?.valid &&
        this.registrationForm.get('modalities')?.valid
      );
      
      case 3: return !!(
        this.registrationForm.get('dniFrontName')?.valid &&
        this.registrationForm.get('dniBackName')?.valid &&
        this.registrationForm.get('selfieName')?.valid &&
        this.registrationForm.get('universityTitleName')?.valid
      );
      
      case 4: return true;
      
      default: return false;
    }
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  previousStep(): void {
    if (this.currentStep > 1) this.currentStep--;
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

    const modalities = Object.keys(this.registrationForm.get('modalities')?.value)
      .filter(k => this.registrationForm.get(`modalities.${k}`)?.value);

    const sellerData = {
      ...this.registrationForm.value,
      modalities,
      userId: this.userId,
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