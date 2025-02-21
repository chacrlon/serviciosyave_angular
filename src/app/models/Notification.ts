export interface Notification {  
  id: number;  
  userId: number;
  message: string;  
  read: boolean;  
  userId2: number; 
  vendorServiceId?: number;
}