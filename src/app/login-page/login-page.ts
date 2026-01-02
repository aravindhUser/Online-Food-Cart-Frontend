import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { OwnerService } from '../owner-service';
import { LoginRequest, RegistrationService } from '../registration-service';


interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface JwtPayload { 
  sub: string; 
  roles: string[]; 
  authId:string;
  exp: number; 
  iat: number; 
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})

export class LoginPage implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoggingIn: boolean = false;
  userType: string = 'owner';
  
  notification: Notification = {
    show: false,
    message: '',
    type: 'info'
  };
  
  private notificationTimer?: Subscription;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: RegistrationService,
    private OwnerService: OwnerService, 
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      userEmail: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  ngOnInit(): void {
    // Check if there's a user type parameter (owner/customer)
    this.route.params.subscribe(params => {
      this.userType = params['type'] || 'owner';
      // You could change the login header based on user type
    });
  }
  
  ngOnDestroy(): void {
    if (this.notificationTimer) {
      this.notificationTimer.unsubscribe();
    }
  }

  decodeJwt(token: string): JwtPayload | null {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      return JSON.parse(payloadJson);
    } catch (e) {
      console.error('Failed to decode JWT:', e);
      return null;
    }
  }

  onLoginSubmit(): void {
  if (this.loginForm.invalid) {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
    return;
  }

  this.isLoggingIn = true;

  const loginData: LoginRequest = this.loginForm.value;

  this.authService.loginUser(loginData).subscribe({
    next: (LoginResponse) => {
      // Handle successful login
      this.showNotification('Login successful! Redirecting to dashboard...', 'success');
      console.log('Login response:', LoginResponse);
      localStorage.setItem('jwtToken', LoginResponse.jwtToken);
      const token = LoginResponse.jwtToken;
      const decoded = this.decodeJwt(token);
      if (decoded) {
        console.log('Decoded JWT payload:', decoded);
      }
      if (this.userType === 'owner') {
        this.router.navigate(['/owner-page']);
      }
      else {
        this.router.navigate(['/user-page']);
      }
      // this.router.navigate(['/owner-page']);
      this.isLoggingIn = false;
    },
    error: (err) => {
      // Handle login error
      console.error('Login error:', err);
      this.showNotification('Invalid email or password. Please try again.', 'error');
      this.isLoggingIn = false;
    }
  });
}

  
  onForgotPassword(event: Event): void {
    event.preventDefault();
    this.showNotification('Password reset link has been sent to your email.', 'info');
  }
  
  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.notification = {
      show: true,
      message,
      type
    };
    
    if (this.notificationTimer) {
      this.notificationTimer.unsubscribe();
    }
    
    this.notificationTimer = timer(4000).subscribe(() => {
      this.notification.show = false;
    });
  }
}