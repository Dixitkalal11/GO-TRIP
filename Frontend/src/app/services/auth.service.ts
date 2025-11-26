import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { Auth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Auth, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from '@angular/fire/auth';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth'; // backend base URL
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private auth: Auth) {}

  /** 🔹 Login with Email + Password */
  login(email: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.http.post(`${this.apiUrl}/login`, { email, password }).subscribe({
        next: (res: any) => {
          // Store JWT token
          if (res.token) {
            localStorage.setItem('token', res.token);
          }
          // Get user profile after successful login
          this.getUserProfile().subscribe({
            next: (profileRes: any) => {
              this.saveUser(profileRes.user);
              observer.next({ ...res, user: profileRes.user });
              observer.complete();
            },
            error: (profileErr) => {
              // If profile fetch fails, still proceed with login
              this.saveUser({ email, name: email.split('@')[0] });
              observer.next(res);
              observer.complete();
            }
          });
        },
        error: err => observer.error(err)
      });
    });
  }

  /** 🔹 Register with Email + Password + Full Name */
  register(email: string, password: string, fullName: string): Observable<any> {
    return new Observable(observer => {
      this.http.post(`${this.apiUrl}/register`, { email, password, name: fullName }).subscribe({
        next: (res: any) => {
          // Store JWT token if provided
          if (res.token) {
            localStorage.setItem('token', res.token);
          }
          this.saveUser(res.user);
          observer.next(res);
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }

  /** 🔹 Google OAuth */
  loginWithGoogle(): Observable<any> {
    const provider = new GoogleAuthProvider();
    
    // Add additional scopes if needed
    provider.addScope('email');
    provider.addScope('profile');
    
    return new Observable(observer => {
      console.log('🚀 Starting Google login...');
      
      signInWithPopup(this.auth, provider)
        .then(result => {
          console.log('✅ Google popup successful:', result);
          
          // Get user info from Firebase result
          const user = result.user;
          const userInfo = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split('@')[0] || 'Google User',
            picture: user.photoURL
          };

          console.log('📤 Sending user info to backend:', userInfo);

          // Send user info to backend
          this.http.post(`${this.apiUrl}/google-login`, { 
            token: 'google-token', // We're not verifying token for now
            userInfo: userInfo 
          }).subscribe({
            next: (res: any) => {
              console.log('✅ Backend response:', res);
              
              // Store JWT token
              if (res.token) {
                localStorage.setItem('token', res.token);
                console.log('💾 JWT token stored');
              }
              
              // Save user data
              this.saveUser(res.user);
              console.log('👤 User data saved:', res.user);
              
              observer.next(res);
              observer.complete();
            },
            error: err => {
              console.error('❌ Google login backend error:', err);
              
              // Provide more specific error messages
              if (err.status === 0) {
                observer.error(new Error('Backend server is not running. Please start the backend server.'));
              } else if (err.status === 500) {
                observer.error(new Error('Backend server error. Please check the server logs.'));
              } else {
                observer.error(err);
              }
            }
          });
        })
        .catch(error => {
          console.error('❌ Google login popup error:', error);
          
          // Provide more specific error messages
          if (error.code === 'auth/popup-closed-by-user') {
            observer.error(new Error('Google login was cancelled. Please try again.'));
          } else if (error.code === 'auth/popup-blocked') {
            observer.error(new Error('Popup was blocked. Please allow popups for this site.'));
          } else if (error.code === 'auth/network-request-failed') {
            observer.error(new Error('Network error. Please check your internet connection.'));
          } else {
            observer.error(new Error(`Google login failed: ${error.message}`));
          }
        });
    });
  }

  /** 🔹 Get User Profile */
  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return new Observable(observer => {
        observer.error('No token found');
      });
    }
    
    return this.http.get(`${this.apiUrl}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /** 🔹 Logout */
  logout() {
    this.userSubject.next(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Clear booking state on logout
    localStorage.removeItem('pendingBookingState');
    // Clear all session storage booking states
    sessionStorage.removeItem('busBookingState');
    sessionStorage.removeItem('trainBookingState');
    sessionStorage.removeItem('planeBookingState');
    sessionStorage.removeItem('searchData');
    sessionStorage.removeItem('pendingBusSelection');
    sessionStorage.removeItem('pendingTrainSelection');
    sessionStorage.removeItem('pendingFlightSelection');
  }

  /** 🔹 Restore saved user */
  restoreUser() {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch fresh user data from backend including latest coins
      this.getUserProfile().subscribe({
        next: (response: any) => {
          this.saveUser(response.user);
          console.log('✅ User restored with fresh data from backend:', response.user);
        },
        error: (error) => {
          // Only log non-401 errors (401 is expected when token is invalid/expired)
          if (error.status !== 401) {
            console.error('❌ Error fetching fresh user data:', error);
          }
          // Clear invalid token
          if (error.status === 401) {
            localStorage.removeItem('token');
          }
          // Fallback to localStorage if backend fails
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            try {
              this.userSubject.next(JSON.parse(savedUser));
            } catch (e) {
              // If localStorage data is corrupted, clear it
              localStorage.removeItem('user');
              this.userSubject.next(null);
            }
          } else {
            this.userSubject.next(null);
          }
        }
      });
    } else {
      // No token, clear user data
      this.userSubject.next(null);
    }
  }

  /** 🔹 Helper to save user */
  private saveUser(user: any) {
    this.userSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /** 🔹 Update user coins */
  updateUserCoins(newCoinBalance: number) {
    const currentUser = this.userSubject.value;
    if (currentUser) {
      const updatedUser = { ...currentUser, coins: newCoinBalance };
      this.saveUser(updatedUser);
    }
  }

  /** 🔹 Refresh user data from backend */
  refreshUserData() {
    const token = localStorage.getItem('token');
    if (token) {
      this.getUserProfile().subscribe({
        next: (response: any) => {
          this.saveUser(response.user);
          console.log('✅ User data refreshed from backend:', response.user);
        },
        error: (error) => {
          console.error('❌ Error refreshing user data:', error);
        }
      });
    }
  }

  /** 🔹 Forgot Password - Check MySQL first, then Firebase for Google users */
  forgotPassword(email: string): Observable<any> {
    return new Observable(observer => {
      // First, check if user exists in MySQL database
      this.http.post(`${this.apiUrl}/forgot-password`, { email }).subscribe({
        next: (res: any) => {
          console.log('MySQL forgot password response:', res);
          
          if (res.userType === 'normal') {
            // User found in MySQL with password - show success message
            observer.next({
              success: true,
              message: 'Password reset instructions will be sent to your email.',
              userType: 'normal'
            });
            observer.complete();
          }
        },
        error: (err: any) => {
          console.log('MySQL forgot password error:', err);
          
          if (err.error?.error === 'Google user') {
            // User exists but is Google-only user - use Firebase
            console.log('User is Google-only, using Firebase password reset...');
            from(sendPasswordResetEmail(this.auth, email)).subscribe({
              next: () => {
                observer.next({
                  success: true,
                  message: 'Password reset email sent via Google! Check your email.',
                  userType: 'google'
                });
                observer.complete();
              },
              error: (firebaseErr: any) => {
                console.error('Firebase password reset error:', firebaseErr);
                observer.error({
                  success: false,
                  message: 'Failed to send password reset email. Please try again.',
                  error: firebaseErr
                });
              }
            });
          } else if (err.status === 404) {
            // User not found in MySQL
            observer.error({
              success: false,
              message: 'No account found with this email address. Please check your email or register for a new account.',
              error: 'User not found'
            });
          } else {
            // Other MySQL errors
            observer.error({
              success: false,
              message: 'Error checking account. Please try again.',
              error: err
            });
          }
        }
      });
    });
  }
}
