import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  newPassword = '';
  isTokenValid = false;
  token: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'];
    this.validateToken();
  }

  validateToken() {
    this.http.get(`http://localhost:8080/api/users/validate-reset-token?token=${this.token}`)
      .subscribe({
        next: () => this.isTokenValid = true,
        error: () => this.isTokenValid = false
      });
  }

  onSubmit() {
    this.http.post('http://localhost:8080/api/users/reset-password', {
      token: this.token,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Contraseña actualizada', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        Swal.fire('Error', err.error || 'Error al cambiar contraseña', 'error');
      }
    });
  }
}