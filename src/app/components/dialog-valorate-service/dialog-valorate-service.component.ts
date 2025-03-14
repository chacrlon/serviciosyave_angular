import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { NecesitoService } from '../../necesito/necesito.service';
import { NegotiationService } from '../../negotiation-modal/service/negotiation.service';
import { AuthService } from '../../services/auth.service';
import { NegotiationModalComponent } from '../../negotiation-modal/negotiation-modal.component';
import { DialogPaymentMethodComponent } from '../dialog-payment-method/dialog-payment-method.component';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-valorate-service',
  standalone: true,
  imports: [FormsModule, CommonModule ],
  templateUrl: './dialog-valorate-service.component.html',
  styleUrls: ['./dialog-valorate-service.component.css'] // Este es el archivo CSS automáticamente asociado 
})
export class DialogValorateServiceComponent implements OnInit {

  public rating: number = 0;
  public stars: number[] = [1, 2, 3, 4, 5];

  constructor(
    public dialogRef: MatDialogRef<DialogValorateServiceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private token: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.rating = this.rating || 0;
  }

  public rate(rating: number) {
    this.rating = rating;
    let payload = {
      rating: rating,
      receiverId: this.data.receiverId
    }
    this.userService.setValorate(payload).subscribe({
      next: (resp) => {
        this.router.navigate(['/role-selection'])
        this.dialogRef.close();
      },
      error: (err) => console.log(err)
    });
  }

  public ignore(): void {
    this.dialogRef.close();
  }

}