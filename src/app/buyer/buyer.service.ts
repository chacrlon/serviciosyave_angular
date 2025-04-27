import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { Observable, catchError, throwError } from 'rxjs';  

@Injectable({  
  providedIn: 'root'  
})  
export class BuyerService {  
  private apiUrl = 'http://localhost:8080/api/service';  

  constructor(private http: HttpClient) {}  

  public vendorServiceById(id: number): Observable<any> {  
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(  
      catchError(this.handleError)  
    );  
  }  

  private handleError(error: any) {  
    console.error('Ha ocurrido un error:', error);  
    return throwError(() => new Error('Error en la solicitud; por favor, intenta de nuevo más tarde.'));  
  }  
}