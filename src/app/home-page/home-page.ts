import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';



@Component({
  selector: 'app-home-page',
  imports: [CommonModule,RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})

export class HomePage implements OnInit{
  currentYear: number = new Date().getFullYear();
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
 