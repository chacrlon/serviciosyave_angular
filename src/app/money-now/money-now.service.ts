import { Injectable } from '@angular/core';  
import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Observable, catchError, throwError } from 'rxjs';  
import { MoneyNow } from '../models/MoneyNow';   
import { Category } from '../models/Category';  
import { Subcategory } from '../models/Subcategory';
import { AcceptOfferRequest } from '../models/AcceptOfferRequest';  

@Injectable({  
  providedIn: 'root'  
})  
export class MoneyNowService {  
  private apiUrl = 'http://localhost:8080/api/ineeds';  
  private apiUrl2 = 'http://localhost:8080/api';  
  private categoriesUrl = 'http://localhost:8080/api/categories';  

  constructor(private http: HttpClient) { }   

  enviarNegociacion(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl2}/negotiations`, data);
  }

  public aceptarOferta(request: AcceptOfferRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/aceptar`, request).pipe(
      catchError(this.handleError)
    );
  }

  public obtenerNecesidades(): Observable<MoneyNow[]> {  
    return this.http.get<MoneyNow[]>(this.apiUrl).pipe(  
      catchError(this.handleError)  
    );  
  }  

  public obtenerNecesidadPorId(id: number): Observable<MoneyNow> {  
    return this.http.get<MoneyNow>(`${this.apiUrl}/${id}`).pipe(  
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