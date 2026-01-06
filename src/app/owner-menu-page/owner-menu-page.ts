import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItem, MenuService } from '../menu-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-owner-menu-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-menu-page.html',
  styleUrl: './owner-menu-page.css',
})
export class OwnerMenuPage implements OnInit {

  restaurantId: number = 0; // Default value for testing

  menuItems: MenuItem[] = [];
  filteredMenuItems: MenuItem[] = [];
  
  newItem: Partial<MenuItem> = {
    restaurantId: this.restaurantId,
    itemName: '',
    price: 0,
    estimatedItemsDelivered: 10,
    availaible: true,
    category: 'Main Course'
  };
  
  searchTerm: string = '';
  
  categories: string[] = [
    'Appetizer',
    'Main Course',
    'Dessert',
    'Beverage',
    'Side Dish',
    'Specialty',
    'Breakfast',
    'Lunch',
    'Dinner'
  ];
  
  isLoading: boolean = false;
  isAddingItem: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private menuService: MenuService, private cdr: ChangeDetectorRef,private route:ActivatedRoute) {}

 
 ngOnInit(): void {
    // ✅ Read restaurantId from query params and set it
    const id = this.route.snapshot.queryParamMap.get('restaurantId');
    if (id) {
      this.restaurantId = +id;
    }

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
          tempQuantity: item.estimatedItemsDelivered
        }));
        this.filteredMenuItems = [...this.menuItems];
        this.isLoading = false;
        this.cdr.detectChanges();
        //console.log('Menu items loaded:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading menu items:', error);
        this.handleError('Failed to load menu items. Please try again.', error);
      }
    });
  }

  // Add new menu item
  addMenuItem(): void {
    if (!this.validateNewItem()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    // Ensure restaurantId is set
    // this.newItem.restaurantId = this.restaurantId;

    this.menuService.addMenuItem(this.newItem,this.restaurantId).subscribe({
      next: (createdItem) => {
        this.menuItems.unshift(createdItem);
        this.filteredMenuItems = [...this.menuItems];
        console.log('Menu item added:', createdItem);
        this.isAddingItem = false;
        this.isLoading = false;

        this.resetNewItemForm();
       
        this.showSuccess('Menu item added successfully!');
        this.loadMenuItems();
        // this.cdr.detectChanges();
      },
      error: (error) => {
        this.handleError('Failed to add menu item. Please try again.', error);
      }
    });
  }

  // Update menu item
  updateMenuItem(item: MenuItem): void {
    this.isLoading = true;
    
    const updateData = {
      itemName: item.itemName,
      price: item.price,
      category: item.category,
      available: item.availaible
    };
    
    this.menuService.updateMenuItem(item.itemId, updateData).subscribe({
      next: (updatedItem) => {
        const index = this.menuItems.findIndex(m => m.itemId === item.itemId);
        if (index !== -1) {
          this.menuItems[index] = { ...this.menuItems[index], ...updatedItem };
          this.filteredMenuItems = [...this.menuItems];
        }
        
        this.isLoading = false;
        this.showSuccess('Menu item updated successfully!');
      },
      error: (error) => {
        this.handleError('Failed to update menu item. Please try again.', error);
      }
    });
  }

  // Delete menu item
  deleteMenuItem(itemId: number): void {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }
    console.log("Type of itemId:", typeof itemId);
    this.isLoading = true;
    console.log("Deleting menu item with ID:", itemId);

    this.menuService.deleteMenuItem(itemId).subscribe({
      next: () => {
        this.menuItems = this.menuItems.filter(item => item.itemId !== itemId );
        this.filteredMenuItems = [...this.menuItems];
        this.isLoading = false;
        this.loadMenuItems();
        this.cdr.markForCheck();
        this.showSuccess('Menu item deleted successfully!');

      },
      error: (error) => {
        this.handleError('Failed to delete menu item. Please try again.', error);
      }
    });
  }

  // Update quantity via PATCH
  updateItemQuantity(item: MenuItem): void {
    if (!item.tempQuantity || item.tempQuantity < 0) {
      this.errorMessage = 'Please enter a valid quantity';
      return;
    }

    this.isLoading = true;
    
    this.menuService.updateItemQuantity(item.itemId, item.tempQuantity).subscribe({
      next: (updatedItem) => {
        const index = this.menuItems.findIndex(m => m.itemId === item.itemId);
        if (index !== -1) {
          this.menuItems[index] = updatedItem;
          this.menuItems[index].editing = false;
          this.filteredMenuItems = [...this.menuItems];
        }
        
        this.isLoading = false;
        this.cdr.markForCheck();
        this.loadMenuItems();
        this.showSuccess('Quantity updated successfully!');
      },
      error: (error) => {
        this.handleError('Failed to update quantity. Please try again.', error);
      }
    });
  }

  // Toggle availability via PATCH
  toggleAvailability(item: MenuItem): void {
  const newAvailability = !item.availaible;

    this.isLoading = true;
    
    this.menuService.toggleItemAvailability(item.itemId, newAvailability).subscribe({
      next: (updatedItem) => {
        const index = this.menuItems.findIndex(m => m.itemId === item.itemId);
        if (index !== -1) {
          this.menuItems[index] = updatedItem;
          this.filteredMenuItems = [...this.menuItems];
        }
        
        this.isLoading = false;
        this.cdr.markForCheck();
        this.loadMenuItems();
        this.showSuccess('Availability updated!');
      },
      error: (error) => {
        this.handleError('Failed to update availability. Please try again.', error);
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
  }

  // Cancel editing
  cancelEditing(item: MenuItem): void {
    item.editing = false;
    item.tempQuantity = item.estimatedItemsDelivered;
  }

  // Search menu items via backend
  searchMenuItems(): void {
    if (!this.searchTerm.trim()) {
      this.loadMenuItems();
      return;
    }

    this.isLoading = true;
    
    this.menuService.searchMenuItems(this.restaurantId, this.searchTerm.trim()).subscribe({
      next: (data) => {
        this.filteredMenuItems = data.map(item => ({
          ...item,
          editing: false,
          tempQuantity: item.estimatedItemsDelivered
        }));
        this.isLoading = false;
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
      this.errorMessage = 'Valid price is required';
      return false;
    }
    
    if (!this.newItem.estimatedItemsDelivered || this.newItem.estimatedItemsDelivered < 0) {
      this.errorMessage = 'Valid quantity is required';
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
      availaible: true,
      category: 'Main Course'
    };
  }

  // Show success message
  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  // Handle errors
  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    this.isLoading = false;
    console.error('Error:', error);
  }
}