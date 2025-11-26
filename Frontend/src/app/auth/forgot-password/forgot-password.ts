import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';

  constructor(private authService: AuthService) {}

  onForgotPassword() {
    if (!this.email) {
      this.message = 'Please enter your email address.';
      return;
    }

    this.message = 'Checking your account...';

    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        if (res.success) {
          if (res.userType === 'normal') {
            this.message = '✅ ' + res.message;
          } else if (res.userType === 'google') {
            this.message = '✅ ' + res.message;
          }
        }
      },
      error: (err: any) => {
        console.error('Forgot password error:', err);
        if (err.message) {
          this.message = '❌ ' + err.message;
        } else {
          this.message = '❌ Error: ' + (err.error?.message || 'Something went wrong. Please try again.');
        }
      }
    });
  }
}
