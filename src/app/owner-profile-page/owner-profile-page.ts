
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { OwnerService, OwnerProfile } from '../owner-service';

@Component({
  selector: 'app-owner-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './owner-profile-page.html',
  styleUrls: ['./owner-profile-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OwnerProfilePage implements OnInit {
  isLoading = true;
  isSaving = false;
  errorMsg = '';
  successMsg = '';

  // Declare, then initialize in ngOnInit
  form!: FormGroup;

  ownerId = 1; // TODO: replace with auth-derived value

  constructor(
    private fb: FormBuilder,
    private ownerService: OwnerService,
    private router: Router,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // ✅ Initialize here
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });


    this.ownerService.getOwnerProfile(2).subscribe({
      next: (profile: OwnerProfile) => {
        this.form.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          mobileNumber: profile.mobileNumber?.toString() ?? '',
        });
        this.cdr.markForCheck();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.errorMsg = 'Failed to load profile. Please try again.';
        this.isLoading = false;
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: OwnerProfile = {
      ownerId: this.ownerId,
      firstName: this.form.value.firstName!,
      lastName: this.form.value.lastName!,
      email: this.form.value.email!,
      mobileNumber: Number(this.form.value.mobileNumber!),
    };

    this.isSaving = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.ownerService.updateOwnerProfile(payload).subscribe({
      next: (updated) => {
        this.isSaving = false;
        this.successMsg = 'Profile updated successfully.';
        this.cdr.markForCheck();
        localStorage.setItem('ownerName', `${updated.firstName} ${updated.lastName}`);
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        this.isSaving = false;
        this.errorMsg = err;
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/owner-page']);
  }
}

``
