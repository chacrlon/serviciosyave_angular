import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { NotificationsseService } from '../notification-modal/notificationsse.service'; 
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';  
import { NegotiationService } from './service/negotiation.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';
import { Notification } from '../models/Notification';

@Component({
  selector: 'app-negotiation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './negotiation-modal.component.html',
  styleUrls: ['./negotiation-modal.component.css']
})
export class NegotiationModalComponent implements OnInit {
  
  public formGroup: FormGroup = new FormGroup({});
  public showCounterForm = false;
  public counterAmount: number = 0;
  public counterJustification: string = '';
  public negotiationFlag: boolean = false;
  public negotiationData: any;
  public messageError: string | any;



    notifications: Notification[] = [];  
    private subscriptions: Subscription[] = [];

  constructor(
    public dialogRef: MatDialogRef<NegotiationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private negotiationService: NegotiationService,
    private token: AuthService,
    private cdr: ChangeDetectorRef,  

    private notificationsseService: NotificationsseService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if(this.data.isInitialOffer) {
      this.getNegotiation();
    } 
  }

  ngAfterViewInit(): void {

  }

  private initializeForm(): void {
    this.formGroup = new FormGroup({
      counterAmount: new FormControl('', [Validators.required]),
      counterJustification: new FormControl('', [Validators.required, Validators.minLength(1)])
    });
  }

  private getNegotiation() {
    let payload: any = {
      ineedId: this.data.ineedId,
      senderUserId: this.data.userId,
      receiverUserId: this.data.userId2,
      amount: this.counterAmount,
      justification: this.counterJustification
    };

    this.negotiationService.negotiation(payload).subscribe({
      next: (response) => { 
        this.negotiationData = response;
        this.negotiationData.offerCount >= 3 ? this.formGroup.disable() : null
      },
      error: (err) => { this.getError(err) }
    });
  }

  private getError(exception: any) {
    if(exception.status == 400) {
      this.messageError = exception?.error;
    }
  }

  // Agregar validación de entrada
  validateCounterAmount(event: any) {
    const value = parseFloat(event.target.value);
    if (value < 0) {
      this.counterAmount = 0;
    }
  }

  acceptOffer() {
    this.notificationsseService.acceptNegotiation(this.data.id).subscribe({
      next: () => {
        this.dialogRef.close();
      },
      error: (err) => console.error('Error aceptando oferta:', err)
    });
  }

  close() {
    this.dialogRef.close();
  }

  public sendOffer(): void {
    if(!this.data.isInitialOffer) { this.dialogRef.close(this.formGroup.getRawValue()); return;}
    if(this.formGroup.invalid) { return };

    const negotiationData = {
      ineedId: this.data.ineedId,
      senderUserId: this.data.userId,
      receiverUserId: this.data.userId2,
      amount: this.formGroup.get('counterAmount')?.value,
      justification: this.formGroup.get('counterJustification')?.value,
      id: this.negotiationData?.id ?? null,
      negotiationStatus: 0,
      sendId: this.data.userId2
    };

    this.negotiationService.createNegotiation(negotiationData).subscribe({
      next: () => {
        this.dialogRef.close();
      },
      error: (err) => alert(err.error)
    });

  }
}