import { Component } from '@angular/core';  
import { Router } from '@angular/router';  
import { FormsModule } from '@angular/forms'; // Importar FormsModule

@Component({  
  selector: 'app-role-selection',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './role-selection.component.html',
  styleUrl: './role-selection.component.css' 
})  
export class RoleSelectionComponent {  
  constructor(private router: Router) {}  

  selectRole(role: string) {  
    if (role === 'buyer') {  
      this.router.navigate(['/buyer']);  
    } else if (role === 'seller') {  
      this.router.navigate(['/seller']);  
    }  
  }  
}