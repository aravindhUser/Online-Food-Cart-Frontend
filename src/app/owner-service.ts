
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Restaurant {
  restaurantId?: number;
  name: string;
  city: string;
  area: string;
  open: boolean;
  createdAt?: Date | string;
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

  // ---------- OWNER PROFILE ----------
  /**
   * Get owner's profile by ID
   */
  getOwnerProfile(ownerId: number): Observable<OwnerProfile> {
    console.log(ownerId);
    // ✅ Use the provided ownerId (remove hard-coded `2`)
    return this.http.get<OwnerProfile>(`${this.apiUrl}/owner/get-details-by-id/${ownerId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update owner's profile
   * NOTE: Adjust the endpoint to match your backend (PUT vs PATCH and path).
   * Common patterns: /owner/update/{id} or /owner/update-profile
   */
  updateOwnerProfile(profile: OwnerProfile): Observable<OwnerProfile> {
    // Example endpoint using PUT with path param:
    console.log(profile.ownerId);
    return this.http.put<OwnerProfile>(`${this.apiUrl}/owner/update/owner-details/${profile.ownerId}`, profile)
      .pipe(catchError(this.handleError));
  }

  // ---------- RESTAURANTS ----------
  /**
   * Get all restaurants for an owner
   */
  getOwnerRestaurants(ownerId: number): Observable<Restaurant[]> {
    // ✅ Use the provided ownerId (remove hard-coded `1`)
    return this.http.get<Restaurant[]>(`${this.apiUrl}/restaurant/get-restaurant-details/${ownerId}`)
      .pipe(
        map(restaurants => restaurants.map(restaurant => ({
          ...restaurant,
          createdAt: restaurant.createdAt ? new Date(restaurant.createdAt) : new Date()
        }))),
        catchError(this.handleError)
      );
  }

  /**
   * Add a new restaurant under the owner
   */
  addRestaurant(ownerId: number, restaurantData: Omit<Restaurant, 'ownerId' | 'createdAt'>): Observable<Restaurant> {
    const request = { ...restaurantData, ownerId };
    return this.http.post<Restaurant>(`${this.apiUrl}/add-restaurant`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Toggle restaurant open/closed status
   */
  updateRestaurantStatus(restaurantId: number, status: boolean): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.apiUrl}/restaurant/toggle-open-status/${status ? 1 : 0}/${restaurantId}`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Update restaurant details
   */
  updateRestaurant(restaurantId: number, restaurantData: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.apiUrl}/update-restaurant/${restaurantId}`, restaurantData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete a restaurant
   */
  deleteRestaurant(restaurantId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/restaurant/delete/restaurant/${restaurantId}`)
      .pipe(catchError(this.handleError));
  }

  // ---------- ERROR HANDLING ----------
  private handleError(error: HttpErrorResponse) {
    console.error('Owner Service Error:', error);

    let errorMessage = 'An error occurred. Please try again.';
    if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found.';
    } else if (error.status === 400) {
      errorMessage = 'Invalid data provided.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
