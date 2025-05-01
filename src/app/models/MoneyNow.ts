export interface MoneyNow {  
  id: number;  
  titulo: string;  
  descripcion: string;  
  category: { id: number; name: string } | null; // Ahora incluye 'name'  
  subcategory: { id: number; name: string } | null; // Ahora incluye 'name'  
  address: string;  
  fechaHora: string;  
  presupuesto: number | null;  
  userId: number;  
  allowNegotiation?: boolean;
  nearby?: number;
}