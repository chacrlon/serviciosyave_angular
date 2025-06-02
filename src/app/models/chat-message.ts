export interface ChatMessage {  
    message: string;  
    sender: string;  
    receiver: string;  
    user: string;
    vendorServiceId?:number | null;
    ineedId?: number | null;
    userType?: string | null;
    paymentId?: number | null;
}