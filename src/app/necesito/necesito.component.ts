import { Component, OnInit } from '@angular/core';  
import { Router, ActivatedRoute } from '@angular/router';  
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms';  
import { NecesitoService } from './necesito.service';  
import { Ineed } from '../models/Ineed';  
import { Category, FormField } from '../models/Category';
import { Subcategory } from '../models/Subcategory';  
import { AuthService } from '../services/auth.service';

@Component({  
  selector: 'app-necesito',  
  standalone: true,  
  imports: [CommonModule, FormsModule],  
  templateUrl: './necesito.component.html',  
  styleUrls: ['./necesito.component.css']  
})  
export class NecesitoComponent implements OnInit {  
  userId: number | undefined;  
  titulo: string = '';  
  descripcion: string = '';  
  selectedCategory: Category | null = null;  
  selectedSubcategory: Subcategory | null = null;  
  categories: Category[] = [];  
  subcategories: Subcategory[] = [];  
  ubicacion: string = '';  
  fechaHora: string = '';  
  allowNegotiation: boolean = false;
  presupuesto: number | null = null;  
  successMessage: string = '';  
  errorMessage: string = '';  
  dynamicFormFields: FormField[] = [];
  formData: { [key: string]: any } = {};

  constructor(private route: ActivatedRoute, private router: Router, private necesitoService: NecesitoService,
    private authService: AuthService
  ) {}  

  ngOnInit(): void {  
    this.route.queryParams.subscribe(params => {  
      this.userId = this.authService.userId;
      console.log('User ID recibido en NecesitoComponent:', this.userId);  
    });  
    this.cargarCategorias();  
  }  

  cargarCategorias() {  
    this.necesitoService.obtenerCategorias().subscribe(  
      response => {  
        this.categories = response;  
      },  
      error => {  
        console.error('Error al obtener categorías', error);  
      }  
    );  
  }  

  onCategoryChange() {
    if (this.selectedCategory) {
      console.log('Categoría seleccionada:', this.selectedCategory); // Log para depuración
      console.log('Formulario de la categoría:', this.selectedCategory?.formulario);
      this.subcategories = this.selectedCategory.subcategories;
      try {
        const parsedForm = JSON.parse(this.selectedCategory.formulario);
        this.dynamicFormFields = parsedForm.campos;
        this.formData = {};
        this.dynamicFormFields.forEach(field => {
          this.formData[field.clave] = field.requerido ? "" : null;
        });
      } catch (e) {
        console.error('Error parseando formulario:', e);
        this.dynamicFormFields = [];
        this.formData = {};
      }
    } else {
      this.subcategories = [];  
      this.selectedSubcategory = null;
      this.dynamicFormFields = [];
      this.formData = {};
    }
  }


  onCategoryChangeId() {  
    if (this.selectedCategory) {  
      this.necesitoService.obtenerSubcategoriasPorCategoriaId(this.selectedCategory.id).subscribe(  
        (subcategories) => {  
          this.subcategories = subcategories;  
        },  
        (error) => {  
          console.error('Error al obtener subcategorías', error);  
          this.subcategories = []; // Resetea si hay un error  
        }  
      );  
    } else {  
      this.subcategories = [];  
      this.selectedSubcategory = null;  
    }  
  }  

  enviarNecesidad() {  
    const necesidad: Ineed = {  
        titulo: this.titulo,  
        formularioData: JSON.stringify(this.formData), // Convertir a JSON string
        descripcion: this.descripcion,  
        category: this.selectedCategory ? { id: this.selectedCategory.id } : null, // Usar objeto de categoría  
        subcategory: this.selectedSubcategory ? { id: this.selectedSubcategory.id } : null, // Usar objeto de subcategoría  
        latitude: this.ubicacion ? parseFloat(this.ubicacion.split(',')[0].split(':')[1].trim()) : 0,
        longitude: this.ubicacion ? parseFloat(this.ubicacion.split(',')[1].split(':')[1].trim()) : 0,
        fechaHora: this.fechaHora,
        allowNegotiation: this.allowNegotiation,
        presupuesto: this.presupuesto,  
        userId: this.userId!  
    };  

     // ✅ Aquí capturas lo que vas a enviar
  console.log('Datos que se enviarán al backend:', necesidad);

  // Opcional: Para ver el JSON con formato legible
  console.log('Datos en formato JSON:', JSON.stringify(necesidad, null, 2));

    this.necesitoService.publicarNecesidad(necesidad).subscribe({  
        next: () => {  
            this.successMessage = '¡Gracias! Su necesidad ha sido publicada y pronto un profesional se pondrá en contacto con usted.';  
            this.resetForm();  
        },  
        error: (error) => {  
            this.errorMessage = 'Ocurrió un error al publicar su necesidad. Por favor, inténtelo nuevamente.';  
            console.error('Error al publicar la necesidad', error);  
        }  
    });  
}

  resetForm() {  
    this.titulo = '';  
    this.descripcion = '';  
    this.selectedCategory = null;  
    this.selectedSubcategory = null;  
    this.ubicacion = '';  
    this.fechaHora = '';  
    this.allowNegotiation = false;
    this.presupuesto = null;  
    this.successMessage = '';  
    this.errorMessage = '';  
  }  

  obtenerUbicacion() {  
    if (navigator.geolocation) {  
      navigator.geolocation.getCurrentPosition((position) => {  
        const lat = position.coords.latitude;  
        const lon = position.coords.longitude;  
        // Aquí puedes usar un servicio de geocodificación para obtener la dirección  
        this.ubicacion = `Lat: ${lat}, Lon: ${lon}`; // Solo un ejemplo  
      }, (error) => {  
        alert('No se pudo obtener la ubicación. Asegúrate de que los permisos están habilitados.');  
      });  
    } else {  
      alert('Geolocalización no está soportada en este navegador.');  
    }  
  }  

  onFileChange(event: any) {  
    const files = event.target.files;  
    // Procesar los archivos si es necesario  
    console.log('Archivos seleccionados:', files);  
  }  
}