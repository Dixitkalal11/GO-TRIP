import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserProfileService } from '../../services/user-profile.service';
import { BookingStateService } from '../../services/booking-state.service';
import { BUS_ROUTES } from '../../data/indian-districts';
import { TRAIN_ROUTES } from '../../data/train-data';
import { getAllAirportCities } from '../../data/plane-data';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  scrolled = false;
  isLoggedIn = false;
  userName: string = '';
  userCoins: number = 0;
  userEmail: string = '';
  profilePhotoUrl: string | null = null;

  // Search functionality
  searchQuery: string = '';
  displayQuery: string = '';
  showSearchResults: boolean = false;
  searchResults: any[] = [];
  allCities: string[] = [];
  allPages: any[] = [
    { name: 'Home', route: '/', keywords: ['home', 'main', 'landing', 'start', 'index'] },
    { name: 'Booking', route: '/booking', keywords: ['booking', 'book', 'reserve', 'ticket', 'reservation'] },
    { name: 'Bus Booking', route: '/booking/bus', keywords: ['bus', 'buses', 'road', 'travel', 'bus booking', 'bus ticket'] },
    { name: 'Train Booking', route: '/booking/train', keywords: ['train', 'trains', 'railway', 'rail', 'train booking', 'train ticket', 'irctc'] },
    { name: 'Flight Booking', route: '/booking/plane', keywords: ['flight', 'flights', 'airplane', 'air', 'plane', 'flight booking', 'airline', 'aviation'] },
    { name: 'Tour Booking', route: '/booking/tour', keywords: ['tour', 'tours', 'tour booking', 'trip', 'vacation', 'holiday'] },
    { name: 'Packages', route: '/packages', keywords: ['packages', 'package', 'deals', 'offers', 'tours', 'discount', 'special'] },
    { name: 'My Bookings', route: '/my-bookings', keywords: ['my bookings', 'bookings', 'history', 'tickets', 'my tickets', 'past bookings', 'booking history'] },
    { name: 'Enquiry', route: '/enquiry', keywords: ['enquiry', 'enquire', 'inquiry', 'query', 'question', 'ask', 'help', 'support', 'contact us'] },
    { name: 'Contact', route: '/contact', keywords: ['contact', 'support', 'help', 'customer service', 'reach us', 'get in touch'] },
    { name: 'Profile', route: '/profile', keywords: ['profile', 'account', 'settings', 'my profile', 'user profile', 'edit profile'] },
    { name: 'Login', route: '/login', keywords: ['login', 'sign in', 'log in', 'signin', 'authentication'] },
    { name: 'Register', route: '/register', keywords: ['register', 'sign up', 'signup', 'create account', 'new account', 'registration'] },
    { name: 'Payment', route: '/payment', keywords: ['payment', 'pay', 'checkout', 'billing', 'transaction', 'purchase'] },
    { name: 'Search Results', route: '/search-results', keywords: ['search', 'results', 'find', 'search results'] }
  ];

  constructor(
    private router: Router, 
    private authService: AuthService, 
    private userProfile: UserProfileService,
    private bookingStateService: BookingStateService
  ) {}

  ngOnInit() {
    // Restore user if page refreshed (this will fetch fresh data from backend)
    this.authService.restoreUser();

    // Subscribe to user changes
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.isLoggedIn = true;
        this.userName = user.name || user.fullName || user.email;
        this.userCoins = user.coins || 0;
        this.userEmail = user.email || '';
        this.profilePhotoUrl = this.userProfile.getPhoto();
        console.log('🪙 Navbar updated with user coins:', this.userCoins);
      } else {
        this.isLoggedIn = false;
        this.userName = '';
        this.userCoins = 0;
        this.userEmail = '';
        this.profilePhotoUrl = null;
      }
    });

    // Initialize search data - get all cities from all transport modes
    this.initializeSearchData();
  }

  initializeSearchData() {
    const citiesSet = new Set<string>();
    
    // Get bus cities
    if (BUS_ROUTES && BUS_ROUTES.length > 0) {
      BUS_ROUTES.forEach(route => {
        if (route.from) citiesSet.add(route.from);
        if (route.to) citiesSet.add(route.to);
      });
    }
    
    // Get train cities
    if (TRAIN_ROUTES && TRAIN_ROUTES.length > 0) {
      TRAIN_ROUTES.forEach(route => {
        if (route.from) citiesSet.add(route.from);
        if (route.to) citiesSet.add(route.to);
      });
    }
    
    // Get flight cities
    try {
      const flightCities = getAllAirportCities();
      if (flightCities && flightCities.length > 0) {
        flightCities.forEach(city => {
          if (city) citiesSet.add(city);
        });
      }
    } catch (error) {
      console.error('Error getting flight cities:', error);
    }
    
    this.allCities = Array.from(citiesSet).sort();
    console.log('🔍 Search initialized with', this.allCities.length, 'cities');
  }

  onSearchInput(event: any) {
    const inputValue = event.target.value;
    this.searchQuery = inputValue;
    this.displayQuery = inputValue;
    const query = inputValue.trim().toLowerCase();
    
    if (query.length === 0) {
      this.showSearchResults = false;
      this.searchResults = [];
      return;
    }

    this.searchResults = [];
    
    // Search cities
    const matchingCities = this.allCities.filter(city => 
      city.toLowerCase().includes(query)
    ).slice(0, 5).map(city => ({
      type: 'city',
      name: city,
      display: `📍 ${city}`,
      action: () => this.searchByCity(city)
    }));

    // Search pages
    const matchingPages = this.allPages.filter(page => 
      page.name.toLowerCase().includes(query) ||
      page.keywords.some((keyword: string) => keyword.toLowerCase().includes(query))
    ).slice(0, 3).map(page => ({
      type: 'page',
      name: page.name,
      display: `🔗 ${page.name}`,
      route: page.route,
      action: () => this.navigateToPage(page.route)
    }));

    this.searchResults = [...matchingCities, ...matchingPages];
    this.showSearchResults = this.searchResults.length > 0;
    
    console.log('Search query:', query, 'Results:', this.searchResults.length);
  }

  searchByCity(city: string) {
    // Navigate to booking page with city pre-filled
    const searchData = {
      transportType: 'bus',
      from: city,
      to: '',
      date: new Date().toISOString().split('T')[0]
    };
    sessionStorage.setItem('searchData', JSON.stringify(searchData));
    this.router.navigate(['/booking/bus']);
    this.clearSearch();
  }

  navigateToPage(route: string) {
    this.router.navigate([route]);
    this.clearSearch();
  }

  onSearchSubmit(event: Event) {
    event.preventDefault();
    if (this.searchQuery.trim().length === 0) {
      return;
    }

    // If there are results, navigate to first result
    if (this.searchResults.length > 0) {
      const firstResult = this.searchResults[0];
      if (firstResult.action) {
        firstResult.action();
      }
    } else {
      // If no results, navigate to packages page with search query
      this.router.navigate(['/packages'], { 
        queryParams: { search: this.searchQuery } 
      });
      this.clearSearch();
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.showSearchResults = false;
    this.searchResults = [];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.showSearchResults = false;
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 50;
  }

  logout() {
    // Clear all booking states and flag on logout
    this.bookingStateService.clearState();
    sessionStorage.removeItem('busBookingState');
    sessionStorage.removeItem('trainBookingState');
    sessionStorage.removeItem('planeBookingState');
    sessionStorage.removeItem('searchData');
    sessionStorage.removeItem('pendingBusSelection');
    sessionStorage.removeItem('pendingTrainSelection');
    sessionStorage.removeItem('pendingFlightSelection');
    sessionStorage.removeItem('_bookingPageActive');
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
