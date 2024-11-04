import { Injectable } from '@angular/core';  
import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Observable, BehaviorSubject } from 'rxjs';    
import { tap } from 'rxjs/operators'; // Asegúrate de importar 'tap'  
import { Category } from '../models/Category';  
import { Subcategory } from '../models/Subcategory';  

@Injectable({  
  providedIn: 'root',  
})  
export class CategoryService {  
  private apiUrl = 'http://localhost:8080/api';   
  private categoriesSubject = new BehaviorSubject<Category[]>([]);  
  private subcategoriesSubject = new BehaviorSubject<Subcategory[]>([]);   

  private httpOptions = {  
    headers: new HttpHeaders({  
      'Content-Type': 'application/json'  
    })  
  };  

  constructor(private http: HttpClient) {   
    // Cargar categorías y subcategorías al iniciar el servicio  
    this.loadCategories();  
    this.loadSubcategories();  
  }  

  // Método para obtener un observable de categorías  
  getCategories(): Observable<Category[]> {  
    return this.categoriesSubject.asObservable();  
  }  
  
  // Cargar categorías desde la API  
  private loadCategories(): void {  
    this.http.get<Category[]>(`${this.apiUrl}/categories`).subscribe(data => {  
      this.categoriesSubject.next(data); // Actualiza el BehaviorSubject  
    }, error => {  
      console.error('Error obteniendo categorías', error);  
      this.categoriesSubject.next([]); // En caso de error, emitimos un array vacío  
    });  
  }  

  createCategory(category: Category): Observable<Category> {  
    return this.http.post<Category>(`${this.apiUrl}/categories`, category, this.httpOptions)  
      .pipe(tap(() => this.loadCategories())); // Actualiza la lista después de la creación  
  }  

  updateCategory(id: number, category: Category): Observable<Category> {  
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, category, this.httpOptions)  
      .pipe(tap(() => this.loadCategories())); // Actualiza la lista después de la actualización  
  }  

  deleteCategory(id: number): Observable<void> {  
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`, this.httpOptions)  
      .pipe(tap(() => this.loadCategories())); // Actualiza la lista después de la eliminación  
  }  

  // Método para obtener un observable de subcategorías  
  getSubcategories(): Observable<Subcategory[]> {  
    return this.subcategoriesSubject.asObservable();  
  }  

  // Cargar subcategorías desde la API  
  private loadSubcategories(): void {  
    this.http.get<Subcategory[]>(`${this.apiUrl}/subcategories`).subscribe(data => {  
      this.subcategoriesSubject.next(data); // Actualiza el BehaviorSubject  
    }, error => {  
      console.error('Error obteniendo subcategorías', error);  
      this.subcategoriesSubject.next([]); // En caso de error, emitimos un array vacío  
    });  
  }  

  createSubcategory(subcategory: Subcategory): Observable<Subcategory> {  
    return this.http.post<Subcategory>(`${this.apiUrl}/subcategories/category/${subcategory.categoryId}`, subcategory, this.httpOptions)  
      .pipe(  
          tap((createdSubcategory) => {  
              console.log('Subcategoría creada:', createdSubcategory); // Para depuración  
              this.loadSubcategories(); // Opcional: Actualiza la lista de subcategorías  
          })  
      );   
}

  updateSubcategory(id: number, subcategory: Subcategory): Observable<Subcategory> {  
    return this.http.put<Subcategory>(`${this.apiUrl}/subcategories/${id}`, subcategory, this.httpOptions)  
      .pipe(tap(() => this.loadSubcategories())); // Actualiza la lista después de la actualización  
  }  

  deleteSubcategory(id: number): Observable<void> {  
    return this.http.delete<void>(`${this.apiUrl}/subcategories/${id}`, this.httpOptions)  
      .pipe(tap(() => this.loadSubcategories())); // Actualiza la lista después de la eliminación  
  }  
}