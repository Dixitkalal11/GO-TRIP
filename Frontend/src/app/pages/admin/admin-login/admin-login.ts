import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { ValidationService } from '../../../services/validation.service';
import { FormErrorComponent } from '../../../components/form-error/form-error.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, FormErrorComponent],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css']
})
export class AdminLoginComponent {
  username: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;

  @ViewChild('adminLoginForm') adminLoginForm!: NgForm;

  constructor(
    private adminService: AdminService,
    private router: Router,
    public validationService: ValidationService
  ) {}

  onUsernameBlur() {
    if (this.username) {
      this.username = this.validationService.trim(this.username);
    }
  }

  onPasswordBlur() {
    // Password blur handler if needed
  }

  onSubmit() {
    // Validate form
    if (this.adminLoginForm && this.adminLoginForm.invalid) {
      this.error = 'Please fill all required fields correctly';
      if (this.adminLoginForm) {
        const formElement = document.querySelector('.admin-login-form');
        if (formElement) {
          this.validationService.focusFirstInvalid(this.adminLoginForm, formElement as HTMLElement);
        }
      }
      return;
    }

    if (!this.username || !this.password) {
      this.error = 'Please enter both username and password';
      return;
    }

    this.loading = true;
    this.error = '';

    // Simulate a small delay for better UX
    setTimeout(() => {
      const success = this.adminService.login(this.username, this.password);
      
      if (success) {
        this.router.navigate(['/admin']);
      } else {
        this.error = 'Invalid username or password';
      }
      
      this.loading = false;
    }, 500);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}









