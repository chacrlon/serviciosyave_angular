import { Component, Inject } from '@angular/core';  
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';    
import { Notification } from '../models/Notification';  
import { Router } from '@angular/router';  

@Component({  
  selector: 'app-notification-modal',  
  standalone: true,  
  templateUrl: './notification-modal.component.html',  
  styleUrls: ['./notification-modal.component.css']  
})  
export class NotificationModalComponent {  

  constructor(  
    public dialogRef: MatDialogRef<NotificationModalComponent>,  
    @Inject(MAT_DIALOG_DATA) public data: Notification,  
    private router: Router  
  ) {  
    console.log('Datos de NotificationModalComponent:', this.data);   
  }  

  onClose(): void {  
    this.dialogRef.close();  
  }  

  contactUser(): void {  
    const receiverId = this.data.userId2;  
    // Navegar correctamente con los parámetros como segmentos de la URL  
    this.router.navigate(['/chat', this.data.userId, receiverId]);  
    this.dialogRef.close();   
  }  
}