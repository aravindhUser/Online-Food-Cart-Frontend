
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import {
  OrdersService,
  DeliveryAddress,
  OrderRequestDto,
  OrderResponseDto,
  UserAddressResponseDto
} from '../orders-service';

type CartItem = {
  itemId: number;
  name: string;
  restaurantName?: string;
  price: number;
  quantity: number;
  available: boolean;
  estimatedItemsDelivered?: number | null;
};

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, DecimalPipe],          // NgIf/NgFor + number pipe
  templateUrl: './checkout-component.html',
  styleUrls: ['./checkout-component.css'],
})
export class CheckoutComponent implements OnInit {
  userId!: number;
  items: CartItem[] = [];

  addressesRaw: UserAddressResponseDto[] = [];
  addresses: DeliveryAddress[] = [];
  selectedIndex: number | null = null;

  isLoading = false;
  errorMsg = '';
  infoMsg = '';

  constructor(private orders: OrdersService, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const uid = params.get('userId');
      const itemsB64 = params.get('items');

      this.userId = uid ? Number(uid) : NaN;
      if (isNaN(this.userId)) {
        this.errorMsg = 'Invalid userId in query params.';
        return;
      }

      if (itemsB64) {
        try {
          const json = decodeURIComponent(escape(atob(itemsB64)));
          const parsed = JSON.parse(json) as CartItem[];
          this.items = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error('Failed to parse items from query params', e);
          this.errorMsg = 'Unable to read cart items from URL.';
        }
      }

      // Optional fallback if items aren’t passed
      if (!this.items.length) {
        this.items = [
          { itemId: 1, name: 'Paneer Tikka', restaurantName: 'Spice Villa', price: 180, quantity: 2, available: true },
          { itemId: 2, name: 'Veg Biryani',  restaurantName: 'Spice Villa', price: 220, quantity: 1, available: true },
          { itemId: 3, name: 'Masala Dosa',  restaurantName: 'Udupi Cafe',  price: 120, quantity: 3, available: true },
        ];
      }

      this.fetchAddresses();
    });
  }

  fetchAddresses() {
    this.isLoading = true;
    this.orders.getUserAddresses(this.userId).subscribe({
      next: (list) => {
        this.addressesRaw = list ?? [];
        this.addresses = this.addressesRaw.map(a => this.orders.toDeliveryAddress(a));
        this.selectedIndex = this.addresses.length ? 0 : null;  // preselect first if exists
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Unable to load addresses';
        this.isLoading = false;
      }
    });
  }

  selectAddress(i: number) { this.selectedIndex = i; }

  /* ---------- Pricing ---------- */
  get subTotal(): number {
    return this.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  }
  get deliveryFee(): number { return this.subTotal < 500 ? 100 : 0; }
  get grandTotal(): number { return this.subTotal + this.deliveryFee; }

  /* ---------- Template-safe getters ---------- */
  /** Use this in template instead of addresses[selectedIndex]?.… */
  get selectedAddress(): DeliveryAddress | null {
    return this.selectedIndex != null ? this.addresses[this.selectedIndex] ?? null : null;
  }

  /** Avoid arrow functions in template bindings */
  get hasUnavailableItems(): boolean {
    return this.items.some(i => !i.available);
  }

  trackByItemId(index: number, item: CartItem): number {
    return item.itemId;
  }

  /* ---------- Place Order ---------- */
  placeOrder() {
    if (!this.selectedAddress) {
      this.errorMsg = 'Please select a delivery address.';
      setTimeout(() => (this.errorMsg = ''), 2500);
      return;
    }
    if (!this.items.length) {
      this.errorMsg = 'Your cart is empty.';
      setTimeout(() => (this.errorMsg = ''), 2500);
      return;
    }
    if (this.hasUnavailableItems) {
      this.errorMsg = 'Some items are unavailable. Please update your cart.';
      setTimeout(() => (this.errorMsg = ''), 2500);
      return;
    }

    const request: OrderRequestDto = { deliveryAddress: this.selectedAddress };
    this.isLoading = true;

    this.orders.placeOrder(this.userId, request).subscribe({
      next: (resp: OrderResponseDto) => {
        this.isLoading = false;
        this.infoMsg = `Order #${resp.orderId} placed. Invoice: ${resp.invoiceNumber}`;
        setTimeout(() => (this.infoMsg = ''), 4000);
        // TODO: navigate to confirmation page: this.router.navigate(['/orders', resp.orderId])
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMsg = 'Failed to place order. Try again.';
        setTimeout(() => (this.errorMsg = ''), 3000);
      }
    });
  }
}
