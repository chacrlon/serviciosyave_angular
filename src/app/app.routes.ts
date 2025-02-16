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
import { PaymentComponent } from './payment-component/payment-component.component';
import { NotificationModalComponent } from './notification-modal/notification-modal.component';
import { ChatComponent } from './chat/chat.component';
import { NecesitoComponent } from './necesito/necesito.component';
import { MoneyNowComponent } from './money-now/money-now.component';
import { ChatContactComponent } from './chat-contact/chat-contact.component';
import { FaqComponent } from './faq/faq.component';
import { FooterComponent } from './footer/footer.component';
import { CodeVerifyComponent } from './register/code-verify/code-verify.component';
<<<<<<< HEAD
import { UsuariosPruebaComponent } from './usuarios-prueba/usuarios-prueba.component';
=======
import { HomeComponent } from './home/home.component';
>>>>>>> aee239079cf933dff031d24ec28b4fed48cca422

export const routes: Routes = [
    {
        path: 'users/page/0',
        component: UserComponent 
    },
    { 
        path: 'moneynow', 
        component: MoneyNowComponent 
    },
    {
        path: 'necesito',
        component: NecesitoComponent
    },  
    {   
        path: 'chat/:userId/:receiverId', 
        component: ChatComponent   
    },
    {   
        path: 'chat/invite',
        component: ChatContactComponent
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
        canActivate: [authGuard]
    },  
    { 
        path: 'register-service', 
        component: RegisterServiceComponent 
    },
    {  
        path: 'categories',  
        component: CategorySubcategoryComponent,  
        canActivate: [authGuard]
    },
    {  
        path: 'payments',
        component: PaymentComponent,
        canActivate: [authGuard] // Agregar guardia si es necesario  
    },  
    {  
        path: 'faq',
        component: FaqComponent,
    },
    {  
        path: 'footer',
        component: FooterComponent,
    },
    {  
        path: 'app-code-verify',
        component: CodeVerifyComponent,
    },
    {  
<<<<<<< HEAD
        path: 'app-usuarios-prueba',
        component: UsuariosPruebaComponent,
    },

=======
        path: 'home',
        component: HomeComponent,
    },
    {  
        path: '',
        component: HomeComponent,
    },
    
>>>>>>> aee239079cf933dff031d24ec28b4fed48cca422
    

];
