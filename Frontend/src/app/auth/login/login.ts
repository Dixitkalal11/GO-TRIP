import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { BookingStateService } from '../../services/booking-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  returnUrl: string = '/';
  selectedTransport: any = null;
  searchData: any = null;

  constructor(
    private authService: AuthService, 
    private adminService: AdminService,
    private router: Router,
    private toast: ToastService,
    private bookingStateService: BookingStateService
  ) {}

  ngOnInit() {
    // Get return URL and booking data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.returnUrl = navigation.extras.state['returnUrl'] || '/';
      this.selectedTransport = navigation.extras.state['selectedTransport'];
      this.searchData = navigation.extras.state['searchData'];
    } else {
      // Fallback: try to get from query params or history state
      const state = history.state;
      if (state && state['returnUrl']) {
        this.returnUrl = state['returnUrl'];
        this.selectedTransport = state['selectedTransport'];
        this.searchData = state['searchData'];
      }
    }

    // Check if coming from package booking
    const fromPackage = sessionStorage.getItem('fromPackage');
    if (fromPackage === 'true' && this.returnUrl) {
      // Package data is already stored in sessionStorage
    }

    // Load remembered email if exists
    const rememberedEmail = localStorage.getItem('remember_email');
    if (rememberedEmail) {
      this.email = rememberedEmail;
      this.rememberMe = true;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.toast.warning('Please fill in all fields');
      return;
    }

    // Check if this is an admin login attempt
    if (this.email.toLowerCase() === 'admin') {
      const isAdminLogin = this.adminService.login(this.email, this.password);
      if (isAdminLogin) {
        console.log('Admin login success');
        this.toast.success('Admin login successful!');
        this.router.navigate(['/admin']);
        return;
      } else {
        this.toast.error('Invalid admin credentials. Please check your username and password.');
        return;
      }
    }

    // Regular user login
    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        console.log('Login success', res);
        if (this.rememberMe) {
          localStorage.setItem('remember_email', this.email);
        }
        
        // Show success message
        this.toast.success('Login successful! Welcome back!');
        
        // Check for pending selections (bus, train, flight) first - these take priority
        const pendingBusSelection = sessionStorage.getItem('pendingBusSelection');
        const pendingTrainSelection = sessionStorage.getItem('pendingTrainSelection');
        const pendingFlightSelection = sessionStorage.getItem('pendingFlightSelection');
        
        if (pendingBusSelection) {
          // Mark that we're on a booking page for state restoration
          sessionStorage.setItem('_bookingPageActive', 'true');
          this.router.navigate(['/booking/bus']);
          return;
        }
        
        if (pendingTrainSelection) {
          // Mark that we're on a booking page for state restoration
          sessionStorage.setItem('_bookingPageActive', 'true');
          this.router.navigate(['/booking/train']);
          return;
        }
        
        if (pendingFlightSelection) {
          // Mark that we're on a booking page for state restoration
          sessionStorage.setItem('_bookingPageActive', 'true');
          this.router.navigate(['/booking/plane']);
          return;
        }
        
        // Check for pending booking state and restore it
        const bookingState = this.bookingStateService.restoreAndClearState();
        if (bookingState) {
          // Save state to sessionStorage for booking component to use
          const searchData = {
            transportType: bookingState.mode,
            from: bookingState.from,
            to: bookingState.to,
            date: bookingState.departure,
            returnDate: bookingState.return || '',
            tripType: bookingState.tripType
          };
          sessionStorage.setItem('searchData', JSON.stringify(searchData));
          
          // Navigate to appropriate booking page
          const bookingRoute = bookingState.mode === 'flight' ? '/booking/plane' : `/booking/${bookingState.mode}`;
          this.router.navigate([bookingRoute]);
          return;
        }
        
        // Check if coming from package booking
        const fromPackage = sessionStorage.getItem('fromPackage');
        if (fromPackage === 'true') {
          // Package data is already in sessionStorage, redirect to booking page
          if (this.returnUrl && this.returnUrl.startsWith('/booking/')) {
            this.router.navigate([this.returnUrl]);
          } else {
            // Fallback: check sessionStorage for package type
            const searchDataStr = sessionStorage.getItem('searchData');
            if (searchDataStr) {
              const searchData = JSON.parse(searchDataStr);
              const transportType = searchData.transportType;
              if (transportType === 'bus') {
                this.router.navigate(['/booking/bus']);
              } else if (transportType === 'train') {
                this.router.navigate(['/booking/train']);
              } else if (transportType === 'plane') {
                this.router.navigate(['/booking/plane']);
              } else if (transportType === 'tour') {
                this.router.navigate(['/booking/tour']);
              } else {
                this.router.navigate([this.returnUrl || '/']);
              }
            } else {
              this.router.navigate([this.returnUrl || '/']);
            }
          }
        } else if (this.returnUrl === '/search-results' && this.selectedTransport) {
          // Go to booking page with selected transport data
          this.router.navigate(['/booking'], {
            state: {
              selectedTransport: this.selectedTransport,
              searchData: this.searchData
            }
          });
        } else if (this.returnUrl && this.returnUrl.startsWith('/booking/')) {
          // If returnUrl is a booking page, navigate there
          sessionStorage.setItem('_bookingPageActive', 'true');
          this.router.navigate([this.returnUrl]);
        } else {
          // Go to return URL or home
          this.router.navigate([this.returnUrl || '/']);
        }
      },
      error: (err: any) => {
        console.error('Login failed', err);
        if (err.error && err.error.error === 'Invalid credentials') {
          this.toast.error('Invalid email or password. Please check your credentials.');
        } else if (err.status === 400) {
          this.toast.info('User not found. Please register first.');
          this.router.navigate(['/register']);
        } else {
          this.toast.error('Login failed. Please try again.');
        }
      }
    });
  }

  onGoogleLogin() {
    this.authService.loginWithGoogle().subscribe({
      next: (res: any) => {
        console.log('Google login success', res);
        
        // Show success message
        this.toast.success('Google login successful! Welcome!');
        
        // Check for pending booking state and restore it
        const bookingState = this.bookingStateService.restoreAndClearState();
        if (bookingState) {
          // Save state to sessionStorage for booking component to use
          const searchData = {
            transportType: bookingState.mode,
            from: bookingState.from,
            to: bookingState.to,
            date: bookingState.departure,
            returnDate: bookingState.return || '',
            tripType: bookingState.tripType
          };
          sessionStorage.setItem('searchData', JSON.stringify(searchData));
          
          // Navigate to appropriate booking page
          const bookingRoute = bookingState.mode === 'flight' ? '/booking/plane' : `/booking/${bookingState.mode}`;
          this.router.navigate([bookingRoute]);
          return;
        }
        
        // Check if coming from package booking
        const fromPackage = sessionStorage.getItem('fromPackage');
        if (fromPackage === 'true') {
          // Package data is already in sessionStorage, redirect to booking page
          if (this.returnUrl && this.returnUrl.startsWith('/booking/')) {
            this.router.navigate([this.returnUrl]);
          } else {
            // Fallback: check sessionStorage for package type
            const searchDataStr = sessionStorage.getItem('searchData');
            if (searchDataStr) {
              const searchData = JSON.parse(searchDataStr);
              const transportType = searchData.transportType;
              if (transportType === 'bus') {
                this.router.navigate(['/booking/bus']);
              } else if (transportType === 'train') {
                this.router.navigate(['/booking/train']);
              } else if (transportType === 'plane') {
                this.router.navigate(['/booking/plane']);
              } else if (transportType === 'tour') {
                this.router.navigate(['/booking/tour']);
              } else {
                this.router.navigate([this.returnUrl || '/']);
              }
            } else {
              this.router.navigate([this.returnUrl || '/']);
            }
          }
        } else if (this.returnUrl === '/search-results' && this.selectedTransport) {
          // Go to booking page with selected transport data
          this.router.navigate(['/booking'], {
            state: {
              selectedTransport: this.selectedTransport,
              searchData: this.searchData
            }
          });
        } else {
          // Go to return URL or home
          this.router.navigate([this.returnUrl || '/']);
        }
      },
      error: (err: any) => {
        console.error('Google login failed', err);
        this.toast.error('Google login failed. Please try again.');
      }
    });
  }
}
