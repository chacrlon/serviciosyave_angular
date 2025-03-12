import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { NecesitoService } from '../../necesito/necesito.service';
import { NegotiationService } from '../../negotiation-modal/service/negotiation.service';
import { AuthService } from '../../services/auth.service';
import { NegotiationModalComponent } from '../../negotiation-modal/negotiation-modal.component';
import { DialogPaymentMethodComponent } from '../dialog-payment-method/dialog-payment-method.component';

@Component({
  selector: 'app-dialog-counteroffer',
  standalone: true,
  imports: [FormsModule, CommonModule ],
  templateUrl: './dialog-counteroffer.component.html',
  styleUrls: ['./dialog-counteroffer.component.css'] // Este es el archivo CSS automáticamente asociado 
})
export class DialogCounterOfferComponent implements OnInit {

  public dataIneedResponse: any;

  constructor(
    public dialogRef: MatDialogRef<DialogCounterOfferComponent>,
    private dialog: MatDialog, 
    @Inject(MAT_DIALOG_DATA) public data: any,
    private necesitoService: NecesitoService,
    private negotiationService: NegotiationService,
    private token: AuthService,

  ) { }

  ngOnInit(): void {
    this.getNegotiation();
  }

  private getNegotiation(): void {
    this.necesitoService.obtenerNecesidadPorId(this.data.ineedId).subscribe({
      next: (response) => { this.dataIneedResponse = response; },
      error: (err) => { alert(err.error); }
    })
  }

  public accept() {
    let payload = {
      id: this.data.negotiateId,
      negotiationStatus: 1,
      amount: this.data.amount,
      ineedId: this.data.ineedId,
      justification: this.data.justification,
      receiverUserId: this.token.userId,
      senderUserId: this.data.senderId,
      sendId: this.data.senderId
    }
    this.negotiationService.updateNegotiation(payload).subscribe({
      next: (response) => { this.dialogRef.close() },
      error: (err) => { alert(err.error); }
    })
  }

  public acceptCounterOffer() {
    let payload = {
      id: this.data.negotiateId,
      negotiationStatus: 0,
      amount: this.data.amount,
      ineedId: this.data.ineedId,
      justification: this.data.justification,
      receiverUserId: this.token.userId,
      senderUserId: this.data.senderId,
      sendId: this.data.receiverId
    }
    this.negotiationService.updateNegotiation(payload).subscribe({
      next: (response) => { this.dialogRef.close() },
      error: (err) => { alert(err.error); }
    })
  }

  public denied() {
    let payload = {
      id: this.data.negotiateId,
      negotiationStatus: 2,
      amount: this.data.amount,
      ineedId: this.data.ineedId,
      justification: this.data.justification,
      receiverUserId: this.data.receiverId,
      senderUserId: this.data.receiverId,
      // sendId: this.
    }
    this.negotiationService.updateNegotiation(payload).subscribe({
      next: (response) => { this.dialogRef.close() },
      error: (err) => { alert(err.error); }
    })
  }

  public deniedAccept(): void {
    let payload = {
      id: this.data.negotiateId,
      negotiationStatus: 2,
      amount: this.data.amount,
      ineedId: this.data.ineedId,
      justification: this.data.justification,
      receiverUserId: this.data.receiverId,
      senderUserId: this.data.senderId,
      sendId: this.data.receiverId
    }
    this.negotiationService.updateNegotiation(payload).subscribe({
      next: (response) => { this.dialogRef.close() },
      error: (err) => { alert(err.error); }
    })
  }

  public deniedCounterOffer() {
    let payload = {
      id: this.data.negotiateId,
      negotiationStatus: 2,
      amount: this.data.amount,
      ineedId: this.data.ineedId,
      justification: this.data.justification,
      receiverUserId: this.data.receiverId,
      senderUserId: this.data.senderId,
      sendId: this.data.receiverId
    }
    this.negotiationService.updateNegotiation(payload).subscribe({
      next: (response) => { this.dialogRef.close() },
      error: (err) => { alert(err.error); }
    })
  }

  public deniedActive(): void {
    let payload = {
      id: this.data.negotiateId,
      negotiationStatus: 2,
      amount: this.data.amount,
      ineedId: this.data.ineedId,
      justification: this.data.justification,
      receiverUserId: this.data.receiverId,
      senderUserId: this.data.senderId,
      sendId: this.data.senderId
    }
    this.negotiationService.updateNegotiation(payload).subscribe({
      next: (response) => { this.dialogRef.close() },
      error: (err) => { alert(err.error); }
    })
  }

  public counterOffer() {

    const dialogRefNegotiation = this.dialog.open(NegotiationModalComponent, {
      data: {
        ineedId: this.data.ineedId,
        userId: this.data.receiverId,
        userId2: this.data.senderId,
        currentOffer: this.data.currentOffer,
        isInitialOffer: false,
        presupuestoInicial: this.data.presupuesto,
        titleService: this.data.titulo
      }
    });

    dialogRefNegotiation.afterClosed().subscribe(data => {
      if(data) {

        let payload = {
          id: this.data.negotiateId,
          negotiationStatus: 3,
          amount: data.counterAmount,
          ineedId: this.data.ineedId,
          justification: data.counterJustification,
          receiverUserId: this.data.receiverId,
          senderUserId: this.data.senderId,
          sendId: this.data.senderId
        };
        
        this.negotiationService.updateNegotiation(payload).subscribe({
          next: (response) => { this.dialogRef.close() },
          error: (err) => { alert(err.error); }
        })
      }
    });
  }

  public counterCounterOffer() {

    const dialogRefNegotiation = this.dialog.open(NegotiationModalComponent, {
        data: {
          ineedId: this.data.ineedId,
          userId: this.data.receiverId,
          userId2: this.data.senderId,
          currentOffer: this.data.currentOffer,
          isInitialOffer: false,
          presupuestoInicial: this.data.presupuesto,
          titleService: this.data.titulo
        }
      });

    dialogRefNegotiation.afterClosed().subscribe(data => {
      if(data) {

        let payload = {
          id: this.data.negotiateId,
          negotiationStatus: 4,
          amount: data.counterAmount,
          ineedId: this.data.ineedId,
          justification: data.counterJustification,
          receiverUserId: this.data.receiverId,
          senderUserId: this.data.senderId,
          sendId: this.data.receiverId
        }
        this.negotiationService.updateNegotiation(payload).subscribe({
          next: (response) => { this.dialogRef.close() },
          error: (err) => { alert(err.error); }
        })
      }
    });
}

  public pay(): void {
    const dialogRefPay = this.dialog.open(DialogPaymentMethodComponent, {
      data: {
        ineedId: this.data.ineedId,
        userId: this.data.receiverId,
        userId2: this.data.senderId,
        currentOffer: this.data.currentOffer,
        isInitialOffer: false,
        presupuestoInicial: this.data.presupuesto,
        titleService: this.data.titulo
      }
    });

    dialogRefPay.afterClosed().subscribe(data => {

      if(data) {

        let payload = {
          id: this.data.negotiateId,
          negotiationStatus: 4,
          amount: data.counterAmount,
          ineedId: this.data.ineedId,
          justification: data.counterJustification,
          receiverUserId: this.data.receiverId,
          senderUserId: this.data.senderId,
          sendId: this.data.receiverId
        }
        this.negotiationService.updateNegotiation(payload).subscribe({
          next: (response) => { this.dialogRef.close() },
          error: (err) => { alert(err.error); }
        })
      }
    });
  }

  public ignore(): void {
    this.dialogRef.close();
  }

}