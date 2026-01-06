import { ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItem, MenuService } from '../menu-service';

@Component({
  selector: 'app-owner-menu-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-menu-page.html',
  styleUrls: ['./owner-menu-page.css']
})
export class OwnerMenuPage implements OnInit {
  restaurantId: number = 1; // Replace with actual restaurant ID from auth service
  
  menuItems: MenuItem[] = [];
  filteredMenuItems: MenuItem[] = [];
  
  newItem: Partial<MenuItem> = {
    restaurantId: this.restaurantId,
    itemName: '',
    price: 0,
    estimatedItemsDelivered: 10,
    available: true,
    category: ''
  };
  
  searchTerm: string = '';
  
  categories: string[] = [
    'Main Course',
    'Appetizer',
    'Dessert',
    'Beverage',
    'Side Dish',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Specialty'
  ];
  
  isLoading: boolean = false;
  isAddingItem: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  @ViewChild('itemNameInput') itemNameInput?: ElementRef;
  @ViewChild('quantityInput') quantityInput?: ElementRef;

  constructor(
    private menuService: MenuService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMenuItems();
  }

  // Load all menu items for this restaurant
  loadMenuItems(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.menuService.getMenuItemsByRestaurant(this.restaurantId).subscribe({
      next: (data) => {
        this.menuItems = data.map(item => ({
          ...item,
          editing: false,
          tempQuantity: item.estimatedItemsDelivered,
          deleting: false
        }));
        this.filteredMenuItems = [...this.menuItems];
        this.isLoading = false;
        console.log('Menu items loaded:', this.menuItems.length, 'items');
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading menu items:', error);
        this.handleError('Failed to load menu items. Please refresh the page.', error);
      }
    });
  }

  // Open add item form
  openAddItemForm(): void {
    this.isAddingItem = true;
    this.resetNewItemForm();
    // Focus on item name input after view renders
    setTimeout(() => {
      if (this.itemNameInput) {
        this.itemNameInput.nativeElement.focus();
      }
    }, 100);
  }

  // Close add item form
  closeAddItemForm(): void {
    this.isAddingItem = false;
    this.errorMessage = '';
  }

  // Add new menu item
  addMenuItem(): void {
    if (!this.validateNewItem()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    // Ensure restaurantId is set
    this.newItem.restaurantId = this.restaurantId;

    this.menuService.addMenuItem(this.newItem, this.restaurantId).subscribe({
      next: (createdItem) => {
        // Add editing properties to the new item
        const newItemWithProps = {
          ...createdItem,
          editing: false,
          tempQuantity: createdItem.estimatedItemsDelivered,
          deleting: false
        };
        
        this.menuItems.unshift(newItemWithProps);
        this.filteredMenuItems = [...this.menuItems];
        
        console.log('Menu item added successfully:', createdItem);
        
        this.isAddingItem = false;
        this.isLoading = false;
        this.resetNewItemForm();
        
        this.showSuccess('Menu item added successfully!');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.handleError('Failed to add menu item. Please try again.', error);
      }
    });
  }

  // Delete menu item
  deleteMenuItem(item: MenuItem): void {
    if (!confirm(`Are you sure you want to delete "${item.itemName}"? This action cannot be undone.`)) {
      return;
    }
    
    item.deleting = true;
    this.errorMessage = '';
    
    this.menuService.deleteMenuItem(item.itemId).subscribe({
      next: () => {
        // Remove item after animation completes
        setTimeout(() => {
          this.menuItems = this.menuItems.filter(i => i.itemId !== item.itemId);
          this.filteredMenuItems = [...this.menuItems];
          this.showSuccess('Menu item deleted successfully!');
          this.cdr.detectChanges();
        }, 400);
      },
      error: (error) => {
        item.deleting = false;
        this.handleError('Failed to delete menu item. Please try again.', error);
      }
    });
  }

  // Update quantity via PATCH
  updateItemQuantity(item: MenuItem): void {
    if (!item.tempQuantity || item.tempQuantity < 0) {
      this.errorMessage = 'Please enter a valid quantity (0 or more)';
      return;
    }

    if (item.tempQuantity === item.estimatedItemsDelivered) {
      item.editing = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    this.menuService.updateItemQuantity(item.itemId, item.tempQuantity).subscribe({
      next: (updatedItem) => {
        const index = this.menuItems.findIndex(m => m.itemId === item.itemId);
        if (index !== -1) {
          this.menuItems[index] = {
            ...this.menuItems[index],
            ...updatedItem,
            editing: false,
            tempQuantity: updatedItem.estimatedItemsDelivered
          };
          this.filteredMenuItems = [...this.menuItems];
        }
        
        this.isLoading = false;
        this.showSuccess('Stock quantity updated successfully!');
      },
      error: (error) => {
        this.handleError('Failed to update quantity. Please try again.', error);
      }
    });
  }

  // Toggle availability via PATCH - UPDATED for immediate feedback
  toggleAvailability(item: MenuItem): void {
    // Store the current state in case we need to revert
    const originalAvailability = item.available;
    const newAvailability = !item.available;
    
    // IMMEDIATE VISUAL UPDATE - Update UI first
    item.available = newAvailability;
    this.cdr.detectChanges(); // Force immediate UI update
    
    this.errorMessage = '';
    
    this.menuService.toggleItemAvailability(item.itemId, newAvailability).subscribe({
      next: (updatedItem) => {
        // Update the item with the response from server
        const index = this.menuItems.findIndex(m => m.itemId === item.itemId);
        if (index !== -1) {
          this.menuItems[index] = {
            ...this.menuItems[index],
            ...updatedItem
          };
          this.filteredMenuItems = [...this.menuItems];
        }
        
        this.showSuccess(`Item marked as ${newAvailability ? 'Available' : 'Unavailable'}!`);
        this.cdr.detectChanges();
      },
      error: (error) => {
        // Revert the change if the API call fails
        item.available = originalAvailability;
        this.handleError('Failed to update availability. Please try again.', error);
        this.cdr.detectChanges();
      }
    });
  }

  // Start editing quantity
  startEditingQuantity(item: MenuItem): void {
    // Reset all other editing states
    this.menuItems.forEach(i => {
      if (i.itemId !== item.itemId) {
        i.editing = false;
      }
    });
    
    item.editing = true;
    item.tempQuantity = item.estimatedItemsDelivered;
    
    // Focus on input after view updates
    setTimeout(() => {
      if (this.quantityInput) {
        this.quantityInput.nativeElement.focus();
        this.quantityInput.nativeElement.select();
      }
    }, 50);
  }

  // Cancel editing
  cancelEditing(item: MenuItem): void {
    item.editing = false;
    item.tempQuantity = item.estimatedItemsDelivered;
  }

  // Search menu items
  searchMenuItems(): void {
    if (!this.searchTerm.trim()) {
      this.loadMenuItems();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    this.menuService.searchMenuItems(this.restaurantId, this.searchTerm.trim()).subscribe({
      next: (data) => {
        this.filteredMenuItems = data.map(item => ({
          ...item,
          editing: false,
          tempQuantity: item.estimatedItemsDelivered,
          deleting: false
        }));
        this.isLoading = false;
        
        if (this.filteredMenuItems.length === 0) {
          this.showInfo(`No items found for "${this.searchTerm}"`);
        }
      },
      error: (error) => {
        this.handleError('Failed to search menu items. Please try again.', error);
      }
    });
  }

  // Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.loadMenuItems();
  }

  // Validate new item form
  private validateNewItem(): boolean {
    if (!this.newItem.itemName?.trim()) {
      this.errorMessage = 'Item name is required';
      return false;
    }
    
    if (!this.newItem.price || this.newItem.price <= 0) {
      this.errorMessage = 'Please enter a valid price (greater than 0)';
      return false;
    }
    
    if (!this.newItem.category) {
      this.errorMessage = 'Please select a category';
      return false;
    }
    
    if (!this.newItem.estimatedItemsDelivered || this.newItem.estimatedItemsDelivered < 0) {
      this.errorMessage = 'Please enter a valid initial stock quantity';
      return false;
    }
    
    this.errorMessage = '';
    return true;
  }

  // Reset new item form
  private resetNewItemForm(): void {
    this.newItem = {
      restaurantId: this.restaurantId,
      itemName: '',
      price: 0,
      estimatedItemsDelivered: 10,
      available: true,
      category: ''
    };
  }

  // Show success message
  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }

  // Show info message
  private showInfo(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      if (this.errorMessage === message) {
        this.errorMessage = '';
      }
    }, 3000);
  }

  // Handle errors
  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    this.isLoading = false;
    console.error('Menu management error:', error);
    
    // Auto-clear error after 5 seconds
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }
}