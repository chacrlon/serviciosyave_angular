import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

interface Seller {
  id: number;
  fullName: string;
  profession: string;
  city: string;
  yearsOfExperience: number;
  createdAt: string;
}

@Component({
  selector: 'app-approve-profiles',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './approve-profiles.component.html',
  styleUrls: ['./approve-profiles.component.scss']
})
export class ApproveProfilesComponent implements OnInit {
  sellers: Seller[] = [];
  isLoading = true;
  displayedColumns: string[] = ['id', 'fullName', 'profession', 'city', 'experience', 'createdAt', 'actions'];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSellers();
  }

  loadSellers(): void {
    this.isLoading = true;
    const API_URL = 'http://localhost:8080/api/sellers';
    
    this.http.get<Seller[]>(API_URL).subscribe({
      next: (data) => {
        this.sellers = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sellers:', error);
        this.isLoading = false;
        this.snackBar.open('Error loading data', 'Close', { duration: 3000 });
      }
    });
  }

  onApprove(sellerId: number): void {
    console.log(`Approve clicked for ${sellerId} (no functionality)`);
  }

  onReject(sellerId: number): void {
    console.log(`Reject clicked for ${sellerId} (no functionality)`);
  }
}