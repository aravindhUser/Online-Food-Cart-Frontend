
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription, timer, debounceTime, distinctUntilChanged } from 'rxjs';
import { RegistrationService } from '../registration-service';
// import { RegistrationService } from '../../services/registration.service';
interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-registration-page-owner',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registration-page-owner.html',
  styleUrl: './registration-page-owner.css',
})
export class RegistrationPageOwner implements OnInit {

  registrationForm: FormGroup;
  isSubmitting = false;
  emailExists = false;
  passwordStrength = 'None';
  passwordStrengthClass = '';
  
  notification: Notification = {
    show: false,
    message: '',
    type: 'info'
  };
  
  private notificationTimer?: Subscription;
  // private emailCheckSub?: Subscription;
  
  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(1)]],
      userEmail: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/)
      ]],
      userPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }
  
ngOnInit(): void {
  // Monitor password changes for strength indicator
  this.f['userPassword'].valueChanges
    .pipe(
      distinctUntilChanged() // only fire when value actually changes
    )
    .subscribe(value => {
      this.checkPasswordStrength(value); // immediate feedback
    });
}


  get f() {
    return this.registrationForm.controls;
  }
  
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('userPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      return { mismatch: true };
    }
    return null;
  }
  
  checkPasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 'None';
      this.passwordStrengthClass = '';
      return;
    }
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character type checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    
    // Determine strength
    if (score <= 2) {
      this.passwordStrength = 'Weak';
      this.passwordStrengthClass = 'weak';
    } else if (score <= 4) {
      this.passwordStrength = 'Fair';
      this.passwordStrengthClass = 'fair';
    } else if (score <= 6) {
      this.passwordStrength = 'Good';
      this.passwordStrengthClass = 'good';
    } else {
      this.passwordStrength = 'Strong';
      this.passwordStrengthClass = 'strong';
    }
  }
  
  checkEmail(): void {
    const email = this.f['userEmail'].value;
    if (this.f['userEmail'].valid && email) {
      this.registrationService.checkEmailExists(email).subscribe({
        next: (exists) => {
          this.emailExists = exists;
          if (exists) {
            this.f['userEmail'].setErrors({ emailExists: true });
          }
        },
        error: () => {
          // Silently handle error for email check
        }
      });
    }
  }
  
  onSubmit(): void {
    if (this.registrationForm.invalid || this.emailExists) {
      Object.keys(this.registrationForm.controls).forEach(key => {
        const control = this.registrationForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    
    const formData = {
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      userEmail: this.f['userEmail'].value,
      mobileNumber: this.f['mobileNumber'].value,
      userPassword: this.f['userPassword'].value
    };
    
    this.registrationService.registerOwner(formData).subscribe({
      next: (response) => {
        this.showNotification('Registration successful! Redirecting to login...', 'success');
        
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { registered: 'true', email: formData.userEmail }
          });
        }, 2000);
      },
      error: (error) => {
        this.showNotification(error.message, 'error');
        this.isSubmitting = false;
      }
    });
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
