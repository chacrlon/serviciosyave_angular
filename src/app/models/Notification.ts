export interface Notification {  
  id: number;  
  userId: number;  //
  message: string;  
  read: boolean;  
  userId2: number; // Nuevo campo para el ID del segundo usuario
}