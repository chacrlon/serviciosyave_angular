// models/ParsedCategory.ts
import { FormField } from './Category';  // Asegúrate que la ruta sea correcta
import { Subcategory } from './Subcategory';  // Asegúrate que la ruta sea correcta

export interface ParsedCategory {
    id: number;
    name: string;
    parsedFormulario: FormField[];
    subcategories: Subcategory[];
}