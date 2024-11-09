import { Component, Inject } from '@angular/core';  
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';  
import { MatButtonModule } from '@angular/material/button';  
import { CommonModule } from '@angular/common';  

@Component({  
  selector: 'app-notification-modal',  
  standalone: true,  
  imports: [CommonModule, MatDialogModule, MatButtonModule],  
  template: `  
    <h2 mat-dialog-title>Notificación</h2>  
    <mat-dialog-content>  
      <p>{{ data }}</p>  
    </mat-dialog-content>  
    <mat-dialog-actions>  
      <button mat-button mat-dialog-close>Cerrar</button>  
    </mat-dialog-actions>  
  `  
})  
export class NotificationModalComponent {  
  constructor(@Inject(MAT_DIALOG_DATA) public data: string) {}  
}