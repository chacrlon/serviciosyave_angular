import { Injectable, NgZone } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { BehaviorSubject, Observable, Subject } from 'rxjs';  
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogCounterOfferComponent } from '../../components/dialog-counteroffer/dialog-counteroffer.component';

@Injectable({  
  providedIn: 'root'  
})  
export class NegotiationService {

  private readonly baseUrl = 'http://localhost:8080/';  
  private eventSource: EventSource | null = null;
  private notification$: BehaviorSubject<any>= new BehaviorSubject<any>(null);  

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private token: AuthService,
    private dialog: MatDialog
  ) {}

  public negotiation(payload: any): Observable<any> {
    return this.http.post(this.baseUrl+"api/negotiations/getNegotiation", payload);
  }

  public createNegotiation(negotiationData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}api/negotiations`, negotiationData);
  }

  public updateNegotiation(negotiationData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}api/negotiations/update`, negotiationData);
  }

  public connectToSSE(): Observable<any> {  
    if (this.eventSource) {  
      this.disconnectSSE();  
    }

    return new Observable((observer) => {  
      // this.eventSource = new EventSource(`${this.baseUrl}/notifications`);  
      this.eventSource = new EventSource(`${this.baseUrl}sse/subscribe/${this.token.userId}`); 
      this.eventSource.onopen = (event) => {  
        console.log('Conexión SSE establecida', event);  
      };

      this.eventSource?.addEventListener('negotiation', (event: any) => {
        this.ngZone.run(() => {  
          try {  
            const data = JSON.parse(event.data);  
            console.log('Notificación SSE recibida:', data);  
            this.notification$.next(data);  
            observer.next(data); // Emitir la notificación al observer  
          } catch (error) {  
            console.error('Error al procesar notificación SSE:', error);  
            observer.error(error); // Pasar el error al observer  
          }  
        });
      });

      this.eventSource.onerror = (error) => {  
        console.error('Error en conexión SSE:', error);  
        this.eventSource?.close();  

        // Pasar el error al observer  
        this.ngZone.run(() => { 
          // Reintentar conexión después de 5 segundos  
          this.disconnectSSE();
          setTimeout(() => {
            console.log('Reintentando conexión SSE...');  
            this.connectToSSE().subscribe((observer) => {
                  const dialogRef = this.dialog.open(DialogCounterOfferComponent, {  
                    data: observer,
                    width: '400px',
                    disableClose: true
                  });
            }); // Manejar reconexión
          }, 5000); 
          observer.error(error);  
        });
      };

      // Cerrar conexión al cancelar la suscripción  
      // return () => {  
      //   this.eventSource?.close();  
      // };  
    });  
  }  

  public disconnectSSE(): void {
    if (this.eventSource) {
      console.log('Cerrando conexión SSE');
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  get notifications$(): Observable<any> {  
    return this.notification$.asObservable();  
  }

}