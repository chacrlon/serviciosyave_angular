export class Verification {  
  isEmailVerified: string;  

  constructor(verificationCode: string) {  
      this.isEmailVerified = verificationCode;  
  }  
}