import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  constructor(private http: HttpClient ) { }

  public getExchangeRate(): Observable<number> {
    return this.http.get<number>('http://localhost:8080/api/currency/dolar') as Observable<number>;
  }

}