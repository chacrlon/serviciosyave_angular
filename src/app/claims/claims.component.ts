import { Component, OnInit } from '@angular/core';  
import { Router, ActivatedRoute } from '@angular/router';  
import { LocationService } from '../services/location.service';  
import { MatDialog } from '@angular/material/dialog';    
import { Subscription } from 'rxjs';  
import { CommonModule } from '@angular/common';  
import { ChangeDetectorRef } from '@angular/core';   
import { ClaimService } from '../services/claim.service';

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
  
  public claimData: any;
  public claimsId: number | undefined;
  public changeFileFlag: boolean = false;
  
  constructor(  
    private cdr: ChangeDetectorRef,  
    private router: Router,  
    private locationService: LocationService,  
    private route: ActivatedRoute,  
    private dialog: MatDialog,
    private claimService: ClaimService
  ) {}  

  ngOnInit(): void {  
    this.subscriptions.push(  
      this.route.paramMap.subscribe(params => {  
        this.claimsId = parseInt(params.get('claimsId') as string);
        this.claimService.getClaim(this.claimsId).subscribe({
          next: (response) => {
            console.log("responseGETCLAIM", response);
            this.claimData = response;
          },
          error: (err) => {

          }
        })
      })
    );
  }

  public padStart(char: any) {
    return String(char).padStart(10, "0");
  }

  public upperCase(char: any): string {
    return char.toString().toUpperCase();
  }

  public onFileChange(event: any) {
    let srcElement = event.srcElement as HTMLInputElement;
    let file: any = srcElement.files;
    console.log("EVENT", file);
    this.changeFileFlag = file.length > 0 ? true : false;
    
  }
}