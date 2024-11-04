import { Component, OnInit, OnDestroy } from '@angular/core';  
import { CategoryService } from './category.service';  
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms';  
import { Category } from '../models/Category';  
import { Subcategory } from '../models/Subcategory';  
import { Subscription } from 'rxjs';  

@Component({  
  selector: 'app-category-subcategory',  
  standalone: true,  
  imports: [CommonModule, FormsModule],  
  templateUrl: './category-subcategory.component.html',  
  styleUrls: ['./category-subcategory.component.css']  
})  
export class CategorySubcategoryComponent implements OnInit, OnDestroy {  
  categories: Category[] = [];  
  subcategories: Subcategory[] = [];  // Para almacenar subcategorías  
  newCategory: Category = new Category();  
  updateCategoryData: Category | null = null;  
  newSubcategory: Subcategory = new Subcategory();  
  updateSubcategoryData: Subcategory | null = null;  
  selectedCategoryId: number | null = null;  
  errorMessage: string = '';  
  private subscriptions: Subscription = new Subscription();  

  constructor(private categoryService: CategoryService) {}  

  ngOnInit(): void {  
    // Cargar categorías y subcategorías al iniciar  
    this.subscriptions.add(  
      this.categoryService.getCategories().subscribe(data => {  
        this.categories = data;  
      }, error => {  
        console.error('Error obteniendo categorías', error);  
      })  
    );  

    this.subscriptions.add(  
      this.categoryService.getSubcategories().subscribe(data => {  
        this.subcategories = data;  
      }, error => {  
        console.error('Error obteniendo subcategorías', error);  
      })  
    );  
  }  

  ngOnDestroy(): void {  
    this.subscriptions.unsubscribe();  
  }  

  addCategory(): void {  
    this.categoryService.createCategory(this.newCategory).subscribe(() => {  
      this.newCategory = new Category();  
    }, error => {  
      console.error('Error creando categoría', error);  
    });  
  }  

  editCategory(category: Category): void {  
    this.updateCategoryData = { ...category };  
  }  

  updateCategory(): void {  
    if (this.updateCategoryData) {  
      this.categoryService.updateCategory(this.updateCategoryData.id!, this.updateCategoryData).subscribe(() => {  
        this.updateCategoryData = null;  
      }, error => {  
        console.error('Error actualizando categoría', error);  
      });  
    }  
  }  

  deleteCategory(id: number): void {  
    this.categoryService.deleteCategory(id).subscribe(() => {}, error => {  
      console.error('Error eliminando categoría', error);  
    });  
  }  

  addSubcategory(): void {  
    if (this.selectedCategoryId !== null && this.newSubcategory.name && this.newSubcategory.name.trim()) {  
        this.newSubcategory.categoryId = this.selectedCategoryId;  

        this.categoryService.createSubcategory(this.newSubcategory).subscribe((createdSubcategory) => {  
            // Actualizar la propiedad subcategories de la categoría correspondiente  
            const category = this.categories.find(cat => cat.id === this.selectedCategoryId);  
            if (category) {  
                category.subcategories.push(createdSubcategory);  
            }  

            this.newSubcategory = new Subcategory();  
        }, error => {  
            console.error('Error creando subcategoría', error);  
        });  
    } else {  
        console.error('Seleccione una categoría y escriba un nombre para la subcategoría');  
    }  
}  

  editSubcategory(subcategory: Subcategory): void {  
    this.updateSubcategoryData = { ...subcategory };  
  }  

  updateSubcategory(): void {  
    if (this.updateSubcategoryData && this.updateSubcategoryData.id) {  
        this.categoryService.updateSubcategory(this.updateSubcategoryData.id, this.updateSubcategoryData).subscribe(() => {  
            const category = this.categories.find(cat =>  
                cat.subcategories && cat.subcategories.some(sub => sub.id === this.updateSubcategoryData!.id) // Afirmación no nula  
            );  

            if (category) {  
                const subcategoryIndex = category.subcategories.findIndex(sub => sub.id === this.updateSubcategoryData!.id);  
                if (subcategoryIndex !== -1) {  
                    const updatedSubcategory: Subcategory = new Subcategory();  
                    updatedSubcategory.id = this.updateSubcategoryData!.id; // Afirmación no nula  
                    updatedSubcategory.name = this.updateSubcategoryData!.name; // Afirmación no nula  
                    updatedSubcategory.categoryId = this.updateSubcategoryData!.categoryId; // Afirmación no nula  

                    category.subcategories[subcategoryIndex] = updatedSubcategory; // Actualiza la subcategoría  
                }  
            }  

            this.updateSubcategoryData = null;  
        }, error => {  
            console.error('Error actualizando subcategoría', error);  
        });  
    } else {  
        console.error('No se puede actualizar la subcategoría. Datos insuficientes.', this.updateSubcategoryData);  
    }  
}

  deleteSubcategory(id: number): void {  
    this.categoryService.deleteSubcategory(id).subscribe(() => {  
        // Actualizar la lista de subcategorías después de eliminar  
        this.categories.forEach(category => {  
            category.subcategories = (category.subcategories || []).filter(s => s.id !== id);  
        });  
    }, error => {  
      console.error('Error eliminando subcategoría', error);  
    });  
  }  
}