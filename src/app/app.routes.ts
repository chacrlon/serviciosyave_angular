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
  

export const routes: Routes = [
    
    {
        path: 'users/page/0',
        component: UserComponent 
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
    }

];
