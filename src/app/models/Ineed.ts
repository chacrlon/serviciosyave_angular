// Definición de la interfaz original  
export interface Ineed {  
  id?: number;  
  titulo: string;  
  descripcion: string;  
  category: { id: number } | null;
  subcategory: { id: number } | null;
  ubicacion: string;  
  fechaHora: string;  
  allowNegotiation?: boolean;
  presupuesto: number | null;  
  userId: number;  
}  
