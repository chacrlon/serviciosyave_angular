import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { BuyerComponent } from "../buyer/buyer.component";

@Component({
  selector: 'dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BuyerComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userId: number | null = null;
  profileUserId: number | null = null; // ID del perfil que se está viendo
  isOwner: boolean = false; // Indica si el usuario actual es el dueño del perfil
  registrationForm!: FormGroup;
  registrationSuccess: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  // Archivos
  profilePicture: File | null = null;
  profilePictureUrl: string | null = null;
  galleryImages: File[] = [];
  galleryImageUrls: string[] = [];


  dataProfile: any;

  public rating: number = 0;
  public stars: number[] = [1, 2, 3, 4, 5];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.userId; // ID del usuario autenticado
    // this.profileUserId = this.getProfileUserIdFromRoute(); // Obtener el ID del perfil desde la ruta

    if (!this.userId) {
      this.router.navigate(['/login']); // Redirigir al login si no hay usuario autenticado
    }

    // Verificar si el usuario actual es el dueño del perfil
    this.isOwner = this.userId === this.profileUserId;

    this.buildForm();
    this.loadProfileData(); // Cargar los datos del perfil
  }

  private getProfileUserIdFromRoute(): number | null {
    // Obtener el ID del perfil desde la ruta
    const profileId = this.route.snapshot.paramMap.get('id');
    return profileId ? +profileId : null;
  }

  private buildForm(): void {
    this.registrationForm = this.fb.group({
      fullName: ['', Validators.required], // Nombre completo
      skillsDescription: ['', Validators.required], // Descripción del servicio
      profilePicture: [''], // Foto de perfil en Base64
      galleryImagesNames: [[]], // Lista de imágenes de galería en Base64
    });
  }

  private loadProfileData(): void {
    // Llamar al backend para obtener los datos del perfil
    this.http.get(`http://localhost:8080/api/sellers/seller/${this.userId}`).subscribe({
      next: (data: any) => {
        this.registrationForm.patchValue(data); // Rellenar el formulario con los datos del perfil
        this.profilePictureUrl = data.profilePicture ? `data:image/jpeg;base64,${data.profilePicture}` : null;
        this.galleryImageUrls = data.galleryImagesNames.map((img: string) => `data:image/jpeg;base64,${img}`);
        this.rating = data.user.rating;
        this.dataProfile = data;
      },
      error: (error) => {
        console.error('Error al cargar el perfil:', error);
      }
    });
  }

  // Método para manejar la selección de archivos
  onFileSelected(event: any, field: string): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (field === 'galleryImages') {
        const fileList = Array.from(files) as File[];
        Promise.all(fileList.map((file) => this.convertFileToBase64(file)))
          .then((base64Files) => {
            this.galleryImages = fileList;
            this.galleryImageUrls = fileList.map((file) => URL.createObjectURL(file));
            this.registrationForm.get('galleryImagesNames')?.setValue(base64Files);
            this.cdr.detectChanges();
          })
          .catch((error) => {
            console.error('Error al convertir archivos a Base64:', error);
          });
      } else {
        const file = files[0] as File;
        this.convertFileToBase64(file)
          .then((base64) => {
            this.profilePicture = file;
            this.profilePictureUrl = URL.createObjectURL(file);
            this.registrationForm.get('profilePicture')?.setValue(base64);
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

  // Método para guardar los cambios
  saveProfile(): void {
    if (this.registrationForm.invalid) {
      this.errorMessage = 'Revise los campos marcados.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const sellerData = {
      ...this.registrationForm.value,
      userId: this.userId,
    };

    const token = this.authService.token;

    if (!token) {
      this.errorMessage = 'No se encontró el token de autenticación. Por favor, inicie sesión nuevamente.';
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http.post('http://localhost:8080/api/sellers/update', sellerData, { headers }).subscribe({
      next: () => {
        this.registrationSuccess = true;
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/dashboard', this.userId]), 1500);
      },
      error: (error) => {
        console.error('Error completo:', error);
        this.isLoading = false;
        this.handleError(error);
      },
    });
  }

  // Método para manejar errores
  private handleError(error: any): void {
    this.errorMessage = 'Error al guardar los cambios. Por favor, inténtalo de nuevo.';
  }

  getStarClass(index: number): string {
    const floorRating = Math.floor(this.rating);
    const decimalPart = this.rating - floorRating;

    if (index < floorRating) {
      return 'bi-star-fill';
    } else if (index === floorRating) {
      if (decimalPart >= 0.75 && decimalPart > 5) {
        return 'bi-star-fill';
      } else if (decimalPart >= 0.25) {
        return 'bi-star-half';
      }
    }
    return 'bi-star';
  }

}