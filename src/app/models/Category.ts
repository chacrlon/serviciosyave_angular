// models/Category.ts  
import { Subcategory } from './Subcategory';  

export interface FormField {
    tipo: 'text' | 'number' | 'checkbox';
    clave: string;
    etiqueta: string;
    requerido: boolean;
  }
  
export class Category {  
    id: number;  
    name: string;  
    formulario?: any; // Campo nuevo para el JSON
    subcategories: Subcategory[] = []; 
    constructor() {   
        this.id = 0;  
        this.name = '';  
        this.formulario = null;
        this.subcategories = [];
    }  
}