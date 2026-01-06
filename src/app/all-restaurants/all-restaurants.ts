import { Component, OnInit } from '@angular/core';
import { Restaurant, RestaurantService } from '../user-page';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, MenuService } from '../menu-service';
import { RegistrationService } from '../registration-service';
// import { MenuService, MenuItem } from '../services/menu.service'; // Assuming you have this
// import { AuthService } from '../services/auth.service'; // Assuming you have this

@Component({
  selector: 'app-all-restaurants',
  imports: [CommonModule, FormsModule],
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
  isLoggedIn: boolean = false;
  userFirstName: string = '';
  userLastName: string = '';
  
  // Menu dialog properties
  showMenuDialog: boolean = false;
  selectedRestaurantId: number | null = null;
  selectedRestaurantName: string = '';
  menuItems: MenuItem[] = [];
  cartItems: Map<number, number> = new Map(); // itemId -> quantity
  cartTotal: number = 0;
  cartItemCount: number = 0;
  
  // Menu loading states
  isMenuLoading: boolean = false;
  menuError: string = '';

  constructor(
    private restaurantService: RestaurantService,
    private menuService: MenuService,
    private authService: RegistrationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkAuthStatus();
    this.loadRestaurants();
  }

  checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.authService.getCurrentUser();
      this.userFirstName = user?.firstName || '';
      this.userLastName = user?.lastName || '';
    }
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

    if (category === 'open') {
      this.filteredRestaurants = this.restaurants.filter(restaurant => restaurant.open);
    } else if (category === 'closed') {
      this.filteredRestaurants = this.restaurants.filter(restaurant => !restaurant.open);
    } else {
      this.filteredRestaurants = this.restaurants.filter(restaurant => 
        restaurant.city.toLowerCase() === category.toLowerCase()
      );
    }
  }

  clearSearch(): void {
    this.currentSearch = '';
    this.filteredRestaurants = [...this.restaurants];
  }

  getResultCount(): string {
    const count = this.filteredRestaurants.length;
    return `${count} restaurant${count !== 1 ? 's' : ''}`;
  }

  viewMenu(restaurantId: number, restaurantName: string): void {
    this.selectedRestaurantId = restaurantId;
    this.selectedRestaurantName = restaurantName;
    this.showMenuDialog = true;
    this.loadMenuItems(restaurantId);
  }

  loadMenuItems(restaurantId: number): void {
    this.isMenuLoading = true;
    this.menuError = '';
    this.menuItems = [];
    
    this.menuService.getMenuItemsByRestaurant(restaurantId).subscribe({
      next: (data) => {
        this.menuItems = data.filter(item => item.available);
        this.isMenuLoading = false;
      },
      error: (error) => {
        this.menuError = 'Failed to load menu items. Please try again.';
        this.isMenuLoading = false;
        console.error('Error loading menu:', error);
      }
    });
  }

  closeMenuDialog(): void {
    this.showMenuDialog = false;
    this.selectedRestaurantId = null;
    this.selectedRestaurantName = '';
    this.menuItems = [];
    this.cartItems.clear();
    this.cartTotal = 0;
    this.cartItemCount = 0;
  }

  getCategories(): string[] {
    const categories = this.menuItems.map(item => item.category);
    return [...new Set(categories)]; // Remove duplicates
  }

  getItemsByCategory(category: string): MenuItem[] {
    return this.menuItems.filter(item => item.category === category);
  }

  addToCart(item: MenuItem): void {
    const currentQuantity = this.cartItems.get(item.itemId) || 0;
    this.cartItems.set(item.itemId, currentQuantity + 1);
    this.updateCartTotals();
  }

  incrementQuantity(itemId: number): void {
    const currentQuantity = this.cartItems.get(itemId) || 0;
    this.cartItems.set(itemId, currentQuantity + 1);
    this.updateCartTotals();
  }

  decrementQuantity(itemId: number): void {
    const currentQuantity = this.cartItems.get(itemId) || 0;
    if (currentQuantity > 1) {
      this.cartItems.set(itemId, currentQuantity - 1);
    } else {
      this.cartItems.delete(itemId);
    }
    this.updateCartTotals();
  }

  getItemQuantity(itemId: number): number {
    return this.cartItems.get(itemId) || 0;
  }

  updateCartTotals(): void {
    this.cartTotal = 0;
    this.cartItemCount = 0;
    
    this.cartItems.forEach((quantity, itemId) => {
      const item = this.menuItems.find(i => i.itemId === itemId);
      if (item) {
        this.cartTotal += item.price * quantity;
        this.cartItemCount += quantity;
      }
    });
  }

  placeOrder(): void {
    if (!this.isLoggedIn) {
      this.closeMenuDialog();
      this.navigateToSignIn();
      return;
    }
    
    // Convert cart items to order format
    const orderItems = Array.from(this.cartItems.entries()).map(([itemId, quantity]) => ({
      itemId,
      quantity,
      price: this.menuItems.find(item => item.itemId === itemId)?.price || 0
    }));
    
    // Here you would typically call an order service
    console.log('Placing order:', {
      restaurantId: this.selectedRestaurantId,
      items: orderItems,
      total: this.cartTotal
    });
    
    // For demo, just close and show success
    alert(`Order placed successfully! Total: $${this.cartTotal.toFixed(2)}`);
    this.closeMenuDialog();
  }

  navigateToSignIn(): void {
    this.router.navigate(['/login']);
  }

  navigateToMyOrders(): void {
    this.router.navigate(['/my-orders']);
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userFirstName = '';
    this.userLastName = '';
    this.router.navigate(['/']);
  }

  // Profile dropdown toggle
  showProfileDropdown: boolean = false;
  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }
}