import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-seller-registration',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './seller-registration.component.html',
  styleUrl: './seller-registration.component.css'
})
export class SellerRegistrationComponent {

  profilePicture: File | null = null;  
  yearsOfExperience: number | null = null;  
  serviceDescription: string = '';  
  certification: File | null = null;  

  constructor(private dialogRef: MatDialogRef<SellerRegistrationComponent>) {}  

  onSubmit(): void {  
    // Aquí puedes manejar la lógica para enviar los datos al backend  
    const formData = new FormData();  
    if (this.profilePicture) formData.append('profilePicture', this.profilePicture);  
    if (this.certification) formData.append('certification', this.certification);  
    formData.append('yearsOfExperience', this.yearsOfExperience?.toString() || '');  
    formData.append('serviceDescription', this.serviceDescription);  

    // Cerrar el modal después de enviar los datos  
    this.dialogRef.close(formData);  
  }  

  onCancel(): void {  
    this.dialogRef.close(); // Cierra el modal cuando se hace clic en "Atrás"  
  }  

  onFileChange(event: any, type: 'profile' | 'certification') {  
    const file = event.target.files[0];  
    if (type === 'profile') {  
      this.profilePicture = file;  
    } else if (type === 'certification') {  
      this.certification = file;  
    }  
  }  
}  


