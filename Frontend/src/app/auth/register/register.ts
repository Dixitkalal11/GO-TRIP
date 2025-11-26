import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  fullName: string = '';
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router, private toast: ToastService) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onRegister() {
    if (!this.fullName || !this.email || !this.password) {
      this.toast.warning('Please fill in all fields');
      return;
    }

    this.authService.register(this.email, this.password, this.fullName).subscribe({
      next: (res: any) => {
        console.log('Registration success', res);
        if (this.rememberMe) {
          localStorage.setItem('remember_email', this.email);
        }
        
        // Show success message and redirect to login
        this.toast.success('Registration successful! Please login to continue.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Registration failed', err);
        if (err.error && err.error.error === 'User already exists') {
          this.toast.info('User already exists. Please login instead.');
          this.router.navigate(['/login']);
        } else {
          this.toast.error('Registration failed. Please try again.');
        }
      }
    });
  }

  onGoogleRegister() {
    this.authService.loginWithGoogle().subscribe({
      next: (res: any) => {
        console.log('Google registration success', res);
        this.toast.success('Google registration successful! Welcome!');
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        console.error('Google registration failed', err);
        this.toast.error('Google registration failed. Please try again.');
      }
    });
  }
}
