import { Injectable } from '@angular/core';  
import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Observable, catchError, throwError } from 'rxjs';  
import { Ineed } from '../models/Ineed';  
import { Category } from '../models/Category';   
import { Subcategory } from '../models/Subcategory';  

@Injectable({  
  providedIn: 'root'  
})  
export class NecesitoService {  
  private apiUrl = 'http://localhost:8080/api/ineeds';  
  private categoriesUrl = 'http://localhost:8080/api/categories';   

  constructor(private http: HttpClient) {}  

  public publicarNecesidad(ineed: Ineed): Observable<Ineed> {  
    const headers = new HttpHeaders({  
      'Content-Type': 'application/json'  
    });  
    return this.http.post<Ineed>(this.apiUrl, ineed, { headers }).pipe(  
      catchError(this.handleError)  
    );  
  }  

  public obtenerNecesidades(): Observable<Ineed[]> {  
    return this.http.get<Ineed[]>(this.apiUrl).pipe(  
      catchError(this.handleError)  
    );  
  }  

  public obtenerNecesidadPorId(id: number): Observable<Ineed> {  
    return this.http.get<Ineed>(`${this.apiUrl}/${id}`).pipe(  
      catchError(this.handleError)  
    );  
  }  

  public eliminarNecesidad(id: number): Observable<void> {  
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(  
      catchError(this.handleError)   
    );  
  }  

  public obtenerCategorias(): Observable<Category[]> {  
    return this.http.get<Category[]>(this.categoriesUrl).pipe(  
      catchError(this.handleError)   
    );  
  }  

  public obtenerSubcategoriasPorCategoriaId(categoryId: number): Observable<Subcategory[]> {  
    return this.http.get<Subcategory[]>(`${this.categoriesUrl}/${categoryId}/subcategories`).pipe(  
      catchError(this.handleError)  
    );  
  }  

  private handleError(error: any) {  
    console.error('Ha ocurrido un error:', error);  
    return throwError(() => new Error('Error en la solicitud; por favor, intenta de nuevo más tarde.'));  
  }  
}