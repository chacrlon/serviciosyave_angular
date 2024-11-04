// models/Category.ts  
import { Subcategory } from './Subcategory';  

export class Category {  
    id: number;  
    name: string;  
    subcategories: Subcategory[] = []; // Asegúrate de inicializarlo aquí  
    constructor() {   
        this.id = 0;  
        this.name = '';  
        this.subcategories = []; // Inicializar el array  
    }  
}