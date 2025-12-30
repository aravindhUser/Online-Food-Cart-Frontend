

import { Component, OnInit } from '@angular/core';
import { Restaurant, RestaurantService } from '../user-page';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { Restaurant, RestaurantService } from './restaurant.service';

@Component({
  selector: 'app-all-restaurants',
  imports: [CommonModule,FormsModule],
  templateUrl: './all-restaurants.html',
  styleUrl: './all-restaurants.css',
})
export class AllRestaurants implements OnInit {
  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  currentFilter: string = 'all';
  currentSearch: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private restaurantService: RestaurantService) { }

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.isLoading = true;
    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        this.restaurants = data;
        this.filteredRestaurants = [...data];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load restaurants. Please try again later.';
        this.isLoading = false;
        console.error('Error loading restaurants:', error);
      }
    });
  }

  applySearch(): void {
    if (!this.currentSearch.trim()) {
      this.filteredRestaurants = [...this.restaurants];
      return;
    }

    const searchTerm = this.currentSearch.toLowerCase().trim();
    this.filteredRestaurants = this.restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(searchTerm) ||
      restaurant.city.toLowerCase().includes(searchTerm) ||
      restaurant.area.toLowerCase().includes(searchTerm)
    );
  }

  applyFilter(category: string): void {
    this.currentFilter = category;
    
    if (category === 'all') {
      this.filteredRestaurants = [...this.restaurants];
      return;
    }

    this.filteredRestaurants = this.restaurants.filter(restaurant => {
      // Since we only have basic restaurant data, we'll use city as a filter
      // You can update this when you add more properties
      return restaurant.city.toLowerCase() === category.toLowerCase();
    });
  }

  clearSearch(): void {
    this.currentSearch = '';
    this.filteredRestaurants = [...this.restaurants];
  }

  getResultCount(): string {
    const count = this.filteredRestaurants.length;
    return `${count} restaurant${count !== 1 ? 's' : ''}`;
  }

  viewMenu(restaurantId: number): void {
    // For demo purposes, show a notification
    console.log(`Navigating to menu for restaurant ID: ${restaurantId}`);
  }
}