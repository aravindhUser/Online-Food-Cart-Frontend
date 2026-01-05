import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private baseUrl = 'http://localhost:8083/menu';

  constructor(private http: HttpClient) { }

  // Get all menu items for a restaurant
  getMenuItemsByRestaurant(restaurantId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/get-items/restaurant/${restaurantId}`);
  }

  // Search menu items
  searchMenuItems(restaurantId: number, searchTerm: string): Observable<MenuItem[]> {
    const params = new HttpParams()
      .set('restaurantId', restaurantId.toString())
      .set('searchTerm', searchTerm);
    
    return this.http.get<MenuItem[]>(`${this.baseUrl}/search`, { params });
  }

  // Add new menu item
  addMenuItem(menuItem: Partial<MenuItem>, restaurantId: number): Observable<any> {
    console.log('Adding menu item:', menuItem);
    return this.http.post<any>(`${this.baseUrl}/add-item/${restaurantId}`, menuItem);
  }

  // Update menu item
  updateMenuItem(menuId: number, menuItem: Partial<MenuItem>): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.baseUrl}/update/${menuId}`, menuItem);
  }

  // Delete menu item
  deleteMenuItem(menuId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/remove/item/${menuId}`);
  }

  // Update item quantity
  updateItemQuantity(itemId: number, estimatedItemsDelivered: number): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.baseUrl}/update/no-of-items-delivered/${itemId}/${estimatedItemsDelivered}`, {});
  }

  // Toggle item availability
  toggleItemAvailability(itemId: number, available: boolean): Observable<MenuItem> {
    console.log(available);
    return this.http.patch<MenuItem>(`${this.baseUrl}/toggle/availaibility/item/${itemId}/${available}`, {});
  }
}