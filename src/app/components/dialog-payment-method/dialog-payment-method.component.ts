import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, JsonPipe } from '@angular/common';
import { NegotiationService } from '../../negotiation-modal/service/negotiation.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { NotificationsseService } from '../../notification-modal/notificationsse.service';
import { PaymentService } from '../../payment-component/paymentService';

@Component({
  selector: 'app-dialog-payment-method',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, JsonPipe],
  templateUrl: './dialog-payment-method.component.html',
  styleUrls: ['./dialog-payment-method.component.css'] // Este es el archivo CSS automáticamente asociado 
})
export class DialogPaymentMethodComponent implements OnInit {

  public formGroup: FormGroup = new FormGroup({});
  public showCounterForm = false;
  public counterAmount: number = 0;
  public counterJustification: string = '';
  public negotiationFlag: boolean = false;
  public negotiationData: any;
  public messageError: string | any;
  public flowView: string = 'initial'; 
  public steps = [
    { title: 'Pago Móvil', isOpen: false, currency: 'bolivares', value: 'pagoMovil' },
    { title: 'Transferencia Bancaria', isOpen: false, currency: 'bolivares', value: 'transferenciaBancaria' },
    { title: 'Binance', isOpen: false, currency: 'usdt', value: 'binance' }
  ];
  private currency: string | undefined;
  private selectedPaymentMethod: string | undefined;

  notifications: Notification[] = [];  
  private subscriptions: Subscription[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogPaymentMethodComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private negotiationService: NegotiationService,
    private token: AuthService,
    private cdr: ChangeDetectorRef,  
    private paymentService: PaymentService,
    private notificationsseService: NotificationsseService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeSteps();
    this.initializeForm();
    if(this.data.isInitialOffer) {
      this.getNegotiation();
    } 
  }

  ngAfterViewInit(): void {

  }

  private initializeSteps(): void {
    const steps = document.querySelectorAll('.step');

    steps.forEach(step => {
        const header = step.querySelector('.step-header');
        const content = step.querySelector('.step-content');

        header?.addEventListener('click', () => {
            steps.forEach(s => {
                if (s !== step) {
                    s.classList.remove('active');
                }
            });
            step.classList.toggle('active');
        });
    });
  }

  private initializeForm(): void {
    this.formGroup = new FormGroup({
      reference: new FormControl('', []),
      email: new FormControl('', [Validators.email]),
      numberAccount: new FormControl('', []),
      phone: new FormControl('', [])
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

  public donePay(): void {
    this.flowView = 'paytowin';
  }

  toggleStep(step: any) {
    this.steps.forEach((s, index) => {
      if (s !== step) {
        s.isOpen = false;
      } else {
        this.steps[index].isOpen = !step.isOpen;
        this.currency = this.steps[index].currency;
        this.selectedPaymentMethod=this.steps[index].value;
      }
    });
  }

  public back(): void {
    this.flowView = 'initial';
  }

  public pay(): void {
    const paymentPayload: any = {
      monto: this.data.presupuestoInicial,
      divisa: this.currency,
      metodoPago: this.selectedPaymentMethod,
      ineedId: this.data.ineedId,
      receiverId: this.data.userId2,
      referencia: this.formGroup.get('reference')?.value,
      estatus: 'procesando'
    };
  
    // Agregar campos específicos según el método de pago
    if (this.selectedPaymentMethod === 'pagoMovil') {
      paymentPayload.telefono = this.formGroup.get('reference')?.value;
    } else if (this.selectedPaymentMethod === 'transferenciaBancaria') {
      paymentPayload.numeroCuenta = this.formGroup.get('numberAccount')?.value;
    } else if (this.selectedPaymentMethod === 'binance') {
      paymentPayload.emailBinance = this.formGroup.get('email')?.value;
    }

    this.paymentService.createPayment(paymentPayload)
      .subscribe(response => {
        console.log('Pago procesado exitosamente:', response);
        this.dialog.closeAll();
      }, error => {
        console.error('Error al procesar el pago:', error);
      });
  }
}