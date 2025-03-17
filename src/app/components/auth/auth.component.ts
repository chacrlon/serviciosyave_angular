import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Importa RouterModule
import { User } from '../../models/user';
import Swal from 'sweetalert2';
import { SharingDataService } from '../../services/sharing-data.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, RouterModule], // Agrega RouterModule aquí
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {

  user: User;

  constructor(private sharingData: SharingDataService) {
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
      this.sharingData.handlerLoginEventEmitter.emit({ username: this.user.username, password: this.user.password });
    }
  }
}
