// src/app/register/register.service.ts  

import { Injectable } from '@angular/core';  
import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { User } from '../models/user'; // Ajusta según tu modelo de usuario  

@Injectable({  
  providedIn: 'root'  
})  
export class RegisterService {  
  private apiUrl = 'http://localhost:8080/register'; // Ajusta según la URL de tu backend  

  private httpOptions = {  
    headers: new HttpHeaders({  
      'Content-Type': 'application/json'  
    })  
  };  

  constructor(private http: HttpClient) {}  

  register(user: User): Observable<User> {  
    return this.http.post<User>(`${this.apiUrl}/register`, user, this.httpOptions);  
  }  

  verifyUser(id: number, verificationCode: string): Observable<any> {  
    // Agregamos el verificationCode como un parámetro de consulta  
    return this.http.get(`${this.apiUrl}/code/${id}`, {  
      params: {  
        verificationCode: verificationCode  // Envia 'verificationCode' como parámetro  
      },  
      headers: this.httpOptions.headers  
    });  
  }  
}