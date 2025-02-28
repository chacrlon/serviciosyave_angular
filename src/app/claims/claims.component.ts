import { Component, OnInit } from '@angular/core';  
import { Router, ActivatedRoute } from '@angular/router';  
import { LocationService } from '../services/location.service';  
import { MatDialog } from '@angular/material/dialog';    
import { Subscription } from 'rxjs';  
import { CommonModule } from '@angular/common';  
import { ChangeDetectorRef } from '@angular/core';   
import { ClaimService } from '../services/claim.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { DailogAuthComponent } from '../components/dialog-auth/dialog-auth.component';

interface GeolocationError {  
  code: number;  
  message: string;  
}  

@Component({  
  selector: 'app-claims',  
  standalone: true,  
  templateUrl: './claims.component.html',  
  styleUrls: ['./claims.component.css'],  
  imports: [CommonModule, FormsModule, ReactiveFormsModule]  
})  
export class ClaimsComponent implements OnInit {  
  
  private subscriptions: Subscription[] = [];  
  
  public claimData: any;
  public claimsId: number | undefined;
  public changeFileFlag: string = '';
  public formGroup: FormGroup = new FormGroup({});
  public imageUpload: any = undefined;

  constructor(  
    private cdr: ChangeDetectorRef,  
    private router: Router,  
    private locationService: LocationService,  
    private route: ActivatedRoute,  
    private dialog: MatDialog,
    private claimService: ClaimService,
    private token: AuthService
  ) {}  

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      image: new FormControl(''),
    });

    this.subscriptions.push(  
      this.route.paramMap.subscribe(params => {
        this.claimsId = parseInt(params.get('claimsId') as string);
      })
    );

    if(this.token.token) {
      this.getClaim();
    } else {
      const dialogRef = this.dialog.open(DailogAuthComponent, { 
            width: '400px',  
            disableClose: true  
      });

      dialogRef.afterClosed().subscribe((event) => {
        if(event) { 
          setTimeout(() => {
            this.getClaim()    
          }, 500); 
        }
      })
    }
  }

  ngAfterViewInit() {

  }

  private getClaim() {
    this.claimService.getClaim(this.claimsId).subscribe({
      next: (response: any) => {
        console.log("responseGETCLAIM", response);
        this.claimData = response;
        if(this.token.userId == response?.user.id && response?.claim.voucherUser){ this.imageUpload = "data:image/png;base64,"+response?.claim.voucherUser}
        if(this.token.userId == response?.receiver.id && response?.claim.voucherReceiver){ this.imageUpload = "data:image/png;base64,"+response?.claim.voucherReceiver}
      },
      error: (err) => {

      }
    });
  }

  public padStart(char: any) {
    return String(char).padStart(10, "0");
  }

  public upperCase(char: any): string {
    return char ? char.toString().toUpperCase() : '';
  }

  public onFileChange(event: any) {
    console.log("EVENT", event);
    let target = event.target as HTMLInputElement;
    let file: any = target.files;
    this.changeFileFlag = file.length > 0 ? "load" : "return";

    if(file.length > 0) {
      this.formGroup.get("image")?.setValue(file);

      const formData = new FormData();
            formData.append('file', file[0]);
            formData.append('user', this.token.userId);
            formData.append('claimId', this.claimsId as any);

      this.claimService.patchClaim(formData).subscribe({
        next: (response) => {
          this.changeFileFlag="done";
          this.getClaim();
          console.log("success", response);
        },
        error: (err) => {
          this.changeFileFlag="failed";
          console.log("error",err);
        }
      })
    } else {
      this.changeFileFlag="return";
      return;
    }

  }
}