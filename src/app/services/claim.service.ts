import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {

  private url: string = 'http://localhost:8080/api/';

  constructor(private http: HttpClient) { }

  getClaim(payload: any): Observable<any[]> {
    return this.http.post<any[]>(this.url+"claims/getClaim", {claimId: payload});
  }

}