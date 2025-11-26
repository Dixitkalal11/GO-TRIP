import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
  newPassword: string = '';
  confirmPassword: string = '';
  token: string = '';
  message: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get token from URL query parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.message = '❌ Invalid reset link. Please request a new password reset.';
      }
    });
  }

  onResetPassword() {
    if (!this.token) {
      this.message = '❌ Invalid reset link. Please request a new password reset.';
      return;
    }

    if (!this.newPassword || !this.confirmPassword) {
      this.message = '❌ Please fill in all fields.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.message = '❌ Passwords do not match.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.message = '❌ Password must be at least 6 characters long.';
      return;
    }

    this.isLoading = true;
    this.message = 'Resetting your password...';

    // Call backend to reset password
    this.http.post('http://localhost:5000/api/auth/reset-password', {
      token: this.token,
      newPassword: this.newPassword
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.message = '✅ ' + res.message;
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Password reset error:', err);
        
        if (err.error && err.error.error) {
          this.message = '❌ ' + err.error.error;
        } else {
          this.message = '❌ Failed to reset password. Please try again.';
        }
      }
    });
  }
}
