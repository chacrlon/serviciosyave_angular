import { Component, Inject } from '@angular/core';  
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';  
import { Notification } from '../../models/Notification'; // Importación correcta  

@Component({  
  selector: 'app-notification-modal',  
  standalone: true,  
  templateUrl: './notification-modal.component.html',  
  styleUrls: ['./notification-modal.component.css']  
})  
export class NotificationModalComponent {  
  constructor(  
    public dialogRef: MatDialogRef<NotificationModalComponent>,  
    @Inject(MAT_DIALOG_DATA) public data: Notification // Recibir la notificación como dato  
  ) {}  

  onClose(): void {  
    this.dialogRef.close();  
  }  
}