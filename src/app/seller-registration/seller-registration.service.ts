import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SellerRegistrationService {

  private apiUrl: string = 'http://localhost:8080/api/sellers/register';

  constructor(private http: HttpClient) { }

registerSeller (seller: any): Observable<any> {
  return this.http.post<any>(this.apiUrl, seller);
}
}
