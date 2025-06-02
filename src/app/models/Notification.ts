export interface Notification {
  ineedId?: any;  
  id: number;  
  userId: number;
  message: string;  
  read: boolean;  
  userId2: number; 
  userType: string;
  vendorServiceId?: number ;
  id2: number; 
  type: string;
  status: string;  
  amount: number | null;
  paymentId: number;
   createdAt: Date;
}