


import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
// import { environment } from '../../environments/environment';

export interface Restaurant {
  restaurantId?: number;
  name: string;
  city: string;
  area: string;
  open: boolean;
  createdAt?: Date;
  ownerId?: number;
}

export interface OwnerProfile {
  ownerId: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: number;
}

@Injectable({
  providedIn: 'root'
})
export class OwnerService {
  private apiUrl = 'http://localhost:8082';

  constructor(private http: HttpClient) {}

  // Get owner's profile
  getOwnerProfile(ownerId: number): Observable<OwnerProfile> {
    return this.http.get<OwnerProfile>(`${this.apiUrl}/owner/get-details-by-id/${ownerId}`)
      .pipe(catchError(this.handleError));
  }

  // Get all restaurants for owner
  getOwnerRestaurants(ownerId: number): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/restaurant/get-restaurant-details/${1}`)
      .pipe(
        map(restaurants => restaurants.map(restaurant => ({
          ...restaurant,
          createdAt: restaurant.createdAt ? new Date(restaurant.createdAt) : new Date()
        }))),
        catchError(this.handleError)
      );
  }

  // Add new restaurant
  addRestaurant(ownerId: number, restaurantData: Omit<Restaurant, 'ownerId' | 'createdAt'>): Observable<Restaurant> {
    const request = {
      ...restaurantData,
      ownerId
    };
    
    return this.http.post<Restaurant>(`${this.apiUrl}/add-restaurant`, request)
      .pipe(catchError(this.handleError));
  }

  // Update restaurant status (open/closed)
  updateRestaurantStatus(restaurantId: number, status: boolean): Observable<Restaurant> {

    return this.http.post<Restaurant>(`${this.apiUrl}/restaurant/toggle-open-status/${status ? 1 : 0}/${restaurantId}`, {})
      .pipe(catchError(this.handleError));
  }

  // Update restaurant details
  updateRestaurant(restaurantId: number, restaurantData: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.apiUrl}/update-restaurant/${restaurantId}`, restaurantData)
      .pipe(catchError(this.handleError));
  }

  // Delete restaurant
  deleteRestaurant(restaurantId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/restaurant/delete/restaurant/${restaurantId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Owner Service Error:', error);
    
    let errorMessage = 'An error occurred. Please try again.';
    
    if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.status === 404) {
      errorMessage = 'Restaurant not found.';
    } else if (error.status === 400) {
      errorMessage = 'Invalid data provided.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
