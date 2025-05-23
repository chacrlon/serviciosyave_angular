// Definición de la interfaz original  
export interface Ineed {  
  id?: number;  
  titulo: string;  
  descripcion: string;  
  //formularioData?: { [key: string]: any };
  formularioData?: string; // Cambia de object a string
  category: { id: number } | null;
  subcategory: { id: number } | null;
  latitude: number;
  longitude: number
  fechaHora: string;  
  allowNegotiation?: boolean;
  presupuesto: number | null;  
  userId: number;  
}  
