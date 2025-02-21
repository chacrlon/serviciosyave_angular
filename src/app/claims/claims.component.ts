import { Component, OnInit } from '@angular/core';  
import { Router, ActivatedRoute } from '@angular/router';  
import { LocationService } from '../services/location.service';  
import { MatDialog } from '@angular/material/dialog';    
import { Subscription } from 'rxjs';  
import { CommonModule } from '@angular/common';  
import { ChangeDetectorRef } from '@angular/core';   

interface GeolocationError {  
  code: number;  
  message: string;  
}  

@Component({  
  selector: 'app-claims',  
  standalone: true,  
  templateUrl: './claims.component.html',  
  styleUrls: ['./claims.component.css'],  
  imports: [CommonModule]  
})  
export class ClaimsComponent implements OnInit {  
  
  private subscriptions: Subscription[] = [];  
  
  public claimsId: number | undefined;
  
  constructor(  
    private cdr: ChangeDetectorRef,  
    private router: Router,  
    private locationService: LocationService,  
    private route: ActivatedRoute,  
    private dialog: MatDialog,  
  ) {}  

  ngOnInit(): void {  
    this.subscriptions.push(  
      this.route.paramMap.subscribe(params => {  
        this.claimsId = parseInt(params.get('claimsId') as string);  
        console.log('ID del claims claimsId:', this.claimsId);
      })
    );
  }

  public padStart(char: any) {
    return String(char).padStart(10, "0");
  }
}