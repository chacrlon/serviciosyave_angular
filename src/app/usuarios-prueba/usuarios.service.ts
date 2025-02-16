import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { Observable } from 'rxjs';  

@Injectable({  
    providedIn: 'root',  
})  
export class UsuariosService {  
    private apiUrl = 'http://localhost:8080/api/usuarios'; 

    constructor(private http: HttpClient) {}  

    // Crear usuario  
    createUsuario(usuario: { nombre: string; apellido: string; edad: number; genero: string }): Observable<any> {  
        return this.http.post<any>(`${this.apiUrl}`, usuario);  
    }  

    // Obtener todos los usuarios  
    getAllUsuarios(): Observable<Array<{ id: number; nombre: string; apellido: string; edad: number; genero: string }>> {  
        return this.http.get<Array<{ id: number; nombre: string; apellido: string; edad: number; genero: string }>>(`${this.apiUrl}`);  
    }  

    // Actualizar usuario por ID  
    updateUsuario(id: number, usuario: { nombre: string; apellido: string; edad: number; genero: string }): Observable<any> {  
        return this.http.put<any>(`${this.apiUrl}/${id}`, usuario);  
    }  

    // Eliminar usuario por ID  
    deleteUsuario(id: number): Observable<void> {  
        return this.http.delete<void>(`${this.apiUrl}/${id}`);  
    }  
}