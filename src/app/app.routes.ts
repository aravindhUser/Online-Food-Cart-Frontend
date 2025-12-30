import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { AllRestaurants } from './all-restaurants/all-restaurants';
import { LoginPage } from './login-page/login-page';
import { RegistrationPageOwner } from './registration-page-owner/registration-page-owner';
import { RegistrationPageUser } from './registration-page-user/registration-page-user';
import { OwnerHomePage } from './owner-home-page/owner-home-page';
import { AddNewRestaurant } from './add-new-restaurant/add-new-restaurant';

export const routes: Routes = [
    { path: '', component: HomePage },
    { path: 'restaurants', component: AllRestaurants },
    { path: 'login' , component: LoginPage },
    { path: 'register-owner',component: RegistrationPageOwner },
    { path: 'register-user', component: RegistrationPageUser },
    { path: 'owner-page',component: OwnerHomePage },
    { path: 'owner-page/addRestaurant',component: AddNewRestaurant },
];
