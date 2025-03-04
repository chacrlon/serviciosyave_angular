import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JsonPipe } from '@angular/common';
import { NecesitoService } from '../../necesito/necesito.service';
import { NegotiationService } from '../../negotiation-modal/service/negotiation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dialog-counteroffer',
  standalone: true,
  imports: [FormsModule, JsonPipe],
  templateUrl: './dialog-counteroffer.component.html',
  styleUrls: ['./dialog-counteroffer.component.css'] // Este es el archivo CSS automáticamente asociado 
})
export class DialogCounterOfferComponent implements OnInit {

  public dataIneedResponse: any;

  constructor(
    public dialogRef: MatDialogRef<DialogCounterOfferComponent>,  
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
      negotiationStatus: 0,
      amount: this.data.amount,
      ineedId: this.data.ineedId,
      justification: this.data.justification,
      receiverUserId: this.token.userId,
      senderUserId: this.data.senderId
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
      receiverUserId: this.token.userId,
      senderUserId: this.data.senderId
    }
    this.negotiationService.updateNegotiation(payload).subscribe({
      next: (response) => { this.dialogRef.close() },
      error: (err) => { alert(err.error); }
    })
  }

}