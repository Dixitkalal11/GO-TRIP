import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { BookingDataService } from '../../../services/booking-data.service';
import { 
  INDIAN_DISTRICTS, 
  TRAIN_OPERATORS, 
  TRAIN_TYPES, 
  TRAIN_ROUTES,
  getRoutesByCities,
  getAmenitiesForTrainType,
  getPriceMultiplier
} from '../../../data/train-data';
import { DiscountCoinsService, DiscountInfo } from '../../../services/discount-coins.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';
import { ValidationService } from '../../../services/validation.service';
import { FormErrorComponent } from '../../../components/form-error/form-error.component';

interface TrainOption {
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
  trainNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
  availableSeats?: number;
  classType?: string;
}

interface Passenger {
  fullName: string;
  age: number;
  gender: string;
  seatNumber: string;
  idProofType: string;
  idProofNumber: string;
  emergencyContact: string;
  berthPreference: string;
  nationality: string;
  concessionType: string;
  foodPreference: string;
  coachClass: string;
  quotaType: string;
  travelInsurance: boolean;
}

interface BookingContact {
  mobileNumber: string;
  emailId: string;
}

@Component({
  selector: 'app-train-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, FormErrorComponent],
  templateUrl: './train-booking.html',
  styleUrls: ['./train-booking.css']
})
export class TrainBookingComponent implements OnInit, OnDestroy {
  fromCity: string = '';
  toCity: string = '';
  travelDate: string = '';
  returnDate: string = '';
  tripType: 'one-way' | 'round-trip' = 'one-way';
  showResults: boolean = false;
  selectedTrain: TrainOption | null = null;
  passengers: Passenger[] = [{ 
    fullName: '', 
    age: 0, 
    gender: '', 
    seatNumber: '',
    idProofType: '',
    idProofNumber: '',
    emergencyContact: '',
    berthPreference: '',
    nationality: 'Indian',
    concessionType: 'None',
    foodPreference: 'None',
    coachClass: '',
    quotaType: 'General',
    travelInsurance: false
  }];
  bookingContact: BookingContact = {
    mobileNumber: '',
    emailId: ''
  };

  // Data arrays
  districts = INDIAN_DISTRICTS;
  trainOperators = TRAIN_OPERATORS;
  trainTypes = TRAIN_TYPES;
  trainRoutes = TRAIN_ROUTES;
  
  // Get unique cities from train routes
  get availableCities(): string[] {
    const cities = new Set<string>();
    this.trainRoutes.forEach(route => {
      cities.add(route.from);
      cities.add(route.to);
    });
    return Array.from(cities).sort();
  }

  // Form options
  genderOptions = ['Male', 'Female', 'Other'];
  idProofTypes = ['Aadhaar Card', 'PAN Card', 'Driving License', 'Passport', 'Voter ID'];
  berthPreferences = ['Lower', 'Upper', 'Side Lower', 'Side Upper'];
  nationalityOptions = ['Indian', 'Foreign'];
  concessionTypes = ['None', 'Senior Citizen', 'Divyang'];
  foodPreferences = ['None', 'Veg', 'Non-Veg'];
  coachClasses = ['Sleeper (SL)', '3A', '2A', 'CC'];
  quotaTypes = ['General', 'Tatkal', 'Ladies'];

  // Generated train options
  trainOptions: TrainOption[] = [];

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
    // Initialize discount system similar to bus/flight
    this.discountConfigs = this.discountCoinsService.getDiscountConfigs();
    this.discountCoinsService.getSelectedDiscountType().subscribe(type => {
      this.selectedDiscountType = type;
    });
    this.discountCoinsService.getUserCoins().subscribe(coins => {
      this.userCoins = coins;
    });
    this.discountCoinsService.getUserBookingStats().subscribe(stats => {
      this.userBookingStats = stats;
    });

    // Check authentication status
    this.authService.restoreUser();
    this.authService.user$.subscribe((user: any) => {
      this.isLoggedIn = !!user;
      
      // If user just logged in and we have a pending train selection, restore it
      if (this.isLoggedIn && user) {
        const pendingTrainSelection = sessionStorage.getItem('pendingTrainSelection');
        if (pendingTrainSelection) {
          try {
            const trainData = JSON.parse(pendingTrainSelection);
            this.selectedTrain = trainData.train;
            this.trainOptions = trainData.trainOptions || this.trainOptions; // Restore train options
            this.fromCity = trainData.fromCity || this.fromCity;
            this.toCity = trainData.toCity || this.toCity;
            this.travelDate = trainData.travelDate || this.travelDate;
            this.returnDate = trainData.returnDate || this.returnDate;
            this.tripType = trainData.tripType || this.tripType;
            this.showResults = trainData.showResults !== undefined ? trainData.showResults : true;
            
            // Generate PNR numbers for all passengers
            this.generatePNRNumbers();
            
            // Save the restored state
            this.saveBookingState();
            
            // Clear the pending selection
            sessionStorage.removeItem('pendingTrainSelection');
            this.toast.success('Welcome back! You can now proceed with your booking.');
          } catch (error) {
            console.error('Error restoring train selection:', error);
            sessionStorage.removeItem('pendingTrainSelection');
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
        
        // Set the selected train directly and show passenger selection
        this.selectedTrain = option;
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
      sessionStorage.removeItem('trainBookingState');
      // Reset form values to empty
      this.fromCity = '';
      this.toCity = '';
      this.travelDate = '';
      this.returnDate = '';
      this.tripType = 'one-way';
      this.showResults = false;
      this.selectedTrain = null;
      this.trainOptions = [];
      this.passengers = [];
      this.bookingContact = { mobileNumber: '', emailId: '' };
    }
    
    // Check for search data from home page (restored after login)
    const searchData = sessionStorage.getItem('searchData');
    if (searchData) {
      try {
        const data = JSON.parse(searchData);
        if (data.transportType === 'train') {
          this.fromCity = data.from || this.fromCity;
          this.toCity = data.to || this.toCity;
          this.travelDate = data.date || this.travelDate;
          this.returnDate = data.returnDate || this.returnDate;
          this.tripType = data.tripType === 'roundtrip' ? 'round-trip' : 'one-way';
          // Clear the search data after using it
          sessionStorage.removeItem('searchData');
          // Mark that we're on a booking page
          sessionStorage.setItem('_bookingPageActive', 'true');
          // Automatically search for trains
          this.searchTrains();
          // Generate PNR number for initial passenger
          if (this.passengers.length > 0 && !this.passengers[0].seatNumber) {
            this.passengers[0].seatNumber = this.generatePNRNumber();
          }
          return;
        }
      } catch (error) {
        console.error('Error parsing search data:', error);
        sessionStorage.removeItem('searchData');
      }
    }
    
    // Only restore state if we're on a booking page (refresh scenario)
    if (isBookingPageActive) {
      const savedBookingState = sessionStorage.getItem('trainBookingState');
      if (savedBookingState) {
        try {
          const state = JSON.parse(savedBookingState);
          this.fromCity = state.fromCity || this.fromCity;
          this.toCity = state.toCity || this.toCity;
          this.travelDate = state.travelDate || this.travelDate;
          this.returnDate = state.returnDate || this.returnDate;
          this.tripType = state.tripType || this.tripType;
          this.showResults = state.showResults || false;
          this.selectedTrain = state.selectedTrain || null;
          this.trainOptions = state.trainOptions || []; // Restore train options
          this.passengers = state.passengers || this.passengers;
          this.bookingContact = state.bookingContact || this.bookingContact;
          
          // If results were shown but train options are missing, restore them
          if (this.showResults && this.trainOptions.length === 0) {
            // Re-search to restore results if we have search criteria
            if (this.fromCity && this.toCity && this.travelDate) {
              this.searchTrains();
            }
          }
        } catch (error) {
          console.error('Error restoring booking state:', error);
          sessionStorage.removeItem('trainBookingState');
        }
      }
    } else {
      // Set default date to today if no search data
      const today = new Date();
      this.travelDate = today.toISOString().split('T')[0];
    }
    
    // Generate PNR number for initial passenger
    if (this.passengers.length > 0 && !this.passengers[0].seatNumber) {
      this.passengers[0].seatNumber = this.generatePNRNumber();
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
          sessionStorage.removeItem('trainBookingState');
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
      selectedTrain: this.selectedTrain,
      trainOptions: this.trainOptions, // Save train options for restoration
      passengers: this.passengers,
      bookingContact: this.bookingContact
    };
    sessionStorage.setItem('trainBookingState', JSON.stringify(state));
  }

  searchTrains() {
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

    // Find matching routes
    const matchingRoutes = getRoutesByCities(this.fromCity, this.toCity);
    
    if (matchingRoutes.length > 0) {
      // Generate train options based on routes
      this.generateTrainOptions(matchingRoutes[0]);
    } else {
      // Generate default train options
      this.generateDefaultTrainOptions();
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

  generateTrainOptions(route: any) {
    this.trainOptions = [];
    const basePrice = Math.floor(Math.random() * 2000) + 1000; // ₹1000-3000 base price
    
    // Generate 50+ train options
    for (let i = 1; i <= 50; i++) {
      const trainType = this.getRandomTrainType();
      const operator = this.getRandomOperator();
      const departureTime = this.generateDepartureTime(i);
      const duration = route.duration || this.calculateDuration(route.distance);
      const arrivalTime = this.calculateArrivalTime(departureTime, duration);
      
      const trainOption: TrainOption = {
        id: i,
        operator: operator,
        type: trainType.name,
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5-5.0
        reviews: Math.floor(Math.random() * 5000) + 500,
        departure: departureTime,
        arrival: arrivalTime,
        duration: duration,
        amenities: getAmenitiesForTrainType(trainType.name),
        seatsLeft: Math.floor(Math.random() * 50) + 5,
        price: Math.floor(basePrice * getPriceMultiplier(trainType.name)),
        trainNumber: this.generateTrainNumber(operator),
        departureTime: this.formatTime(departureTime),
        arrivalTime: this.formatTime(arrivalTime),
        availableSeats: Math.floor(Math.random() * 50) + 5,
        classType: this.getRandomClassType(trainType.name)
      };
      
      this.trainOptions.push(trainOption);
    }
    
    // Sort by departure time
    this.trainOptions.sort((a, b) => a.departure.localeCompare(b.departure));
  }

  generateDefaultTrainOptions() {
    this.trainOptions = [];
    const basePrice = Math.floor(Math.random() * 2000) + 1000;
    
    for (let i = 1; i <= 50; i++) {
      const trainType = this.getRandomTrainType();
      const operator = this.getRandomOperator();
      const departureTime = this.generateDepartureTime(i);
      const duration = this.getRandomDuration();
      const arrivalTime = this.calculateArrivalTime(departureTime, duration);
      
      const trainOption: TrainOption = {
        id: i,
        operator: operator,
        type: trainType.name,
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
        reviews: Math.floor(Math.random() * 5000) + 500,
        departure: departureTime,
        arrival: arrivalTime,
        duration: duration,
        amenities: getAmenitiesForTrainType(trainType.name),
        seatsLeft: Math.floor(Math.random() * 50) + 5,
        price: Math.floor(basePrice * getPriceMultiplier(trainType.name)),
        trainNumber: this.generateTrainNumber(operator),
        departureTime: this.formatTime(departureTime),
        arrivalTime: this.formatTime(arrivalTime),
        availableSeats: Math.floor(Math.random() * 50) + 5,
        classType: this.getRandomClassType(trainType.name)
      };
      
      this.trainOptions.push(trainOption);
    }
    
    this.trainOptions.sort((a, b) => a.departure.localeCompare(b.departure));
  }

  getRandomTrainType() {
    return this.trainTypes[Math.floor(Math.random() * this.trainTypes.length)];
  }

  getRandomOperator() {
    return this.trainOperators[Math.floor(Math.random() * this.trainOperators.length)];
  }

  generateDepartureTime(index: number): string {
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  getRandomDuration(): string {
    const durations = ['2h 30m', '4h 15m', '6h 45m', '8h 20m', '12h 30m', '16h 45m', '20h 15m', '24h 30m'];
    return durations[Math.floor(Math.random() * durations.length)];
  }

  calculateDuration(distance: string): string {
    const dist = parseInt(distance.replace(' km', ''));
    const hours = Math.floor(dist / 60); // Average speed 60 km/h
    const minutes = Math.floor((dist % 60) / 60 * 60);
    return `${hours}h ${minutes}m`;
  }

  calculateArrivalTime(departureTime: string, duration: string): string {
    const [depHours, depMinutes] = departureTime.split(':').map(Number);
    const [durHours, durMinutes] = duration.split('h ')[0].split('m')[0].split(' ').map(Number);
    
    let arrHours = depHours + durHours;
    let arrMinutes = depMinutes + (durMinutes || 0);
    
    if (arrMinutes >= 60) {
      arrHours += 1;
      arrMinutes -= 60;
    }
    
    if (arrHours >= 24) {
      arrHours -= 24;
    }
    
    return `${arrHours.toString().padStart(2, '0')}:${arrMinutes.toString().padStart(2, '0')}`;
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  generateTrainNumber(operator: string): string {
    const prefix = operator.includes('Express') ? '12' : '18';
    const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${suffix}`;
  }

  getRandomClassType(trainType: string): string {
    const classTypes: { [key: string]: string[] } = {
      'Rajdhani Express': ['AC 1st Class', 'AC 2nd Class', 'AC 3rd Class'],
      'Shatabdi Express': ['AC Chair Car', 'Executive Class'],
      'Vande Bharat Express': ['AC Chair Car', 'Executive Class'],
      'Duronto Express': ['AC 1st Class', 'AC 2nd Class', 'AC 3rd Class', 'Sleeper'],
      'Tejas Express': ['AC Chair Car', 'Executive Class'],
      'Humsafar Express': ['AC 3rd Class'],
      'Garib Rath Express': ['AC 3rd Class'],
      'Jan Shatabdi Express': ['AC Chair Car', 'Non-AC Chair Car'],
      'Superfast Express': ['AC 1st Class', 'AC 2nd Class', 'AC 3rd Class', 'Sleeper', 'General'],
      'Mail/Express': ['AC 1st Class', 'AC 2nd Class', 'AC 3rd Class', 'Sleeper', 'General'],
      'Passenger/Local': ['General Class']
    };
    
    const types = classTypes[trainType] || ['AC 2nd Class', 'AC 3rd Class', 'Sleeper'];
    return types[Math.floor(Math.random() * types.length)];
  }

  selectTrain(train: TrainOption) {
    // Check if user is logged in
    if (!this.isLoggedIn) {
      // Store the selected train, options, and current search data for restoration after login
      const trainSelectionData = {
        train: train,
        trainOptions: this.trainOptions, // Save all train options so they can be restored
        fromCity: this.fromCity,
        toCity: this.toCity,
        travelDate: this.travelDate,
        returnDate: this.returnDate,
        tripType: this.tripType,
        showResults: true // Ensure we show results page after login
      };
      sessionStorage.setItem('pendingTrainSelection', JSON.stringify(trainSelectionData));
      
      // Show info message and redirect to login
      this.toast.info('Please login to continue with booking');
      this.router.navigate(['/login'], {
        state: {
          returnUrl: '/booking/train'
        }
      });
      return;
    }
    
    // User is logged in, proceed with train selection
    this.selectedTrain = train;
    // Keep showResults true so back button can return to options
    this.showResults = true;
    // Save state after selecting train
    this.saveBookingState();
    // Generate PNR numbers for all passengers
    this.generatePNRNumbers();
    this.saveBookingState();
  }

  generatePNRNumbers() {
    this.passengers.forEach((passenger, index) => {
      if (!passenger.seatNumber) {
        passenger.seatNumber = this.generatePNRNumber();
      }
    });
  }

  generatePNRNumber(): string {
    // Generate a 10-digit PNR number
    const pnr = Math.floor(1000000000 + Math.random() * 9000000000);
    return pnr.toString();
  }

  addPassenger() {
    this.passengers.push({ 
      fullName: '', 
      age: 0, 
      gender: '', 
      seatNumber: this.generatePNRNumber(),
      idProofType: '',
      idProofNumber: '',
      emergencyContact: '',
      berthPreference: '',
      nationality: 'Indian',
      concessionType: 'None',
      foodPreference: 'None',
      coachClass: '',
      quotaType: 'General',
      travelInsurance: false
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
    // ID proof required for all train bookings
    return true;
  }

  getTotalPrice(): number {
    if (!this.selectedTrain) return 0;
    // Standard pricing - no discounts applied
    return this.selectedTrain.price * this.passengers.length;
  }

  getTotalCoins(): number {
    // Get coins based on selected discount type and booking stats
    return this.discountCoinsService.getCurrentCoinsEarned(this.selectedDiscountType);
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

    // Check if all mandatory fields are filled
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
    // Check if all mandatory fields are filled
    for (let i = 0; i < this.passengers.length; i++) {
      const passenger = this.passengers[i];
      if (!passenger.fullName || !passenger.age || !passenger.gender || !passenger.emergencyContact) {
        this.toast.warning('Please fill all mandatory passenger details');
        // Scroll to passenger form
        setTimeout(() => {
          const passengerForm = document.querySelector(`.passenger-form:nth-child(${i + 1})`);
          if (passengerForm) {
            passengerForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return false;
      }
    }

    // Check contact details
    if (!this.bookingContact.mobileNumber || !this.bookingContact.emailId) {
      this.toast.warning('Please fill contact details');
      // Scroll to contact section
      setTimeout(() => {
        const contactSection = document.querySelector('.contact-details-section');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
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

  proceedToPayment() {
    // Validate all required fields
    const isValid = this.validatePassengerDetails();
    if (isValid) {
      // Prepare booking data for payment page
      const bookingData = {
        fromCity: this.fromCity,
        toCity: this.toCity,
        travelDate: this.travelDate,
        selectedMode: 'train',
        selectedTrain: this.selectedTrain,
        passengers: this.passengers,
        contact: this.bookingContact,
        totalPrice: this.getTotalPrice(),
        totalCoins: this.getTotalCoins(),
        isRoundTrip: this.tripType === 'round-trip',
        returnDate: this.returnDate,
        returnTime: this.tripType === 'round-trip' ? this.selectedTrain?.arrivalTime : undefined,
        returnOperator: this.tripType === 'round-trip' ? this.selectedTrain?.operator : undefined,
        returnPnrNumber: this.tripType === 'round-trip' ? this.passengers[0]?.seatNumber : undefined,
        returnBerthAllocated: this.tripType === 'round-trip' ? this.passengers.map(p => p.berthPreference) : undefined,
        returnClassCoach: this.tripType === 'round-trip' ? this.selectedTrain?.classType : undefined
      };

      console.log('Sending booking data to payment:', bookingData);
      console.log('Total price:', this.getTotalPrice());
      console.log('Selected train:', this.selectedTrain);

      // Store booking data in service
      this.bookingDataService.setBookingData(bookingData);

      // Navigate to payment page with booking data
      this.router.navigate(['/payment'], { 
        state: { bookingData: bookingData } 
      });
    }
  }

  goBack() {
    // Clear booking state and flag when navigating back
    sessionStorage.removeItem('trainBookingState');
    sessionStorage.removeItem('_bookingPageActive');
    this.router.navigate(['/booking']);
  }

  goBackToSearch() {
    // Step 3 → Step 2: Clear selected train to go back to options view
    this.selectedTrain = null;
    // Ensure showResults is true to display train options
    this.showResults = true;
    // If train options are empty, try to restore from saved state first
    if (this.trainOptions.length === 0) {
      const savedState = sessionStorage.getItem('trainBookingState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          if (state.trainOptions && state.trainOptions.length > 0) {
            this.trainOptions = state.trainOptions;
          } else if (this.fromCity && this.toCity && this.travelDate) {
            // Re-search to get train options if not in saved state
            this.searchTrains();
          }
        } catch (error) {
          console.error('Error restoring train options:', error);
          // If restore fails and we have search criteria, re-search
          if (this.fromCity && this.toCity && this.travelDate) {
            this.searchTrains();
          }
        }
      } else if (this.fromCity && this.toCity && this.travelDate) {
        // No saved state, but we have search criteria - re-search
        this.searchTrains();
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
    // Clear selected train and options to reset to search form
    this.selectedTrain = null;
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
