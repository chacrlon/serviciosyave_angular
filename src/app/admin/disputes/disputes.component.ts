import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-disputes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './disputes.component.html',
  styleUrl: './disputes.component.css'
})
export class DisputesComponent {
datos = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', rol: 'Admin', activo: true },
    { id: 2, nombre: 'María García', email: 'maria@example.com', rol: 'Usuario', activo: true },
    { id: 3, nombre: 'Carlos López', email: 'carlos@example.com', rol: 'Editor', activo: false },
    { id: 4, nombre: 'Ana Martínez', email: 'ana@example.com', rol: 'Usuario', activo: true },
    { id: 5, nombre: 'Pedro Sánchez', email: 'pedro@example.com', rol: 'Editor', activo: true }
  ];
}
