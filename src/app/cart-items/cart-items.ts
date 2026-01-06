
// src/app/cart-items/cart-items.component.ts
import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // <-- added Router
import { finalize } from 'rxjs/operators';
import { CartItem, CartItemDto, CartService, MessageResponse } from '../cart-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-items',
  templateUrl: './cart-items.html',
  styleUrls: ['./cart-items.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class CartItemsComponent implements OnInit {
  @Input() userId?: number = 1;

  items: CartItem[] = [];
  isLoading = false;
  errorMsg = '';
  infoMsg = '';

  // Derived totals
  get subTotal(): number {
    return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  // You can add tax, delivery, etc. if needed
  get grandTotal(): number {
    return this.subTotal; // add other fees if applicable
  }

  constructor(
    private cartService: CartService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router // <-- injected Router
  ) {}

  ngOnInit(): void {
    // If userId not passed via @Input, read from route param 'userId'
    if (this.userId == null) {
      const paramId = this.route.snapshot.paramMap.get('userId');
      this.userId = paramId ? Number(paramId) : undefined;
    }
    if (this.userId == null) {
      this.errorMsg = 'User ID is required to load cart.';
      return;
    }
    this.loadCartItems();
  }

  loadCartItems(): void {
    if (this.userId == null) return;
    this.isLoading = true;
    this.errorMsg = '';
    this.infoMsg = '';

    this.cartService
      .getAllCartItemsForUser(this.userId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: items => {
          this.items = items;
          this.cdr.markForCheck();
        },
        error: err => {
          this.errorMsg = this.extractError(err, 'Failed to load cart items.');
          this.cdr.markForCheck();
        }
      });
  }

  increment(item: CartItem): void {
    if (!item.available) {
      this.infoMsg = 'Item is not available right now.';
      return;
    }
    const newQty = item.quantity + 1;
    this.updateQuantity(item, newQty);
  }

  decrement(item: CartItem): void {
    const newQty = item.quantity - 1;
    if (newQty <= 0) {
      // If qty would drop to 0, delete item from cart
      this.removeItem(item);
    } else {
      this.updateQuantity(item, newQty);
    }
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (this.userId == null) return;
    this.isLoading = true;
    this.errorMsg = '';
    this.infoMsg = '';

    const dto: CartItemDto = {
      userId: this.userId,
      itemId: item.itemId,
      quantity: newQuantity,
      addedAt: new Date().toISOString(), // ISO string; backend LocalDateTime should parse this
    };

    this.cartService
      .updateCartItem(dto)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (_res: MessageResponse) => {
          // Optimistically update local state
          const idx = this.items.findIndex(i => i.itemId === item.itemId);
          if (idx !== -1) {
            this.items[idx] = { ...this.items[idx], quantity: newQuantity };
          }
          this.cdr.markForCheck();
          this.infoMsg = 'Quantity updated.';
        },
        error: err => {
          this.errorMsg = this.extractError(err, 'Failed to update quantity.');
        }
      });
  }

  removeItem(item: CartItem): void {
    if (this.userId == null) return;
    this.isLoading = true;
    this.errorMsg = '';
    this.infoMsg = '';

    this.cartService
      .deleteItemByUserIdAndItemId(this.userId, item.itemId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (_res: MessageResponse) => {
          this.items = this.items.filter(i => i.itemId !== item.itemId);
          this.cdr.markForCheck();
          this.infoMsg = 'Item removed from cart.';
        },
        error: err => {
          this.errorMsg = this.extractError(err, 'Failed to remove item.');
        }
      });
  }

  clearCart(): void {
    if (this.userId == null) return;
    this.isLoading = true;
    this.errorMsg = '';
    this.infoMsg = '';

    this.cartService
      .clearCartItems(this.userId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (_res: MessageResponse) => {
          this.items = [];
          this.infoMsg = 'Cart cleared.';
          this.cdr.markForCheck();
        },
        error: err => {
          this.errorMsg = this.extractError(err, 'Failed to clear cart.');
        }
      });
  }

  addToCart(itemId: number, quantity = 1): void {
    if (this.userId == null) return;
    this.isLoading = true;
    this.errorMsg = '';
    this.infoMsg = '';

    const dto: CartItemDto = {
      userId: this.userId,
      itemId,
      quantity,
      addedAt: new Date().toISOString()
    };

    this.cartService
      .addItemToCart(dto)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (_res: MessageResponse) => {
          // Reload to reflect the backend’s cart state
          this.loadCartItems();
          this.infoMsg = 'Item added to cart.';
        },
        error: err => {
          this.errorMsg = this.extractError(err, 'Failed to add item.');
        }
      });
  }

  trackByItemId(_index: number, item: CartItem): number {
    return item.itemId;
  }

  /** 
   * Navigate to Checkout with query params:
   *  - userId
   *  - items: Base64-encoded JSON payload (minimal fields)
   */
  goToCheckout(): void {
    if (this.userId == null) {
      this.errorMsg = 'User ID is missing.';
      return;
    }
    if (this.items.length === 0) {
      this.errorMsg = 'Your cart is empty.';
      return;
    }

    // Keep payload minimal to avoid very long URLs
    const payload = this.items.map(i => ({
      itemId: i.itemId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      available: i.available,
      restaurantName: (i as any).restaurantName,
      estimatedItemsDelivered: (i as any).estimatedItemsDelivered ?? null
    }));

    const json = JSON.stringify(payload);
    // Base64 encode (Unicode-safe)
    const b64 = btoa(unescape(encodeURIComponent(json)));

    this.router.navigate(['/checkout'], {
      queryParams: {
        userId: this.userId,
        items: b64
      }
    });
  }

  private extractError(err: any, fallback: string): string {
    if (!err) return fallback;
    if (err.error?.message) return err.error.message;
    if (err.message) return err.message;
    return fallback;
  }
}
