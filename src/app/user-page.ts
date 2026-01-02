



import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Restaurant {
  restaurantId: number;
  name: string;
  city: string;
  area: string;
  open: boolean;
}

export interface addNewRestaurant {
  name: string;
  city: string;
  area: string;
  open: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = 'http://localhost:8082/restaurant';
  
  constructor(private http: HttpClient) { }

  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/get-all-available`)
  }


  addRestaurants(restaurant: addNewRestaurant,ownerId: number): Observable<Restaurant[]> {
    console.log('Adding restaurant for ownerId:', ownerId, 'with data:', restaurant);
    return this.http.post<Restaurant[]>(`${this.apiUrl}/add-restaurant-details/${ownerId}`, restaurant);
  }
}