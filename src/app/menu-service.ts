import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface MenuItem {
  itemId: number;
  restaurantId: number;
  itemName: string;
  price: number;
  estimatedItemsDelivered: number;
  availaible: boolean;
  category: string;
  editing?: boolean;
  tempQuantity?: number;
  deleting?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private baseUrl = 'http://localhost:8083/menu';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Get all menu items for a restaurant
  getMenuItemsByRestaurant(restaurantId: number): Observable<MenuItem[]> {
    const url = `${this.baseUrl}/get-items/restaurant/${restaurantId}`;
    return this.http.get<MenuItem[]>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Search menu items
  searchMenuItems(restaurantId: number, searchTerm: string): Observable<MenuItem[]> {
    const params = new HttpParams()
      .set('restaurantId', restaurantId.toString())
      .set('searchTerm', searchTerm);
    
    return this.http.get<MenuItem[]>(`${this.baseUrl}/search`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Add new menu item
  addMenuItem(menuItem: Partial<MenuItem>, restaurantId: number): Observable<MenuItem> {
    const url = `${this.baseUrl}/add-item/${restaurantId}`;
    console.log('Adding menu item to:', url, menuItem);
    
    return this.http.post<MenuItem>(url, menuItem, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update menu item
  updateMenuItem(menuId: number, menuItem: Partial<MenuItem>): Observable<MenuItem> {
    const url = `${this.baseUrl}/update/${menuId}`;
    return this.http.put<MenuItem>(url, menuItem, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Delete menu item - CORRECTED ENDPOINT
  deleteMenuItem(itemId: number): Observable<any> {
    const url = `${this.baseUrl}/remove/item/${itemId}`;
    console.log('Deleting item from:', url);
    
    return this.http.delete(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update item quantity - CORRECTED ENDPOINT
  updateItemQuantity(itemId: number, estimatedItemsDelivered: number): Observable<MenuItem> {
    const url = `${this.baseUrl}/update/no-of-items-delivered/${itemId}/${estimatedItemsDelivered}`;
    console.log('Updating quantity at:', url);
    
    return this.http.put<MenuItem>(url, {}, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Toggle item availability - CORRECTED ENDPOINT
  toggleItemAvailability(itemId: number, available: boolean): Observable<MenuItem> {
    // Convert boolean to 1/0 as per your backend
    const availabilityValue = available ? 1 : 0;
    const url = `${this.baseUrl}/toggle/availaibility/item/${itemId}/${availabilityValue}`;
    console.log('Toggling availability at:', url);
    
    return this.http.patch<MenuItem>(url, {}, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Error handling
  private handleError(error: any) {
    console.error('MenuService error:', error);
    
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}