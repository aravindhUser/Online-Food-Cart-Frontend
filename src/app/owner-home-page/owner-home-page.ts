
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { OwnerService, Restaurant, OwnerProfile } from '../owner-service';

interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-owner-home-page',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './owner-home-page.html',
  styleUrl: './owner-home-page.css',
})
export class OwnerHomePage implements OnInit , OnDestroy {

  ownerId: number = 1; // TODO: Get from authentication service
  ownerProfile: OwnerProfile = {
    ownerId: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'owner@restaurant.com',
    mobileNumber: 9876543210
  };
  
  // Restaurants data
  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  searchQuery: string = '';
  
  // Loading state
  isLoading: boolean = true;
  isUpdatingStatus: { [key: number]: boolean } = {};
  
  // Stats
  openRestaurantsCount: number = 0;
  citiesCount: number = 0;
  
  // Notification
  notification: Notification = {
    show: false,
    message: '',
    type: 'info'
  };
  
  private notificationTimer?: Subscription;
  
  constructor(
    private ownerService: OwnerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.loadOwnerProfile();
    this.loadRestaurants();
  }
  
  ngOnDestroy(): void {
    if (this.notificationTimer) {
      this.notificationTimer.unsubscribe();
    }
  }
  
  loadOwnerProfile(): void {
    // Get owner ID from authentication service in real app
    const storedOwnerId = localStorage.getItem('ownerId');
    if (storedOwnerId) {
      this.ownerId = parseInt(storedOwnerId, 1);
    }
    
    this.ownerService.getOwnerProfile(2).subscribe({
      next: (profile) => {
        this.ownerProfile = profile;
        localStorage.setItem('ownerName', `${profile.firstName} ${profile.lastName}`);
        console.log('Owner profile loaded:', profile);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load owner profile:', error);
        // Use default profile if API fails
        this.ownerProfile = {
          ownerId: this.ownerId,
          firstName: 'Restaurant',
          lastName: 'Owner',
          email: 'owner@example.com',
          mobileNumber: 9876543210
        };
      }
    });
  }
  
  loadRestaurants(): void {
    this.isLoading = true;
    
    this.ownerService.getOwnerRestaurants(this.ownerId).subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
        this.filteredRestaurants = [...restaurants];
        this.calculateStats();
        this.isLoading = false;
        console.log('Restaurants loaded:', restaurants);
        this.cdr.markForCheck();
        // this.showNotification('Restaurants loaded successfully', 'success');
      },
      error: (error) => {
        console.error('Failed to load restaurants:', error);
        this.showNotification('Failed to load restaurants. Please try again.', 'error');
        this.isLoading = false;
        
        // Fallback to empty array if API fails
        this.restaurants = [];
        this.filteredRestaurants = [];
      }
    });
  }
  
  calculateStats(): void {
    // Calculate open restaurants count
    this.openRestaurantsCount = this.restaurants.filter(r => r.open).length;
    
    // Calculate unique cities count
    const uniqueCities = new Set(this.restaurants.map(r => r.city));
    this.citiesCount = uniqueCities.size;
  }
  
  filterRestaurants(): void {
    if (!this.searchQuery.trim()) {
      this.filteredRestaurants = [...this.restaurants];
      this.cdr.markForCheck();
      return;
    }
    
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredRestaurants = this.restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(query) ||
      restaurant.city.toLowerCase().includes(query) ||
      restaurant.area.toLowerCase().includes(query)
    );
  }
  
  deleteRestaurant(restaurant: Restaurant): void {
    this.ownerService.deleteRestaurant(restaurant.restaurantId!).subscribe({
      next: () => {
        this.restaurants = this.restaurants.filter(r => r.restaurantId !== restaurant.restaurantId);
        this.filteredRestaurants = this.filteredRestaurants.filter(r => r.restaurantId !== restaurant.restaurantId);
        this.calculateStats();
        this.showNotification('Restaurant deleted successfully', 'success');
      },
      error: (error) => {
        console.error('Failed to delete restaurant:', error);
        this.showNotification('Failed to delete restaurant. Please try again.', 'error');
      }
    });
  }

  toggleRestaurantStatus(restaurant: Restaurant): void {
    if (this.isUpdatingStatus[restaurant.restaurantId!]) return;
    
    const newStatus = !restaurant.open;
    this.isUpdatingStatus[restaurant.restaurantId!] = true;
    console.log(`Updating status for ${restaurant.name} to ${newStatus ? 'open' : 'closed'}`);
    
    this.ownerService.updateRestaurantStatus(restaurant.restaurantId!, newStatus).subscribe({
      next: (updatedRestaurant) => {
        // Update local restaurant data
        const index = this.restaurants.findIndex(r => r.restaurantId === restaurant.restaurantId);
        if (index !== -1) {
          this.restaurants[index] = { ...this.restaurants[index], open: newStatus };
          this.filterRestaurants(); // Refresh filtered list
          this.calculateStats();
        }
        
        this.showNotification(
          `${restaurant.name} is now ${newStatus ? 'open' : 'closed'}`,
          'success'
        );
        this.isUpdatingStatus[restaurant.restaurantId!] = false;
      },
      error: (error) => {
        console.error('Failed to update restaurant status:', error);
        this.showNotification('Failed to update restaurant status. Please try again.', 'error');
        this.isUpdatingStatus[restaurant.restaurantId!] = false;
        
        // Revert the toggle on error
        restaurant.open = !newStatus;
      }
    });
  }
  
  addRestaurant(): void {
    // Navigate to add restaurant page
    this.router.navigate(['owner-page/addRestaurant']);
  }
  
  viewRestaurant(restaurant: Restaurant): void {
    // Navigate to restaurant details page
    this.router.navigate(['/owner/restaurant', restaurant.restaurantId]);
  }
  
  manageMenu(restaurant: Restaurant): void {
    // Navigate to menu management page
    this.router.navigate(['/owner/menu', restaurant.restaurantId]);
  }
  
  viewProfile(): void {
    // Navigate to profile page
    this.router.navigate(['/owner/profile']);
  }
  
  getInitials(): string {
    const { firstName, lastName } = this.ownerProfile;
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  
  get ownerName(): string {
    return `${this.ownerProfile.firstName} ${this.ownerProfile.lastName}`;
  }
  
  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.notification = {
      show: true,
      message,
      type
    };
    
    if (this.notificationTimer) {
      this.notificationTimer.unsubscribe();
    }
    
    this.notificationTimer = timer(4000).subscribe(() => {
      this.notification.show = false;
    });
  }
  
  // Helper method to format date
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
