import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  username = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.http.post('http://localhost:8080/register/forgot-password', { username: this.username })
      .subscribe({
        next: () => {
          Swal.fire('Éxito', 'Revisa tu correo para restablecer la contraseña', 'success');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          Swal.fire('Error', err.error || 'Error desconocido', 'error');
        }
      });
  }
}
