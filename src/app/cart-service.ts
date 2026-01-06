
// cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/** =========================
 * Models (co-located in service)
 * ========================= */
export interface CartItemDto {
  userId: number;
  itemId: number;
  quantity: number;
  // Back-end uses LocalDateTime; send ISO string from frontend if you include this
  addedAt?: string;
}

// Raw DTO from backend (note 'availaible' misspelling)
export interface MenuResponseDtoRaw {
  itemId: number;
  restaurantId: number;
  itemName: string;
  price: number; // integer server-side; use number in TS
  restaurantName: string;
  availaible: boolean; // <-- backend misspelling
  quantity: number;
  estimatedItemsDelivered?: number;
  category: string;
}

// Normalized model for UI usage
export interface CartItem {
  itemId: number;
  restaurantId: number;
  name: string;
  price: number;
  restaurantName:string;
  available: boolean;
  quantity: number;
  category: string;
  estimatedItemsDelivered?: number;
}

export interface MessageResponse {
  message: string;
}

/** =========================
 * Service
 * ========================= */

// If you have environment config, prefer environment.apiBaseUrl + '/cart'
const CART_BASE_URL = 'http://localhost:8084/cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  constructor(private http: HttpClient) {}

  addItemToCart(dto: CartItemDto): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${CART_BASE_URL}/add/item/to-cart`, dto);
  }

  clearCartItems(userId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${CART_BASE_URL}/clear/cart/${userId}`);
  }

  updateCartItem(dto: CartItemDto): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${CART_BASE_URL}/update/cart/item`, dto);
  }

  deleteItemByUserIdAndItemId(userId: number, itemId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${CART_BASE_URL}/delete/item/${userId}/${itemId}`);
  }

  getAllCartItemsForUser(userId: number): Observable<CartItem[]> {
    return this.http
      .get<MenuResponseDtoRaw[]>(`${CART_BASE_URL}/get/all-cart-items/for/user-with/${userId}`)
      .pipe(map(rawList => rawList.map(normalizeCartItem)));
  }
}

/** =========================
 * Helpers
 * ========================= */

function normalizeCartItem(raw: MenuResponseDtoRaw): CartItem {
  return {
    itemId: raw.itemId,
    restaurantId: raw.restaurantId,
    name: raw.itemName,
    price: toNumber(raw.price),
    restaurantName:raw.restaurantName,
    available: toBoolean(raw.availaible), // fix misspelling here
    quantity: toNumber(raw.quantity) ?? 0,
    category: raw.category,
    estimatedItemsDelivered: raw.estimatedItemsDelivered,
  };
}

function toNumber(n: any): number {
  const num = Number(n);
  return Number.isFinite(num) ? num : 0;
}

function toBoolean(v: any): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') return v.toLowerCase() === 'true';
  return false; // default
}
``
