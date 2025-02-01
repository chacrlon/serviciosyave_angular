import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliciesTermsComponent } from './policies-terms.component';

describe('PoliciesTermsComponent', () => {
  let component: PoliciesTermsComponent;
  let fixture: ComponentFixture<PoliciesTermsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliciesTermsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PoliciesTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
