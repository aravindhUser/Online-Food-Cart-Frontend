
// src/app/services/orders.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/** Backend DTOs (TypeScript equivalents) */
export interface DeliveryAddress {
  houseNo: string;
  streetName: string;
  town: string;
  district: string;
  state: string;
  pincode: string;
}

export interface OrderRequestDto {
  deliveryAddress: DeliveryAddress;
}

export interface OrderItems {
  // Shape from backend; if fields differ, update:
  itemId?: number;
  name?: string;
  quantity?: number;
  price?: number;
}

export interface OrderResponseDto {
  orderId: number;
  userId: number;
  totalAmount: number;
  invoiceNumber: string;
  orderStatus: string;
  orderTime: string;            // LocalDateTime serialized
  orderItems: OrderItems[];
  address: DeliveryAddress;
}

/** Response from /get-address/{userId} (unknown exact shape),
 *  we map it to DeliveryAddress below.
 */
export interface UserAddressResponseDto {
  id?: number;
  receiverName?: string;
  phone?: string;

  // The fields we need to build DeliveryAddress:
  houseNo?: string;
  streetName?: string;
  town?: string;
  district?: string;
  state?: string;
  pincode?: string;

  // If your API uses different names (e.g., line1/line2/city),
  // map them in the transformer below.
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  /** Base URL of your order service (adjust) */
 // e.g., orders-service base

  constructor(private http: HttpClient) {}

  /** GET saved addresses for user */
  getUserAddresses(userId: number): Observable<UserAddressResponseDto[]> {
    const url = `http://localhost:8081/user/get-address/${userId}`;
    return this.http.get<UserAddressResponseDto[]>(url);
  }

  /** Helper: transform backend address into DeliveryAddress */
  toDeliveryAddress(addr: UserAddressResponseDto): DeliveryAddress {
    // If your API uses different keys, normalize here.
    return {
      houseNo: addr.houseNo ?? '',
      streetName: addr.streetName ?? '',
      town: addr.town ?? '',
      district: addr.district ?? '',
      state: addr.state ?? '',
      pincode: addr.pincode ?? '',
    };
  }

  /** POST place order with selected DeliveryAddress */
  placeOrder(userId: number, request: OrderRequestDto): Observable<OrderResponseDto> {
    const url = `'http://localhost:8085'/order/place/order/${userId}`;
    return this.http.post<OrderResponseDto>(url, request);
  }
}
