import { Injectable } from '@angular/core';  
import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { User } from '../models/user';  
import { Verification } from '../models/verification'; // Importa el nuevo modelo  

@Injectable({  
  providedIn: 'root'  
})  
export class RegisterService {  
  private apiUrl = 'http://localhost:8080/register';  

  private httpOptions = {  
    headers: new HttpHeaders({  
      'Content-Type': 'application/json'  
    })  
  };  

  constructor(private http: HttpClient) {}  

  register(user: User): Observable<User> {  
    return this.http.post<User>(`${this.apiUrl}/register`, user, this.httpOptions);  
  }  

  verifyUser(id: number, verificationCode: string): Observable<string> {  
    const body = new Verification(verificationCode);  
    return this.http.post(`${this.apiUrl}/code/${id}`, body, { responseType: 'text' });  
}
}