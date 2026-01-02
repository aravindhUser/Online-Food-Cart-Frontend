import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RestaurantService } from '../user-page';
// import { RestaurantService } from '../services/restaurant.service'; // adjust path

@Component({
  selector: 'app-add-new-restaurant',
  standalone: true, // mark as standalone
  imports: [CommonModule, FormsModule],
  templateUrl: './add-new-restaurant.html',
  styleUrls: ['./add-new-restaurant.css'], // plural
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

  constructor(
    private restaurantService: RestaurantService, 
    private cdr: ChangeDetectorRef,
    private router: Router // inject Router, not RouterLink
  ) {}

  // Submit the form
  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const ownerId: number = 1; // TODO: Get from authentication service

    const newRestaurant = {
      name: this.name.trim(),
      city: this.city.trim(),
      area: this.area.trim(),
      open: this.open
    };

    this.restaurantService.addRestaurants(newRestaurant, ownerId).subscribe({
      next: (response) => {
        this.successMessage = 'Restaurant added successfully!';
        this.isLoading = false;
        console.log('Added restaurant response:', response);
        this.cdr.markForCheck();
        this.simulateAddRestaurant(newRestaurant);
        this.router.navigate(['/owner-page']); 
      },
      error: () => {
        this.errorMessage = 'Failed to add restaurant.';
        this.isLoading = false;
      }
    });   
  }

  private simulateAddRestaurant(restaurant: any): void {
    setTimeout(() => {
      this.successMessage = 'Restaurant added successfully!';
      this.isLoading = false;
      this.restaurantAdded.emit(restaurant);

      setTimeout(() => {
        this.resetForm();
        this.successMessage = '';
      }, 1500);
    }, 1000);
  }

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

  resetForm(): void {
    this.name = '';
    this.city = '';
    this.area = '';
    this.open = true;
    this.errorMessage = '';
  }

  onClose(): void {
    this.resetForm();
    this.closeModal.emit();
  }
}
