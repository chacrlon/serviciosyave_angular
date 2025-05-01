import { Injectable } from '@angular/core';  
import { BehaviorSubject, Observable } from 'rxjs';  

@Injectable({  
  providedIn: 'root'  
})  
export class LocationService {  
  private locationSubject = new BehaviorSubject<{ latitude: number; longitude: number } | null>(null);  
  location$ = this.locationSubject.asObservable();  

  setLocation(latitude: number, longitude: number) {  
    this.locationSubject.next({ latitude, longitude });  
  }
  
  get location(): Observable<any> {
    return this.locationSubject.asObservable();
  }
}