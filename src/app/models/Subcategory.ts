// models/Subcategory.ts  
export class Subcategory {  
    id: number;  
    name?: string;  
    categoryId?: number;  
  
    constructor() {  
        this.id = 0;  
        this.name = ''; 
        this.categoryId = 0;  
    }  
  }