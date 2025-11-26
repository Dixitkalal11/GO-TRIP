import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile').then(m => m.UserProfileComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./auth/reset-password/reset-password').then(m => m.ResetPasswordComponent)
  },

 {
  path: 'booking',
  loadComponent: () =>
    import('./pages/booking/booking').then(m => m.BookingComponent) // ✅ match exact name
},
{
  path: 'booking/bus',
  loadComponent: () =>
    import('./pages/booking/bus-booking/bus-booking').then(m => m.BusBookingComponent)
},
{
  path: 'booking/train',
  loadComponent: () =>
    import('./pages/booking/train-booking/train-booking').then(m => m.TrainBookingComponent)
},
{
  path: 'booking/plane',
  loadComponent: () =>
    import('./pages/booking/plane-booking/plane-booking').then(m => m.PlaneBookingComponent)
},
{
  path: 'booking/tour',
  loadComponent: () =>
    import('./pages/booking/tour-booking/tour-booking').then(m => m.TourBookingComponent)
},
{
  path: 'payment',
  loadComponent: () =>
    import('./pages/payment/payment').then(m => m.PaymentComponent)
},
{
  path: 'my-bookings',
  loadComponent: () =>
    import('./pages/my-bookings/my-bookings').then(m => m.MyBookingsComponent)
},
  {
    path: 'enquiry',
    loadComponent: () =>
      import('./pages/enquiry/enquiry').then(m => m.EnquiryComponent)
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact').then(m => m.ContactComponent)
  },
  {
    path: 'packages',
    loadComponent: () =>
      import('./pages/packages/packages').then(m => m.PackagesComponent)
  },
  {
    path: 'search-results',
    loadComponent: () =>
      import('./pages/search-results/search-results').then(m => m.SearchResultsComponent)
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./pages/admin/admin-login/admin-login').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'terms-conditions',
    loadComponent: () =>
      import('./pages/policies/terms-conditions/terms-conditions').then(m => m.TermsConditionsComponent)
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./pages/policies/privacy-policy/privacy-policy').then(m => m.PrivacyPolicyComponent)
  },
  {
    path: 'cancellation-policy',
    loadComponent: () =>
      import('./pages/policies/cancellation-policy/cancellation-policy').then(m => m.CancellationPolicyComponent)
  },
  {
    path: 'coins-policy',
    loadComponent: () =>
      import('./pages/policies/coins-policy/coins-policy').then(m => m.CoinsPolicyComponent)
  },
  {
    path: '**',
    redirectTo: '' // fallback route
  }
];
