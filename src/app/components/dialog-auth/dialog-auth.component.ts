import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user';
import Swal from 'sweetalert2';
import { SharingDataService } from '../../services/sharing-data.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dialog-auth.component.html',
  styleUrls: ['./dialog-auth.component.css'] // Este es el archivo CSS automáticamente asociado 
})
export class DailogAuthComponent {

  user: User;

  constructor(
    public dialogRef: MatDialogRef<DailogAuthComponent>,  
    private sharingData: SharingDataService
  ) {
    this.user = new User();
  }

  onSubmit() {
    if (!this.user.username || !this.user.password) {
      Swal.fire(
        'Error de validacion',
        'Username y password requeridos!',
        'error'
      );
    } else {
      this.sharingData.onlyLoginEventEmitter.emit({ username: this.user.username, password: this.user.password });
      this.dialogRef.close(true);
    }
  }
}
