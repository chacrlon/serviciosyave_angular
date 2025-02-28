import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Seller } from '../models/Seller.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

 private apiUrl: string = 'http://localhost:8080/api/sellers/register';
 
   constructor(private http: HttpClient) { }
 

   // Crear un nuevo perfil de vendedor
   createSeller(seller: Seller): Observable<Seller> {
     return this.http.post<Seller>(this.apiUrl, seller);
   }
 
   // Obtener un perfil de vendedor por ID
   getSellerById(id: number): Observable<Seller> {
     return this.http.get<Seller>(`${this.apiUrl}/${id}`);
   }
 
   // Actualizar un perfil de vendedor existente
   updateSeller(id: number, updatedSeller: Seller): Observable<Seller> {
     return this.http.put<Seller>(`${this.apiUrl}/${id}`, updatedSeller);
   }
 
   // Eliminar un perfil de vendedor por ID
   deleteSeller(id: number): Observable<void> {
     return this.http.delete<void>(`${this.apiUrl}/${id}`);
   }
 
   // Obtener todos los perfiles de vendedores (opcional)
   getAllSellers(): Observable<Seller[]> {
     return this.http.get<Seller[]>(this.apiUrl);
   }
 }
