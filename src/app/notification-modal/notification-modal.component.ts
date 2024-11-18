import { Component, Inject } from '@angular/core';  
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';    
import { Notification } from '../models/Notification';  

@Component({  
  selector: 'app-notification-modal',  
  standalone: true,  
  templateUrl: './notification-modal.component.html',  
  styleUrls: ['./notification-modal.component.css']  
})  
export class NotificationModalComponent {  

  constructor(  
    public dialogRef: MatDialogRef<NotificationModalComponent>,  
    @Inject(MAT_DIALOG_DATA) public data: Notification  
) {  
    console.log('Datos de NotificationModalComponent:', this.data); // Verifica que data tenga el mensaje  
    if (this.data) {  
        console.log('Mensaje de NotificationModalComponent:', this.data.message); // Verifica el mensaje  
    } else {  
        console.error('No se recibieron datos en el modal');  
    }  
}

  onClose(): void {  
    this.dialogRef.close();  
  }   
}