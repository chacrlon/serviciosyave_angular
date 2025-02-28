import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationsseService } from '../notification-modal/notificationsse.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  

@Component({
  selector: 'app-negotiation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './negotiation-modal.component.html',
  styleUrls: ['./negotiation-modal.component.css']
})
export class NegotiationModalComponent {
  showCounterForm = false;
  counterAmount: number = 0;
  counterJustification: string = '';

  constructor(
    public dialogRef: MatDialogRef<NegotiationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notificationsService: NotificationsseService
  ) {}
  
    // Agregar validación de entrada
    validateCounterAmount(event: any) {
      const value = parseFloat(event.target.value);
      if (value < 0) {
        this.counterAmount = 0;
      }
    }

  toggleCounterForm() {
    this.showCounterForm = !this.showCounterForm;
    if (!this.showCounterForm && this.counterAmount) {
      this.sendCounterOffer();
    }
  }

  sendCounterOffer() {
    const negotiationData = {
      ineedId: this.data.ineedId,
      senderUserId: this.data.userId,
      receiverUserId: this.data.userId2,
      amount: this.counterAmount,
      justification: this.counterJustification
    };

    this.notificationsService.sendCounterOffer(negotiationData).subscribe({
      next: () => {
        this.dialogRef.close();
      },
      error: (err) => console.error('Error enviando contraoferta:', err)
    });
  }

  acceptOffer() {
    this.notificationsService.acceptNegotiation(this.data.id).subscribe({
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
    
  }
}