import { Routes } from '@angular/router';
import { UserComponent } from './components/user/user.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { AuthComponent } from './components/auth/auth.component';
import { authGuard } from './guards/auth.guard';
import { Forbidden403Component } from './components/forbidden403/forbidden403.component';
import { RegisterComponent } from './register/register.component';
import { RoleSelectionComponent } from './role-selection/role-selection.component';  
import { RegisterServiceComponent } from './register-service/register-service.component';  
import { SellerComponent } from './seller/seller.component';
import { BuyerComponent } from './buyer/buyer.component';
import { CategorySubcategoryComponent } from './category-subcategory/category-subcategory.component';
import { PaymentComponent } from './payment-component/payment-component.component'; // Asegúrate de usar la ruta correcta  
import { NotificationModalComponent } from './notification-modal/notification-modal.component'; // Asegúrate de que la ruta sea correcta 
import { ChatComponent } from './chat/chat.component'; // Asegúrate de importar el componente  

export const routes: Routes = [
    
    {
        path: 'users/page/0',
        component: UserComponent 
    },  
    {   
        path: 'chat/:userId/:receiverId', // Asegúrate de que esto coincida con la forma en que estás pasando los parámetros  
        component: ChatComponent   
    },
    {  
        path: 'notification-modal',  
        component: NotificationModalComponent,  
    },
    {
        path: 'role-selection',
        component: RoleSelectionComponent,
        canActivate: [authGuard] // Protegiendo la ruta  
    },
    {
        path: 'users',
        component: UserComponent,
    },
    {
        path: 'users/page/:page',
        component: UserComponent,
    },
    {
        path: 'users/create', 
        component: UserFormComponent,
        canActivate: [authGuard]
    },
    {
        path: 'users/edit/:id',
        component: UserFormComponent,
        canActivate: [authGuard]
    },
    {
        path: 'login',
        component: AuthComponent
    },
    {  
        path: 'register',  
        component: RegisterComponent 
    },  
    {
        path: 'forbidden',
        component: Forbidden403Component
    },    
    {  
        path: 'buyer',  
        component: BuyerComponent  
    },  
    {  
        path: 'seller',  
        component: SellerComponent,
        canActivate: [authGuard] // Protegiendo la ruta  
    },  
    { 
        path: 'register-service', 
        component: RegisterServiceComponent 
    },
    // Nueva ruta para el componente de categorías y subcategorías  
    {  
        path: 'categories',  
        component: CategorySubcategoryComponent,  
        canActivate: [authGuard] // Si deseas proteger esta ruta  
    },
    // Nueva ruta para el componente de pagos  
    {  
        path: 'payments',  // Puedes ajustar la ruta como necesites  
        component: PaymentComponent,  // Asegúrate de que el nombre sea correcto  
        canActivate: [authGuard] // Agregar guardia si es necesario  
    }  

];
