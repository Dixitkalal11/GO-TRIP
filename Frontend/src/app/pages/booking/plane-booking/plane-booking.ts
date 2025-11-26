import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { BookingDataService } from '../../../services/booking-data.service';
import { 
  INDIAN_DISTRICTS, 
  INDIAN_AIRPORTS, 
  FLIGHT_OPERATORS, 
  FLIGHT_TYPES, 
  FLIGHT_ROUTES,
  getRoutesByCities,
  getAmenitiesForFlightType,
  getPriceMultiplier,
  getAllAirportCities,
  getDistrictsWithAirports
} from '../../../data/plane-data';
import { DiscountCoinsService, DiscountInfo } from '../../../services/discount-coins.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';
import { ValidationService } from '../../../services/validation.service';
import { FormErrorComponent } from '../../../components/form-error/form-error.component';

interface Passenger {
  fullName: string;
  age: number;
  gender: string;
  seatNumber: string;
  idProofType: string;
  idProofNumber: string;
  emergencyContact: string;
  mealPreference: string;
  seatPreference: string;
  frequentFlyerNumber: string;
  passportNumber: string;
  nationality: string;
  travelInsurance: boolean;
  // Additional passenger details
  dateOfBirth: string;
  title: string;
  specialAssistance: string;
  baggagePreference: string;
}

interface BookingContact {
  mobileNumber: string;
  emailId: string;
}

interface FlightOption {
  id: string;
  operator: string;
  flightNumber: string;
  aircraftType: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  classType: string;
  amenities: string[];
  stops: number;
  baggage: string;
  cancellationPolicy: string;
  rating: number;
  reviews: number;
  seatsLeft: number;
}

@Component({
  selector: 'app-plane-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, FormErrorComponent],
  templateUrl: './plane-booking.html',
  styleUrls: ['./plane-booking.css']
})
export class PlaneBookingComponent implements OnInit, OnDestroy {
  // Search parameters
  fromCity: string = '';
  toCity: string = '';
  travelDate: string = '';
  returnDate: string = '';
  tripType: 'one-way' | 'round-trip' = 'one-way';
  passengerCount: number = 1;
  
  // Data arrays
  districts: string[] = INDIAN_DISTRICTS;
  airportCities: string[] = getAllAirportCities();
  flightOperators: string[] = FLIGHT_OPERATORS;
  flightTypes: any[] = FLIGHT_TYPES;
  flightRoutes: any[] = FLIGHT_ROUTES;
  
  // Search results
  showResults: boolean = false;
  flightOptions: FlightOption[] = [];
  selectedFlight: FlightOption | null = null;
  
  // Passenger details
  passengers: Passenger[] = [];
  bookingContact: BookingContact = {
    mobileNumber: '',
    emailId: ''
  };
  
  // Form options
  genderOptions = ['Male', 'Female', 'Other'];
  idProofTypes = ['Aadhaar Card', 'Passport', 'Driving License', 'Voter ID'];
  mealPreferences = ['Vegetarian', 'Non-Vegetarian', 'Jain', 'Muslim', 'No Meal'];
  seatPreferences = ['Window', 'Aisle', 'Middle', 'No Preference'];
  nationalityOptions = ['Indian', 'Foreign National'];
  
  // Additional form options
  titleOptions = ['Mr', 'Ms', 'Mrs', 'Mstr', 'Miss'];
  specialAssistanceOptions = ['None', 'Wheelchair', 'Visual Aid', 'Hearing Aid', 'Mobility Assistance', 'Other'];
  baggagePreferenceOptions = ['15kg', '20kg', '25kg', '30kg', 'No Check-in'];
  
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
      
      // If user just logged in and we have a pending flight selection, restore it
      if (this.isLoggedIn && user) {
        const pendingFlightSelection = sessionStorage.getItem('pendingFlightSelection');
        if (pendingFlightSelection) {
          try {
            const flightData = JSON.parse(pendingFlightSelection);
            this.selectedFlight = flightData.flight;
            this.flightOptions = flightData.flightOptions || this.flightOptions; // Restore flight options
            this.fromCity = flightData.fromCity || this.fromCity;
            this.toCity = flightData.toCity || this.toCity;
            this.travelDate = flightData.travelDate || this.travelDate;
            this.returnDate = flightData.returnDate || this.returnDate;
            this.tripType = flightData.tripType || this.tripType;
            this.showResults = flightData.showResults !== undefined ? flightData.showResults : true;
            
            // Generate seat numbers for passengers
            this.generateSeatNumbers();
            
            // Save the restored state
            this.saveBookingState();
            
            // Clear the pending selection
            sessionStorage.removeItem('pendingFlightSelection');
            this.toast.success('Welcome back! You can now proceed with your booking.');
          } catch (error) {
            console.error('Error restoring flight selection:', error);
            sessionStorage.removeItem('pendingFlightSelection');
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
        
        // Set the selected flight directly and show passenger selection
        this.selectedFlight = option;
        this.showResults = true;
        
        // Clear package flags
        sessionStorage.removeItem('fromPackage');
        sessionStorage.removeItem('selectedPackageOption');
        sessionStorage.removeItem('searchData');
        
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
      sessionStorage.removeItem('planeBookingState');
      // Reset form values to empty
      this.fromCity = '';
      this.toCity = '';
      this.travelDate = '';
      this.returnDate = '';
      this.tripType = 'one-way';
      this.showResults = false;
      this.selectedFlight = null;
      this.flightOptions = [];
      this.passengers = [];
      this.bookingContact = { mobileNumber: '', emailId: '' };
    }
    
    // Check for search data from home page (restored after login)
    const searchData = sessionStorage.getItem('searchData');
    if (searchData) {
      try {
        const data = JSON.parse(searchData);
        if (data.transportType === 'flight') {
          this.fromCity = data.from || this.fromCity;
          this.toCity = data.to || this.toCity;
          this.travelDate = data.date || this.travelDate;
          this.returnDate = data.returnDate || this.returnDate;
          this.tripType = data.tripType === 'roundtrip' ? 'round-trip' : 'one-way';
          // Clear the search data after using it
          sessionStorage.removeItem('searchData');
          // Mark that we're on a booking page
          sessionStorage.setItem('_bookingPageActive', 'true');
          // Automatically search for flights
          this.searchFlights();
          // Initialize with one passenger
          this.addPassenger();
          return;
        }
      } catch (error) {
        console.error('Error parsing search data:', error);
        sessionStorage.removeItem('searchData');
      }
    }
    
    // Only restore state if we're on a booking page (refresh scenario)
    if (isBookingPageActive) {
      const savedBookingState = sessionStorage.getItem('planeBookingState');
      if (savedBookingState) {
        try {
          const state = JSON.parse(savedBookingState);
          this.fromCity = state.fromCity || this.fromCity;
          this.toCity = state.toCity || this.toCity;
          this.travelDate = state.travelDate || this.travelDate;
          this.returnDate = state.returnDate || this.returnDate;
          this.tripType = state.tripType || this.tripType;
          this.showResults = state.showResults || false;
          this.selectedFlight = state.selectedFlight || null;
          this.flightOptions = state.flightOptions || []; // Restore flight options
          this.passengers = state.passengers || this.passengers;
          this.bookingContact = state.bookingContact || this.bookingContact;
          
          // If results were shown but flight options are missing, restore them
          // This is needed even when selectedFlight is set, so back button works
          if (this.showResults && this.flightOptions.length === 0) {
            // Re-search to restore results if we have search criteria
            if (this.fromCity && this.toCity && this.travelDate) {
              this.searchFlights();
            }
          }
        } catch (error) {
          console.error('Error restoring booking state:', error);
          sessionStorage.removeItem('planeBookingState');
        }
      }
    } else {
      // Set default date to today if no search data
      const today = new Date();
      this.travelDate = today.toISOString().split('T')[0];
    }
    
    // Initialize with one passenger
    this.addPassenger();
    
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
          sessionStorage.removeItem('planeBookingState');
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
      selectedFlight: this.selectedFlight,
      flightOptions: this.flightOptions, // Save flight options for restoration
      passengers: this.passengers,
      bookingContact: this.bookingContact
    };
    sessionStorage.setItem('planeBookingState', JSON.stringify(state));
  }

  searchFlights() {
    if (!this.fromCity || !this.toCity || !this.travelDate) {
      this.toast.warning('Please fill in all search fields');
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

    // Check if both cities have airports
    const fromHasAirport = this.airportCities.includes(this.fromCity);
    const toHasAirport = this.airportCities.includes(this.toCity);
    
    if (!fromHasAirport || !toHasAirport) {
      this.toast.info('One or both cities do not have airports. Please select cities with airports.');
      return;
    }

    // Find matching routes
    const matchingRoutes = getRoutesByCities(this.fromCity, this.toCity);
    
    if (matchingRoutes.length > 0) {
      this.generateFlightOptions(matchingRoutes[0]);
    } else {
      this.generateDefaultFlightOptions();
    }
    
    this.showResults = true;
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

  generateFlightOptions(route: any) {
    this.flightOptions = [];
    const basePrice = 2000; // Base price for flights
    
    for (let i = 0; i < 50; i++) {
      const operator = this.getRandomOperator();
      const flightType = this.getRandomFlightType();
      const departureTime = this.generateDepartureTime();
      const duration = route.duration;
      const arrivalTime = this.calculateArrivalTime(departureTime, duration);
      
      const flight: FlightOption = {
        id: `flight-${i + 1}`,
        operator: operator,
        flightNumber: this.generateFlightNumber(operator),
        aircraftType: this.getRandomAircraftType(),
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        duration: duration,
        price: Math.floor(basePrice * getPriceMultiplier(flightType.name) * (0.8 + Math.random() * 0.4)),
        classType: flightType.name,
        amenities: getAmenitiesForFlightType(flightType.name),
        stops: Math.random() < 0.7 ? 0 : 1, // 70% direct flights
        baggage: this.getRandomBaggage(),
        cancellationPolicy: this.getRandomCancellationPolicy(),
        rating: 4.0 + Math.random() * 1.0, // 4.0 to 5.0 rating
        reviews: Math.floor(Math.random() * 500) + 50, // 50 to 550 reviews
        seatsLeft: Math.floor(Math.random() * 20) + 1 // 1 to 20 seats left
      };
      
      this.flightOptions.push(flight);
    }
    
    // Sort by departure time
    this.flightOptions.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }

  generateDefaultFlightOptions() {
    this.flightOptions = [];
    const basePrice = 2000;
    
    for (let i = 0; i < 50; i++) {
      const operator = this.getRandomOperator();
      const flightType = this.getRandomFlightType();
      const departureTime = this.generateDepartureTime();
      const duration = this.getRandomDuration();
      const arrivalTime = this.calculateArrivalTime(departureTime, duration);
      
      const flight: FlightOption = {
        id: `flight-${i + 1}`,
        operator: operator,
        flightNumber: this.generateFlightNumber(operator),
        aircraftType: this.getRandomAircraftType(),
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        duration: duration,
        price: Math.floor(basePrice * getPriceMultiplier(flightType.name) * (0.8 + Math.random() * 0.4)),
        classType: flightType.name,
        amenities: getAmenitiesForFlightType(flightType.name),
        stops: Math.random() < 0.7 ? 0 : 1,
        baggage: this.getRandomBaggage(),
        cancellationPolicy: this.getRandomCancellationPolicy(),
        rating: 4.0 + Math.random() * 1.0, // 4.0 to 5.0 rating
        reviews: Math.floor(Math.random() * 500) + 50, // 50 to 550 reviews
        seatsLeft: Math.floor(Math.random() * 20) + 1 // 1 to 20 seats left
      };
      
      this.flightOptions.push(flight);
    }
    
    this.flightOptions.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }

  getRandomOperator(): string {
    return this.flightOperators[Math.floor(Math.random() * this.flightOperators.length)];
  }

  getRandomFlightType(): any {
    return this.flightTypes[Math.floor(Math.random() * this.flightTypes.length)];
  }

  generateDepartureTime(): string {
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  getRandomDuration(): string {
    const durations = ['1h 15m', '1h 30m', '1h 45m', '2h 00m', '2h 15m', '2h 30m', '2h 45m', '3h 00m'];
    return durations[Math.floor(Math.random() * durations.length)];
  }

  calculateArrivalTime(departureTime: string, duration: string): string {
    const [depHours, depMinutes] = departureTime.split(':').map(Number);
    const [durHours, durMinutes] = duration.match(/(\d+)h (\d+)m/)?.slice(1).map(Number) || [0, 0];
    
    let arrHours = depHours + durHours;
    let arrMinutes = depMinutes + durMinutes;
    
    if (arrMinutes >= 60) {
      arrHours += 1;
      arrMinutes -= 60;
    }
    
    if (arrHours >= 24) {
      arrHours -= 24;
    }
    
    return `${arrHours.toString().padStart(2, '0')}:${arrMinutes.toString().padStart(2, '0')}`;
  }

  generateFlightNumber(operator: string): string {
    const prefixes: { [key: string]: string } = {
      'IndiGo': '6E',
      'Air India': 'AI',
      'Air India Express': 'IX',
      'SpiceJet': 'SG',
      'Akasa Air': 'QP',
      'Alliance Air': '9I',
      'Vistara': 'UK',
      'Go First': 'G8',
      'TruJet': '2T',
      'Star Air': 'S5'
    };
    
    const prefix = prefixes[operator] || 'XX';
    const number = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${number}`;
  }

  getRandomAircraftType(): string {
    const aircraft = ['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A321', 'Boeing 787', 'Airbus A350'];
    return aircraft[Math.floor(Math.random() * aircraft.length)];
  }

  getRandomBaggage(): string {
    const baggage = ['15kg', '20kg', '25kg', '30kg'];
    return baggage[Math.floor(Math.random() * baggage.length)];
  }

  getRandomCancellationPolicy(): string {
    const policies = ['Free cancellation up to 24h', 'Free cancellation up to 2h', 'No cancellation', 'Cancellation with fee'];
    return policies[Math.floor(Math.random() * policies.length)];
  }

  selectFlight(flight: FlightOption) {
    // Check if user is logged in
    if (!this.isLoggedIn) {
      // Store the selected flight, options, and current search data for restoration after login
      const flightSelectionData = {
        flight: flight,
        flightOptions: this.flightOptions, // Save all flight options so they can be restored
        fromCity: this.fromCity,
        toCity: this.toCity,
        travelDate: this.travelDate,
        returnDate: this.returnDate,
        tripType: this.tripType,
        showResults: true // Ensure we show results page after login
      };
      sessionStorage.setItem('pendingFlightSelection', JSON.stringify(flightSelectionData));
      
      // Show info message and redirect to login
      this.toast.info('Please login to continue with booking');
      this.router.navigate(['/login'], {
        state: {
          returnUrl: '/booking/plane'
        }
      });
      return;
    }
    
    // User is logged in, proceed with flight selection
    this.selectedFlight = flight;
    // Keep showResults true so back button can return to options
    this.showResults = true;
    // Generate seat numbers for passengers
    this.generateSeatNumbers();
    // Save state after selecting flight
    this.saveBookingState();
  }

  generateSeatNumbers() {
    this.passengers.forEach((passenger, index) => {
      const row = Math.floor(Math.random() * 30) + 1;
      const seat = String.fromCharCode(65 + Math.floor(Math.random() * 6)); // A-F
      passenger.seatNumber = `${row}${seat}`;
    });
  }

  addPassenger() {
    this.passengers.push({
      fullName: '',
      age: 0,
      gender: '',
      seatNumber: '',
      idProofType: '',
      idProofNumber: '',
      emergencyContact: '',
      mealPreference: '',
      seatPreference: '',
      frequentFlyerNumber: '',
      passportNumber: '',
      nationality: 'Indian',
      travelInsurance: false,
      // Additional passenger details
      dateOfBirth: '',
      title: '',
      specialAssistance: 'None',
      baggagePreference: '15kg'
    });
    this.saveBookingState();
  }

  removePassenger(index: number) {
    if (this.passengers.length > 1) {
      this.passengers.splice(index, 1);
      this.saveBookingState();
    }
  }

  isIdProofRequired(): boolean {
    return true; // ID proof is mandatory for flights
  }

  onMobileBlur() {
    if (this.bookingContact.mobileNumber) {
      this.bookingContact.mobileNumber = this.validationService.trim(this.bookingContact.mobileNumber);
      this.bookingContact.mobileNumber = this.bookingContact.mobileNumber.replace(/\D/g, '');
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
        const formElement = document.querySelector('.contact-details-section');
        if (formElement) {
          this.validationService.focusFirstInvalid(this.contactForm, formElement as HTMLElement);
        }
      }
      return false;
    }

    // Validate passenger mandatory fields
    for (let i = 0; i < this.passengers.length; i++) {
      const passenger = this.passengers[i];
      
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

      if (!passenger.emergencyContact) {
        this.toast.warning(`Passenger ${i + 1}: Emergency contact is required`);
        setTimeout(() => {
          const passengerForm = document.querySelector(`.passenger-form:nth-child(${i + 1})`);
          if (passengerForm) {
            passengerForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    if (!this.selectedFlight) return 0;
    // Standard pricing - no discounts applied
    return this.selectedFlight.price * this.passengers.length;
  }

  getTotalCoins(): number {
    // Get coins based on selected discount type and booking stats
    return this.discountCoinsService.getCurrentCoinsEarned(this.selectedDiscountType);
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
        selectedMode: 'plane',
        selectedPlane: this.selectedFlight,
        passengers: this.passengers,
        contact: this.bookingContact,
        selectedSeats: this.passengers.map(p => p.seatNumber),
        totalPrice: this.getTotalPrice(),
        totalCoins: this.getTotalCoins(),
        isRoundTrip: this.tripType === 'round-trip',
        returnDate: this.returnDate,
        returnTime: this.tripType === 'round-trip' ? this.selectedFlight?.arrivalTime : undefined,
        returnOperator: this.tripType === 'round-trip' ? this.selectedFlight?.operator : undefined,
        returnSeatNumbers: this.tripType === 'round-trip' ? this.passengers.map(p => p.seatNumber) : undefined
      };

      console.log('Sending booking data to payment:', bookingData);

      // Store booking data in service
      this.bookingDataService.setBookingData(bookingData);

      // Navigate to payment page with booking data
      this.router.navigate(['/payment'], { 
        state: { bookingData: bookingData } 
      });
    }
  }

  goBackToSearch() {
    // Step 3 → Step 2: Clear selected flight to go back to options view
    this.selectedFlight = null;
    // Ensure showResults is true to display flight options
    this.showResults = true;
    // If flight options are empty, try to restore from saved state first
    if (this.flightOptions.length === 0) {
      const savedState = sessionStorage.getItem('planeBookingState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          if (state.flightOptions && state.flightOptions.length > 0) {
            this.flightOptions = state.flightOptions;
          } else if (this.fromCity && this.toCity && this.travelDate) {
            // Re-search to get flight options if not in saved state
            this.searchFlights();
          }
        } catch (error) {
          console.error('Error restoring flight options:', error);
          // If restore fails and we have search criteria, re-search
          if (this.fromCity && this.toCity && this.travelDate) {
            this.searchFlights();
          }
        }
      } else if (this.fromCity && this.toCity && this.travelDate) {
        // No saved state, but we have search criteria - re-search
        this.searchFlights();
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
    // Clear selected flight and options to reset to search form
    this.selectedFlight = null;
    // Preserve form values (fromCity, toCity, travelDate, etc.) - they remain in component
    // Save state to preserve form values
    this.saveBookingState();
  }

  goBackToBooking() {
    // Clear booking state and flag when navigating back
    sessionStorage.removeItem('planeBookingState');
    sessionStorage.removeItem('_bookingPageActive');
    this.router.navigate(['/booking']);
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