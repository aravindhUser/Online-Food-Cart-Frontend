import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


export interface RegistrationRequest {
  userEmail: string;
  userPassword: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
  role: 'OWNER' | 'CUSTOMER';
}

export interface LoginRequest {
  userEmail: string;
  userPassword: string;
}

export interface LoginResponse {
  jwtToken: string;
  jwtTokenExpiration: string;
}

export interface RegistrationResponse {
  message: string;
  userId: number;
  userEmail: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  // private apiUrl = environment.apiUrl + '/api/auth';
  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  registerOwner(data: Omit<RegistrationRequest, 'role'>): Observable<RegistrationResponse> {
    const request: RegistrationRequest = {
      ...data,
      role: 'OWNER'
    };
    return this.http.post<RegistrationResponse>(`${this.apiUrl}/user-register/owner`, data)
      .pipe(catchError(this.handleError));
  }

  registerCustomer(data: Omit<RegistrationRequest, 'role'>): Observable<RegistrationResponse> {
    const request: RegistrationRequest = {
      ...data,
      role: 'CUSTOMER'
    };
    return this.http.post<RegistrationResponse>(`${this.apiUrl}/register/customer`, request)
      .pipe(catchError(this.handleError));
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-email/${email}`);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred during registration.';
    
    if (error.status === 409) {
      errorMessage = 'Email already exists. Please use a different email.';
    } else if (error.status === 400) {
      errorMessage = 'Invalid data. Please check your information.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  loginUser(data: LoginRequest): Observable<LoginResponse> {
    console.log('Login data sent to server:', data);
    return this.http.post<LoginResponse>(`http://localhost:8080/auth/user-login`, data)
  } 
}