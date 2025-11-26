import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { INDIAN_DISTRICTS, BUS_OPERATORS, BUS_SERVICE_TYPES, BUS_ROUTES } from '../../../data/indian-districts';
import { BookingDataService } from '../../../services/booking-data.service';
import { ToastService } from '../../../services/toast.service';
import { DiscountCoinsService, DiscountInfo } from '../../../services/discount-coins.service';
import { AuthService } from '../../../services/auth.service';
import { ValidationService } from '../../../services/validation.service';
import { FormErrorComponent } from '../../../components/form-error/form-error.component';

interface BusOption {
  id: number;
  operator: string;
  type: string;
  rating: number;
  reviews: number;
  departure: string;
  arrival: string;
  duration: string;
  amenities: string[];
  seatsLeft: number;
  price: number;
  busNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
  availableSeats?: number;
}

interface Passenger {
  // Mandatory Passenger Details
  fullName: string;
  age: number;
  gender: string;
  seatNumber: string;
  
  // Optional/Sometimes Required
  idProofType: string;
  idProofNumber: string;
  boardingPoint: string;
  droppingPoint: string;
  emergencyContact: string;
}

interface BookingContact {
  // Primary Contact Details (only once per booking)
  mobileNumber: string;
  emailId: string;
}

interface Seat {
  number: string;
  isBooked: boolean;
  isSelected: boolean;
  isAvailable: boolean;
  side: string;
}

@Component({
  selector: 'app-bus-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, FormErrorComponent],
  templateUrl: './bus-booking.html',
  styleUrls: ['./bus-booking.css']
})
export class BusBookingComponent implements OnInit, OnDestroy {
  fromCity: string = '';
  toCity: string = '';
  travelDate: string = '';
  returnDate: string = '';
  tripType: 'one-way' | 'round-trip' = 'one-way';
  showResults: boolean = false;
  selectedBus: BusOption | null = null;
  passengers: Passenger[] = [{
    fullName: '', 
    age: 0, 
    gender: '', 
    seatNumber: '',
    idProofType: '',
    idProofNumber: '',
    boardingPoint: '',
    droppingPoint: '',
    emergencyContact: ''
  }];
  
  bookingContact: BookingContact = {
    mobileNumber: '',
    emailId: ''
  };
  
  // Available options for dropdowns
  genderOptions = ['Male', 'Female', 'Other'];
  idProofTypes = ['Aadhaar Card', 'PAN Card', 'Driving License', 'Passport', 'Voter ID', 'Other'];
  
  // Seat selection properties
  showSeatSelection: boolean = false;
  selectedSeats: string[] = [];
  seatMap: { row: number; seats: Seat[] }[] = [];
  
  // Generate seat map (2+2 horizontal layout)
  generateSeatMap() {
    this.seatMap = [];
    const rows = 12; // 12 rows
    const seatsPerRow = 4; // 2+2 layout (A, B, C, D)
    
    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      
      // Left side seats (A, B)
      for (let seat = 0; seat < 2; seat++) {
        const seatLetter = String.fromCharCode(65 + seat); // A, B
        const seatNumber = `${row}${seatLetter}`;
        
        // Randomly mark some seats as booked (30% chance)
        const isBooked = Math.random() < 0.3;
        const isSelected = this.selectedSeats.includes(seatNumber);
        
        rowSeats.push({
          number: seatNumber,
          isBooked: isBooked,
          isSelected: isSelected,
          isAvailable: !isBooked && !isSelected,
          side: 'left'
        });
      }
      
      // Right side seats (C, D)
      for (let seat = 2; seat < 4; seat++) {
        const seatLetter = String.fromCharCode(65 + seat); // C, D
        const seatNumber = `${row}${seatLetter}`;
        
        // Randomly mark some seats as booked (30% chance)
        const isBooked = Math.random() < 0.3;
        const isSelected = this.selectedSeats.includes(seatNumber);
        
        rowSeats.push({
          number: seatNumber,
          isBooked: isBooked,
          isSelected: isSelected,
          isAvailable: !isBooked && !isSelected,
          side: 'right'
        });
      }
      
      this.seatMap.push({
        row: row,
        seats: rowSeats
      });
    }
  }
  
  // Import data
  districts: string[] = INDIAN_DISTRICTS;
  busOperators = BUS_OPERATORS;
  busServiceTypes = BUS_SERVICE_TYPES;
  busRoutes = BUS_ROUTES;
  
  // Get unique cities from bus routes
  get availableCities(): string[] {
    const cities = new Set<string>();
    this.busRoutes.forEach(route => {
      cities.add(route.from);
      cities.add(route.to);
    });
    return Array.from(cities).sort();
  }

  // Sample bus options
  busOptions: BusOption[] = [
    {
      id: 1,
      operator: 'RedBus',
      type: 'AC Sleeper',
      rating: 4.5,
      reviews: 1250,
      departure: '08:00',
      arrival: '14:30',
      duration: '6h 30m',
      amenities: ['AC', 'WiFi', 'Charging', 'Blanket'],
      seatsLeft: 12,
      price: 1200,
      busNumber: 'RB001',
      departureTime: '08:00 AM',
      arrivalTime: '02:30 PM',
      availableSeats: 12
    },
    {
      id: 2,
      operator: 'Volvo Travels',
      type: 'Non-AC Seater',
      rating: 4.2,
      reviews: 890,
      departure: '10:30',
      arrival: '17:00',
      duration: '6h 30m',
      amenities: ['WiFi', 'Charging', 'Water'],
      seatsLeft: 8,
      price: 800,
      busNumber: 'VT002',
      departureTime: '10:30 AM',
      arrivalTime: '05:00 PM',
      availableSeats: 8
    },
    {
      id: 3,
      operator: 'Orange Tours',
      type: 'AC Semi-Sleeper',
      rating: 4.7,
      reviews: 2100,
      departure: '22:00',
      arrival: '06:00',
      duration: '8h 00m',
      amenities: ['AC', 'WiFi', 'Charging', 'Blanket', 'Pillow'],
      seatsLeft: 15,
      price: 1500,
      busNumber: 'OT003',
      departureTime: '10:00 PM',
      arrivalTime: '06:00 AM',
      availableSeats: 15
    }
  ];

  // Discount and coins system
  selectedDiscountType: 'regular' | 'student' | 'senior' = 'regular';
  userCoins: number = 531;
  discountConfigs: DiscountInfo[] = [];
  userBookingStats: any = { totalBookings: 0 };

  // Authentication
  isLoggedIn: boolean = false;

  @ViewChild('contactForm') contactForm!: NgForm;

  constructor(
    private router: Router, 
    private bookingDataService: BookingDataService,
    private discountCoinsService: DiscountCoinsService,
    private toast: ToastService,
    private authService: AuthService,
    public validationService: ValidationService
  ) {}

  ngOnInit() {
    // Initialize discount system
    this.discountConfigs = this.discountCoinsService.getDiscountConfigs();
    
    // Subscribe to discount type changes
    this.discountCoinsService.getSelectedDiscountType().subscribe(type => {
      this.selectedDiscountType = type;
    });
    
    // Subscribe to coins changes
    this.discountCoinsService.getUserCoins().subscribe(coins => {
      this.userCoins = coins;
    });
    
    // Subscribe to booking stats
    this.discountCoinsService.getUserBookingStats().subscribe(stats => {
      this.userBookingStats = stats;
    });

    // Check authentication status
    this.authService.restoreUser();
    this.authService.user$.subscribe((user: any) => {
      this.isLoggedIn = !!user;
      
      // If user just logged in and we have a pending bus selection, restore it
      if (this.isLoggedIn && user) {
        const pendingBusSelection = sessionStorage.getItem('pendingBusSelection');
        if (pendingBusSelection) {
          try {
            const busData = JSON.parse(pendingBusSelection);
            this.selectedBus = busData.bus;
            this.busOptions = busData.busOptions || this.busOptions; // Restore bus options
            this.fromCity = busData.fromCity || this.fromCity;
            this.toCity = busData.toCity || this.toCity;
            this.travelDate = busData.travelDate || this.travelDate;
            this.returnDate = busData.returnDate || this.returnDate;
            this.tripType = busData.tripType || this.tripType;
            this.showResults = busData.showResults !== undefined ? busData.showResults : true;
            this.showSeatSelection = true;
            this.selectedSeats = [];
            this.generateSeatMap();
            
            // Save the restored state
            this.saveBookingState();
            
            // Clear the pending selection
            sessionStorage.removeItem('pendingBusSelection');
            this.toast.success('Welcome back! You can now proceed with your booking.');
          } catch (error) {
            console.error('Error restoring bus selection:', error);
            sessionStorage.removeItem('pendingBusSelection');
          }
        }
      }
    });

    // Check if coming from packages page - skip search and go directly to passenger selection
    const fromPackage = sessionStorage.getItem('fromPackage');
    const selectedPackageOption = sessionStorage.getItem('selectedPackageOption');
    
    if (fromPackage === 'true' && selectedPackageOption) {
      try {
        const option = JSON.parse(selectedPackageOption);
        const searchData = sessionStorage.getItem('searchData');
        
        if (searchData) {
          const data = JSON.parse(searchData);
          this.fromCity = data.from;
          this.toCity = data.to;
          this.travelDate = data.date;
        }
        
        // Set the selected bus directly and show passenger selection
        this.selectedBus = option;
        this.showResults = true;
        
        // Clear package flags
        sessionStorage.removeItem('fromPackage');
        sessionStorage.removeItem('selectedPackageOption');
        sessionStorage.removeItem('searchData');
        
        // Generate seat map for the selected bus
        this.generateSeatMap();
        // Mark that we're on a booking page
        sessionStorage.setItem('_bookingPageActive', 'true');
        return;
      } catch (error) {
        console.error('Error parsing package option:', error);
      }
    }
    
    // Check if we're coming from navigation (not refresh)
    // If _bookingPageActive flag is not set, we're coming from outside, so clear state
    const isBookingPageActive = sessionStorage.getItem('_bookingPageActive');
    if (!isBookingPageActive) {
      // Coming from outside booking pages - clear all saved state completely
      sessionStorage.removeItem('busBookingState');
      // Reset form values to empty
      this.fromCity = '';
      this.toCity = '';
      this.travelDate = '';
      this.returnDate = '';
      this.tripType = 'one-way';
      this.showResults = false;
      this.selectedBus = null;
      this.busOptions = [];
      this.selectedSeats = [];
      this.passengers = [];
      this.bookingContact = { mobileNumber: '', emailId: '' };
    }
    
    // Check for search data from home page (restored after login)
    const searchData = sessionStorage.getItem('searchData');
    if (searchData) {
      try {
        const data = JSON.parse(searchData);
        if (data.transportType === 'bus') {
          this.fromCity = data.from || this.fromCity;
          this.toCity = data.to || this.toCity;
          this.travelDate = data.date || this.travelDate;
          this.returnDate = data.returnDate || this.returnDate;
          this.tripType = data.tripType === 'roundtrip' ? 'round-trip' : 'one-way';
          // Clear the search data after using it
          sessionStorage.removeItem('searchData');
          // Mark that we're on a booking page
          sessionStorage.setItem('_bookingPageActive', 'true');
          // Automatically search for buses
          this.searchBuses();
          return;
        }
      } catch (error) {
        console.error('Error parsing search data:', error);
        sessionStorage.removeItem('searchData');
      }
    }
    
    // Only restore state if we're on a booking page (refresh scenario)
    if (isBookingPageActive) {
      const savedBookingState = sessionStorage.getItem('busBookingState');
      if (savedBookingState) {
        try {
          const state = JSON.parse(savedBookingState);
          this.fromCity = state.fromCity || this.fromCity;
          this.toCity = state.toCity || this.toCity;
          this.travelDate = state.travelDate || this.travelDate;
          this.returnDate = state.returnDate || this.returnDate;
          this.tripType = state.tripType || this.tripType;
          this.showResults = state.showResults || false;
          this.selectedBus = state.selectedBus || null;
          this.busOptions = state.busOptions || []; // Restore bus options
          this.selectedSeats = state.selectedSeats || [];
          this.passengers = state.passengers || this.passengers;
          this.bookingContact = state.bookingContact || this.bookingContact;
          
          // If bus was selected, restore seat map
          if (this.selectedBus) {
            this.generateSeatMap();
          }
          
          // If results were shown but bus options are missing, restore them
          if (this.showResults && this.busOptions.length === 0) {
            // Re-search to restore results if we have search criteria
            if (this.fromCity && this.toCity && this.travelDate) {
              this.searchBuses();
            }
          }
        } catch (error) {
          console.error('Error restoring booking state:', error);
          sessionStorage.removeItem('busBookingState');
        }
      }
    } else {
      // Set default date to today if no search data
      const today = new Date();
      this.travelDate = today.toISOString().split('T')[0];
    }
    
    // Mark that we're on a booking page
    sessionStorage.setItem('_bookingPageActive', 'true');
    
    // Subscribe to router events to detect navigation away
    this.setupNavigationListener();
    
    // Save state whenever it changes
    this.saveBookingState();
  }

  private routerSubscription?: Subscription;

  setupNavigationListener() {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // If navigating away from booking pages, clear state and flag
        const currentUrl = event.url;
        if (!currentUrl.includes('/booking/bus') && !currentUrl.includes('/booking/train') && !currentUrl.includes('/booking/plane')) {
          sessionStorage.removeItem('busBookingState');
          sessionStorage.removeItem('_bookingPageActive');
        }
      });
  }

  ngOnDestroy() {
    // Unsubscribe from router events
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Save booking state to sessionStorage (for refresh persistence)
  saveBookingState() {
    const state = {
      fromCity: this.fromCity,
      toCity: this.toCity,
      travelDate: this.travelDate,
      returnDate: this.returnDate,
      tripType: this.tripType,
      showResults: this.showResults,
      selectedBus: this.selectedBus,
      busOptions: this.busOptions, // Save bus options for restoration
      selectedSeats: this.selectedSeats,
      passengers: this.passengers,
      bookingContact: this.bookingContact
    };
    sessionStorage.setItem('busBookingState', JSON.stringify(state));
  }

  searchBuses() {
    if (!this.fromCity || !this.toCity || !this.travelDate) {
      this.toast.warning('Please select both departure and destination cities and a travel date.');
      return;
    }

    // Validate that from and to cities are different
    if (this.fromCity === this.toCity) {
      this.toast.warning('From and To cities cannot be the same. Please select different cities.');
      return;
    }
    
    if (this.tripType === 'round-trip' && !this.returnDate) {
      this.toast.info('Please select return date for round trip');
      return;
    }
    
    // Find the route information
    const route = this.busRoutes.find(r => 
      (r.from === this.fromCity && r.to === this.toCity) ||
      (r.from === this.toCity && r.to === this.fromCity)
    );
    
    if (route) {
      // Generate bus options based on the route
      this.generateBusOptions(route);
    } else {
      // Generate default options for routes not in our database
      this.generateDefaultBusOptions();
    }
    
    this.showResults = true;
    this.selectedBus = null;
    // Mark that we're on a booking page for state persistence
    sessionStorage.setItem('_bookingPageActive', 'true');
    this.saveBookingState();
  }

  swapCities() {
    if (this.fromCity && this.toCity) {
      const temp = this.fromCity;
      this.fromCity = this.toCity;
      this.toCity = temp;
      this.saveBookingState();
    }
  }

  onTripTypeChange() {
    if (this.tripType === 'one-way') {
      this.returnDate = '';
    }
    this.saveBookingState();
  }

  onFromCityChange() {
    // If from city is same as to city, clear to city
    if (this.fromCity && this.fromCity === this.toCity) {
      this.toCity = '';
      this.toast.warning('From and To cities cannot be the same');
    }
    this.saveBookingState();
  }

  onToCityChange() {
    // If to city is same as from city, clear it and show error
    if (this.toCity && this.toCity === this.fromCity) {
      this.toCity = '';
      this.toast.warning('From and To cities cannot be the same');
    }
    this.saveBookingState();
  }

  // Discount system methods
  selectDiscountType(type: 'regular' | 'student' | 'senior') {
    this.discountCoinsService.selectDiscountType(type);
  }

  canUseDiscountType(type: 'regular' | 'student' | 'senior'): boolean {
    return this.discountCoinsService.canUseDiscountType(type);
  }

  getDiscountInfo(type: 'regular' | 'student' | 'senior'): DiscountInfo {
    return this.discountConfigs.find(config => config.type === type) || this.discountConfigs[0];
  }

  getCurrentCoinsEarned(type: 'regular' | 'student' | 'senior'): number {
    return this.discountCoinsService.getCurrentCoinsEarned(type);
  }

  generateBusOptions(route: any) {
    const isReverse = route.from === this.toCity;
    const distance = route.distance;
    const basePrice = route.price;
    const baseDuration = route.duration;
    
    // Generate 50+ random bus options with different operators and service types
    const selectedOperators = this.getRandomOperators(50);
    const selectedServiceTypes = this.getRandomServiceTypes(50);
    const departureTimes = this.generateDepartureTimes(50);
    
    this.busOptions = selectedOperators.map((operator, index) => ({
      id: index + 1,
      operator: operator.name,
      type: selectedServiceTypes[index],
      rating: this.getRandomRating(),
      reviews: this.getRandomReviews(),
      departure: departureTimes[index],
      arrival: this.calculateArrivalTime(departureTimes[index], baseDuration),
      duration: baseDuration,
      amenities: this.getAmenitiesForServiceType(selectedServiceTypes[index]),
      seatsLeft: Math.floor(Math.random() * 20) + 5,
      price: Math.floor(basePrice * this.getPriceMultiplier(selectedServiceTypes[index])),
      busNumber: this.generateBusNumber(operator.name),
      departureTime: this.formatTime(departureTimes[index]),
      arrivalTime: this.formatTime(this.calculateArrivalTime(departureTimes[index], baseDuration)),
      availableSeats: Math.floor(Math.random() * 20) + 5
    }));
  }

  getRandomOperators(count: number) {
    const shuffled = [...this.busOperators].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  getRandomServiceTypes(count: number) {
    const shuffled = [...this.busServiceTypes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  generateDepartureTimes(count: number) {
    const times = [];
    for (let i = 0; i < count; i++) {
      // Generate times from 5:00 AM to 11:30 PM
      const hour = Math.floor(Math.random() * 19) + 5; // 5 to 23
      const minute = Math.random() < 0.5 ? 0 : 30; // 0 or 30 minutes
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
    return times.sort(); // Sort by time
  }

  getRandomRating() {
    return Math.round((Math.random() * 1.5 + 3.5) * 10) / 10; // 3.5 to 5.0
  }

  getRandomReviews() {
    return Math.floor(Math.random() * 2000) + 100; // 100 to 2100
  }

  getAmenitiesForServiceType(serviceType: string) {
    const baseAmenities = ['WiFi', 'Charging'];
    
    // Check if serviceType exists and is a string
    if (!serviceType || typeof serviceType !== 'string') {
      return baseAmenities;
    }
    
    if (serviceType.includes('AC')) {
      baseAmenities.push('AC');
    }
    
    if (serviceType.includes('Sleeper') || serviceType.includes('Luxury') || serviceType.includes('Deluxe')) {
      baseAmenities.push('Blanket', 'Pillow');
    }
    
    if (serviceType.includes('Volvo') || serviceType.includes('Mercedes') || serviceType.includes('Scania')) {
      baseAmenities.push('Entertainment', 'Water');
    }
    
    return baseAmenities;
  }

  getPriceMultiplier(serviceType: string) {
    // Check if serviceType exists and is a string
    if (!serviceType || typeof serviceType !== 'string') {
      return 1.0; // Default multiplier
    }
    
    if (serviceType.includes('Volvo') || serviceType.includes('Mercedes') || serviceType.includes('Scania')) {
      return 1.4; // Premium brands
    }
    if (serviceType.includes('Luxury') || serviceType.includes('Deluxe') || serviceType.includes('Executive')) {
      return 1.3; // Luxury services
    }
    if (serviceType.includes('AC')) {
      return 1.1; // AC services
    }
    return 0.9; // Non-AC services
  }

  generateBusNumber(operatorName: string) {
    if (!operatorName || typeof operatorName !== 'string') {
      return 'XX0000';
    }
    const prefix = operatorName.substring(0, 2).toUpperCase();
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}${number}`;
  }

  formatTime(time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  generateDefaultBusOptions() {
    // Use random operators and service types for default options
    const selectedOperators = this.getRandomOperators(50);
    const selectedServiceTypes = this.getRandomServiceTypes(50);
    const departureTimes = this.generateDepartureTimes(50);
    
    this.busOptions = selectedOperators.map((operator, index) => ({
      id: index + 1,
      operator: operator.name,
      type: selectedServiceTypes[index],
      rating: this.getRandomRating(),
      reviews: this.getRandomReviews(),
      departure: departureTimes[index],
      arrival: this.calculateArrivalTime(departureTimes[index], '6h 30m'),
      duration: '6h 30m',
      amenities: this.getAmenitiesForServiceType(selectedServiceTypes[index]),
      seatsLeft: Math.floor(Math.random() * 20) + 5,
      price: Math.floor(1200 * this.getPriceMultiplier(selectedServiceTypes[index])),
      busNumber: this.generateBusNumber(operator.name),
      departureTime: this.formatTime(departureTimes[index]),
      arrivalTime: this.formatTime(this.calculateArrivalTime(departureTimes[index], '6h 30m')),
      availableSeats: Math.floor(Math.random() * 20) + 5
    }));
  }

  calculateArrivalTime(departureTime: string, duration: string): string {
    // Simple calculation - in real app, you'd use proper date/time handling
    const [hours, minutes] = departureTime.split(':').map(Number);
    const [durHours, durMinutes] = duration.split('h ')[0].split('m')[0].split(' ').map(Number);
    
    let arrivalHours = hours + durHours;
    let arrivalMinutes = minutes + (durMinutes || 0);
    
    if (arrivalMinutes >= 60) {
      arrivalHours += 1;
      arrivalMinutes -= 60;
    }
    
    if (arrivalHours >= 24) {
      arrivalHours -= 24;
    }
    
    return `${arrivalHours.toString().padStart(2, '0')}:${arrivalMinutes.toString().padStart(2, '0')}`;
  }

  selectBus(bus: BusOption) {
    // Check if user is logged in
    if (!this.isLoggedIn) {
      // Store the selected bus, options, and current search data for restoration after login
      const busSelectionData = {
        bus: bus,
        busOptions: this.busOptions, // Save all bus options so they can be restored
        fromCity: this.fromCity,
        toCity: this.toCity,
        travelDate: this.travelDate,
        returnDate: this.returnDate,
        tripType: this.tripType,
        showResults: true // Ensure we show results page after login
      };
      sessionStorage.setItem('pendingBusSelection', JSON.stringify(busSelectionData));
      
      // Show info message and redirect to login
      this.toast.info('Please login to continue with booking');
      this.router.navigate(['/login'], {
        state: {
          returnUrl: '/booking/bus'
        }
      });
      return;
    }
    
    // User is logged in, proceed with bus selection
    this.selectedBus = bus;
    // Keep showResults true so back button can return to options
    this.showResults = true;
    this.showSeatSelection = true; // Open by default
    this.selectedSeats = []; // Reset selected seats
    this.generateSeatMap(); // Generate seat map immediately
    // Save state after selecting bus
    this.saveBookingState();
    this.saveBookingState();
  }

  toggleSeatSelection() {
    this.showSeatSelection = !this.showSeatSelection;
    if (this.showSeatSelection) {
      this.generateSeatMap();
    }
  }

  selectSeat(seatNumber: string) {
    if (this.selectedSeats.includes(seatNumber)) {
      // Deselect seat
      this.selectedSeats = this.selectedSeats.filter(seat => seat !== seatNumber);
    } else {
      // Check if we can select more seats
      if (this.selectedSeats.length < this.passengers.length) {
        this.selectedSeats.push(seatNumber);
      } else {
        this.toast.info(`You can only select ${this.passengers.length} seat(s) for ${this.passengers.length} passenger(s)`);
        return;
      }
    }
    
    // Update seat map
    this.generateSeatMap();
    // Update passenger seat numbers
    this.updatePassengerSeats();
    this.saveBookingState();
  }

  updatePassengerSeats() {
    this.passengers.forEach((passenger, index) => {
      if (this.selectedSeats[index]) {
        passenger.seatNumber = this.selectedSeats[index];
      }
    });
  }

  getAvailableSeatsCount(): number {
    if (!this.seatMap || this.seatMap.length === 0) {
      return 48; // Default total seats (12 rows × 4 seats)
    }
    return this.seatMap.reduce((count, row) => {
      return count + row.seats.filter((seat: any) => seat.isAvailable).length;
    }, 0);
  }

  getSelectedSeatsCount(): number {
    return this.selectedSeats.length;
  }

  addPassenger() {
    this.passengers.push({
      fullName: '', 
      age: 0, 
      gender: '', 
      seatNumber: '',
      idProofType: '',
      idProofNumber: '',
      boardingPoint: '',
      droppingPoint: '',
      emergencyContact: ''
    });
    this.assignSeatNumbers();
    this.saveBookingState();
  }

  removePassenger(index: number) {
    if (this.passengers.length > 1) {
      this.passengers.splice(index, 1);
      this.assignSeatNumbers();
      this.saveBookingState();
    }
  }

  assignSeatNumbers() {
    this.passengers.forEach((passenger, index) => {
      if (!passenger.seatNumber) {
        passenger.seatNumber = this.selectedSeats[index] || `AUTO${index + 1}`;
      }
    });
  }

  isIdProofRequired(): boolean {
    if (!this.selectedBus) return false;
    
    // ID proof required for government buses or AC sleeper routes
    const governmentOperators = ['APSRTC', 'TSRTC', 'MSRTC', 'GSRTC', 'RSRTC', 'KSRTC', 'UPSRTC', 'OSRTC', 'BSRTC', 'HPRTC', 'JSRTC', 'PSRTC', 'WBTC', 'ASRTC', 'BRSRTC', 'CTSRTC', 'GOSRTC', 'HRSRTC', 'HPSRTC', 'JHSRTC', 'KASRTC', 'KLSRTC', 'MHSRTC', 'MZSRTC', 'NLSRTC', 'ODSRTC', 'PBSRTC', 'RJSRTC', 'SKSRTC', 'TNSRTC', 'TGSRTC', 'TPSRTC', 'UKSRTC', 'WBSRTC'];
    const isGovernmentBus = governmentOperators.some(op => this.selectedBus?.operator.includes(op));
    const isACSleeper = this.selectedBus?.type.includes('AC') && this.selectedBus?.type.includes('Sleeper');
    
    return isGovernmentBus || isACSleeper;
  }


  proceedToPayment() {
    // Validate all required fields
    const isValid = this.validatePassengerDetails();
    if (isValid) {
      // Prepare booking data for payment page
      const bookingData = {
        fromCity: this.fromCity,
        toCity: this.toCity,
        travelDate: this.travelDate,
        selectedMode: 'bus',
        selectedBus: this.selectedBus,
        passengers: this.passengers,
        contact: this.bookingContact,
        selectedSeats: this.selectedSeats,
        totalPrice: this.getTotalPrice(),
        totalCoins: this.getTotalCoins(),
        isRoundTrip: this.tripType === 'round-trip',
        returnDate: this.returnDate,
        returnTime: this.tripType === 'round-trip' ? this.selectedBus?.arrivalTime : undefined,
        returnOperator: this.tripType === 'round-trip' ? this.selectedBus?.operator : undefined,
        returnSeatNumbers: this.tripType === 'round-trip' ? this.selectedSeats : undefined
      };

      console.log('Sending booking data to payment:', bookingData);
      console.log('Total price:', this.getTotalPrice());
      console.log('Selected bus:', this.selectedBus);

      // Store booking data in service
      this.bookingDataService.setBookingData(bookingData);

      // Navigate to payment page with booking data
      this.router.navigate(['/payment'], { 
        state: { bookingData: bookingData } 
      });
    }
  }

  onMobileBlur() {
    if (this.bookingContact.mobileNumber) {
      this.bookingContact.mobileNumber = this.validationService.trim(this.bookingContact.mobileNumber);
      this.bookingContact.mobileNumber = this.bookingContact.mobileNumber.replace(/\D/g, ''); // Remove non-digits
    }
  }

  onEmailBlur() {
    if (this.bookingContact.emailId) {
      this.bookingContact.emailId = this.validationService.trim(this.bookingContact.emailId);
    }
  }

  validatePassengerDetails(): boolean {
    // Validate contact form first
    if (this.contactForm && this.contactForm.invalid) {
      this.toast.warning('Please fill all contact details correctly');
      if (this.contactForm) {
        const formElement = document.querySelector('.contact-form');
        if (formElement) {
          this.validationService.focusFirstInvalid(this.contactForm, formElement as HTMLElement);
        }
      }
      return false;
    }

    // Check if seats are selected
    if (this.selectedSeats.length !== this.passengers.length) {
      this.toast.info(`Please select ${this.passengers.length} seat(s) for ${this.passengers.length} passenger(s)`);
      // Scroll to seat selection
      setTimeout(() => {
        const seatSection = document.querySelector('.seat-selection-section');
        if (seatSection) {
          seatSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return false;
    }

    // Check if all mandatory fields are filled
    for (let i = 0; i < this.passengers.length; i++) {
      const passenger = this.passengers[i];
      
      // Trim and validate full name
      if (passenger.fullName) {
        passenger.fullName = this.validationService.removeExtraSpaces(passenger.fullName);
      }
      
      if (!passenger.fullName || passenger.fullName.trim().length === 0) {
        this.toast.warning(`Passenger ${i + 1}: Full name is required`);
        setTimeout(() => {
          const passengerForm = document.querySelector(`.passenger-form:nth-child(${i + 1})`);
          if (passengerForm) {
            passengerForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return false;
      }

      if (!passenger.age || passenger.age <= 0 || passenger.age > 120) {
        this.toast.warning(`Passenger ${i + 1}: Please enter a valid age (1-120)`);
        setTimeout(() => {
          const passengerForm = document.querySelector(`.passenger-form:nth-child(${i + 1})`);
          if (passengerForm) {
            passengerForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return false;
      }

      if (!passenger.gender) {
        this.toast.warning(`Passenger ${i + 1}: Gender is required`);
        setTimeout(() => {
          const passengerForm = document.querySelector(`.passenger-form:nth-child(${i + 1})`);
          if (passengerForm) {
            passengerForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return false;
      }

      if (!passenger.seatNumber) {
        this.toast.warning(`Passenger ${i + 1}: Please select a seat`);
        setTimeout(() => {
          const seatSection = document.querySelector('.seat-selection-section');
          if (seatSection) {
            seatSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return false;
      }
    }

    // Validate contact details
    if (!this.bookingContact.mobileNumber || !this.validationService.mobileCheck(this.bookingContact.mobileNumber)) {
      this.toast.warning('Please enter a valid 10-digit mobile number');
      return false;
    }

    if (!this.bookingContact.emailId || !this.validationService.emailCheck(this.bookingContact.emailId)) {
      this.toast.warning('Please enter a valid email address');
      return false;
    }

    // Check ID proof if required
    if (this.isIdProofRequired()) {
      for (let i = 0; i < this.passengers.length; i++) {
        const passenger = this.passengers[i];
        if (!passenger.idProofType || !passenger.idProofNumber) {
          this.toast.error(`ID proof is required. Please fill ID proof details for Passenger ${i + 1}.`);
          // Scroll to the passenger's ID proof section
          setTimeout(() => {
            const passengerForm = document.querySelector(`.passenger-form:nth-child(${i + 1})`);
            if (passengerForm) {
              passengerForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Highlight the ID proof fields
              const idProofSection = passengerForm.querySelector('.form-section');
              if (idProofSection) {
                idProofSection.classList.add('validation-error');
                setTimeout(() => {
                  idProofSection.classList.remove('validation-error');
                }, 3000);
              }
            }
          }, 100);
          return false;
        }
      }
    }

    return true;
  }

  getTotalPrice(): number {
    if (!this.selectedBus) return 0;
    // Standard pricing - no discounts applied
    return this.selectedBus.price * this.passengers.length;
  }

  getTotalCoins(): number {
    // Get coins based on selected discount type and booking stats
    return this.discountCoinsService.getCurrentCoinsEarned(this.selectedDiscountType);
  }


  goBack() {
    // Clear booking state and flag when navigating back
    sessionStorage.removeItem('busBookingState');
    sessionStorage.removeItem('_bookingPageActive');
    this.router.navigate(['/booking']);
  }

  goBackToSearch() {
    // Step 3 → Step 2: Clear selected bus to go back to options view
    this.selectedBus = null;
    // Ensure showResults is true to display bus options
    this.showResults = true;
    // If bus options are empty, try to restore from saved state first
    if (this.busOptions.length === 0) {
      const savedState = sessionStorage.getItem('busBookingState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          if (state.busOptions && state.busOptions.length > 0) {
            this.busOptions = state.busOptions;
          } else if (this.fromCity && this.toCity && this.travelDate) {
            // Re-search to get bus options if not in saved state
            this.searchBuses();
          }
        } catch (error) {
          console.error('Error restoring bus options:', error);
          // If restore fails and we have search criteria, re-search
          if (this.fromCity && this.toCity && this.travelDate) {
            this.searchBuses();
          }
        }
      } else if (this.fromCity && this.toCity && this.travelDate) {
        // No saved state, but we have search criteria - re-search
        this.searchBuses();
      }
      // If still no options and no search criteria, stay on options page (showResults = true)
      // Don't go back to search form - user should see empty results or re-search
    }
    // Save state after navigation
    this.saveBookingState();
  }

  goBackToSearchForm() {
    // Step 2 → Step 1: Go back to search form while preserving form values
    this.showResults = false;
    // Clear selected bus and options to reset to search form
    this.selectedBus = null;
    // Preserve form values (fromCity, toCity, travelDate, etc.) - they remain in component
    // Save state to preserve form values
    this.saveBookingState();
  }

  // Get today's date in YYYY-MM-DD format
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Get minimum date for return date (should be same as or after departure date)
  getMinReturnDate(): string {
    return this.travelDate || this.getTodayDate();
  }
}
