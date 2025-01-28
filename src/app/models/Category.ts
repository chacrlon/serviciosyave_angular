// models/Category.ts  
import { Subcategory } from './Subcategory';  

export class Category {  
    id: number;  
    name: string;  
    subcategories: Subcategory[] = []; 
    constructor() {   
        this.id = 0;  
        this.name = '';  
        this.subcategories = [];
    }  
}