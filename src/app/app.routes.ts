import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { AllRestaurants } from './all-restaurants/all-restaurants';
import { LoginPage } from './login-page/login-page';
import { RegistrationPageOwner } from './registration-page-owner/registration-page-owner';
import { RegistrationPageUser } from './registration-page-user/registration-page-user';
import { OwnerHomePage } from './owner-home-page/owner-home-page';
import { AddNewRestaurant } from './add-new-restaurant/add-new-restaurant';
import { OwnerProfilePage } from './owner-profile-page/owner-profile-page';
import { OwnerMenuPage } from './owner-menu-page/owner-menu-page';
import { CartItemsComponent } from './cart-items/cart-items';

export const routes: Routes = [
    { path: '', component: HomePage },
    { path: 'restaurants', component: AllRestaurants },
    { path: 'login' , component: LoginPage },
    { path: 'register-owner',component: RegistrationPageOwner },
    { path: 'register-user', component: RegistrationPageUser },
    { path: 'owner-page',component: OwnerHomePage },
    {path:'owner/profile',component:OwnerProfilePage},
    { path: 'owner-page/addRestaurant',component: AddNewRestaurant },
    { path: 'owner/menu', component: OwnerMenuPage },
    {path:"cart/items",component:CartItemsComponent}

];
