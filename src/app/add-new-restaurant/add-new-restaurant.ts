import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../user-page';
// import { RestaurantService } from '../services/restaurant.service'; // Adjust path as needed

@Component({
  selector: 'app-add-new-restaurant',
 imports: [CommonModule, FormsModule],
  templateUrl: './add-new-restaurant.html',
  styleUrl: './add-new-restaurant.css',
})
export class AddNewRestaurant {
  @Output() restaurantAdded = new EventEmitter<any>();
  @Output() closeModal = new EventEmitter<void>();

  // Form fields
  name: string = '';
  city: string = '';
  area: string = '';
  open: boolean = true;
  
  // Form state
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private restaurantService: RestaurantService) {}

  // Submit the form
  onSubmit(): void {
    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    const ownerId: number = 1; // TODO: Get from authentication service
    // Create restaurant object
    const newRestaurant = {
      name: this.name.trim(),
      city: this.city.trim(),
      area: this.area.trim(),
      open: this.open
    };

    // Call service to add restaurant
    // For now, simulate the API call
    // In real app: this.restaurantService.addRestaurant(newRestaurant).subscribe(...)
    this.restaurantService.addRestaurants(newRestaurant, ownerId).subscribe({
      next: (response) => {
        this.successMessage = 'Restaurant added successfully!';
        this.isLoading = false;
        console.log('Added restaurant response:', response);
        this.simulateAddRestaurant(newRestaurant);
      },
      error: (error) => {
        this.errorMessage = 'Failed to add restaurant.';
        this.isLoading = false;
      }
    });   
  }

  // Simulate API call (replace with actual service call)
  private simulateAddRestaurant(restaurant: any): void {
    setTimeout(() => {
      // Simulate successful response
      this.successMessage = 'Restaurant added successfully!';
      this.isLoading = false;
      
      // Emit the new restaurant to parent component
      this.restaurantAdded.emit(restaurant);
      
      // Reset form after successful submission
      setTimeout(() => {
        this.resetForm();
        this.successMessage = '';
      }, 1500);
    }, 1000);
  }

  // Validate form
  private validateForm(): boolean {
    if (!this.name.trim()) {
      this.errorMessage = 'Restaurant name is required';
      return false;
    }
    
    if (!this.city.trim()) {
      this.errorMessage = 'City is required';
      return false;
    }
    
    if (!this.area.trim()) {
      this.errorMessage = 'Area is required';
      return false;
    }
    
    this.errorMessage = '';
    return true;
  }

  // Reset form
  resetForm(): void {
    this.name = '';
    this.city = '';
    this.area = '';
    this.open = true;
    this.errorMessage = '';
  }

  // Close the modal
  onClose(): void {
    this.resetForm();
    this.closeModal.emit();
  }
}