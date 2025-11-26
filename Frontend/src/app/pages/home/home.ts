import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { BUS_ROUTES } from '../../data/indian-districts';
import { TRAIN_ROUTES } from '../../data/train-data';
import { FLIGHT_ROUTES, getAllAirportCities } from '../../data/plane-data';
import { DiscountCoinsService, DiscountInfo } from '../../services/discount-coins.service';
import { ToastService } from '../../services/toast.service';
import { BookingStateService } from '../../services/booking-state.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  transportType = 'bus';
  tripType = 'oneway'; // 'oneway' or 'roundtrip'
  private previousTransportType = 'bus';
  
  // Form group for validation
  searchForm!: FormGroup;
  
  // Form data preservation per transport type
  private preservedFormDataByType: {
    [key: string]: {
      from?: string;
      to?: string;
      date?: string;
      returnDate?: string;
      tripType?: string;
    };
  } = {};
  
  // Validation error messages
  validationErrors: {
    from?: string;
    to?: string;
    date?: string;
    returnDate?: string;
  } = {};
  
  // Import data - same as bus-booking component
  busRoutes = BUS_ROUTES;
  trainRoutes = TRAIN_ROUTES;
  flightRoutes = FLIGHT_ROUTES;

  // Discount and coins system
  selectedDiscountType: 'regular' | 'student' | 'senior' = 'regular';
  userCoins: number = 531;
  discountConfigs: DiscountInfo[] = [];
  userBookingStats: any = { totalBookings: 0 };

  constructor(
    private router: Router,
    private discountCoinsService: DiscountCoinsService,
    private toast: ToastService,
    private fb: FormBuilder,
    private bookingStateService: BookingStateService
  ) {
    // Initialize form with validators
    this.searchForm = this.fb.group({
      from: ['', [Validators.required, this.cityValidator.bind(this)]],
      to: ['', [Validators.required, this.cityValidator.bind(this)]],
      date: ['', [Validators.required, this.dateValidator.bind(this)]],
      returnDate: ['', []],
      tripType: ['oneway', Validators.required]
    }, {
      validators: [this.sameCityValidator, this.returnDateValidator]
    });
  }

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

    // Set default date to today if not set
    const todayDate = this.getTodayDate();
    if (!this.searchForm.get('date')?.value) {
      this.searchForm.patchValue({ date: todayDate });
    }
    
    // Watch for form changes to update validation errors
    this.searchForm.valueChanges.subscribe(() => {
      this.updateValidationErrors();
    });
    
    // Watch for trip type changes
    this.searchForm.get('tripType')?.valueChanges.subscribe(value => {
      this.tripType = value;
      if (value === 'oneway') {
        this.searchForm.patchValue({ returnDate: '' });
      } else {
        // Add required validator for return date when round trip
        this.searchForm.get('returnDate')?.setValidators([Validators.required, this.returnDateAfterDepartureValidator.bind(this)]);
        this.searchForm.get('returnDate')?.updateValueAndValidity();
      }
    });
  }
  
  // Custom validators
  cityValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    const availableCities = this.availableCities;
    if (availableCities.length > 0 && !availableCities.includes(value)) {
      return { invalidCity: true };
    }
    return null;
  }
  
  dateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }
  
  returnDateAfterDepartureValidator(control: AbstractControl): ValidationErrors | null {
    const returnDate = control.value;
    const departureDate = this.searchForm?.get('date')?.value;
    
    if (!returnDate || !departureDate) return null;
    
    const returnDateObj = new Date(returnDate);
    const departureDateObj = new Date(departureDate);
    
    if (returnDateObj < departureDateObj) {
      return { returnBeforeDeparture: true };
    }
    return null;
  }
  
  sameCityValidator(control: AbstractControl): ValidationErrors | null {
    const from = control.get('from')?.value;
    const to = control.get('to')?.value;
    
    if (from && to && from === to) {
      return { sameCity: true };
    }
    return null;
  }
  
  returnDateValidator(control: AbstractControl): ValidationErrors | null {
    const tripType = control.get('tripType')?.value;
    const returnDate = control.get('returnDate')?.value;
    
    if (tripType === 'roundtrip' && !returnDate) {
      control.get('returnDate')?.setErrors({ required: true });
      return { returnDateRequired: true };
    }
    return null;
  }
  
  // Getter methods for form controls
  get from() {
    return this.searchForm.get('from')?.value || '';
  }
  
  get to() {
    return this.searchForm.get('to')?.value || '';
  }
  
  get date() {
    return this.searchForm.get('date')?.value || '';
  }
  
  get returnDate() {
    return this.searchForm.get('returnDate')?.value || '';
  }
  
  // Update validation errors object
  updateValidationErrors() {
    const form = this.searchForm;
    this.validationErrors = {};
    
    // From field errors
    const fromControl = form.get('from');
    if (fromControl?.errors && fromControl.touched) {
      if (fromControl.errors['required']) {
        this.validationErrors.from = 'Please select a departure city';
      } else if (fromControl.errors['invalidCity']) {
        this.validationErrors.from = `This location is not available for ${this.getTransportTypeName()}. Please choose another city.`;
      }
    }
    
    // To field errors
    const toControl = form.get('to');
    if (toControl?.errors && toControl.touched) {
      if (toControl.errors['required']) {
        this.validationErrors.to = 'Please select a destination city';
      } else if (toControl.errors['invalidCity']) {
        this.validationErrors.to = `This location is not available for ${this.getTransportTypeName()}. Please choose another city.`;
      }
    }
    
    // Date field errors
    const dateControl = form.get('date');
    if (dateControl?.errors && dateControl.touched) {
      if (dateControl.errors['required']) {
        this.validationErrors.date = 'Please select a departure date';
      } else if (dateControl.errors['pastDate']) {
        this.validationErrors.date = 'Departure date cannot be in the past';
      }
    }
    
    // Return date errors
    const returnDateControl = form.get('returnDate');
    if (returnDateControl?.errors && returnDateControl.touched) {
      if (returnDateControl.errors['required']) {
        this.validationErrors.returnDate = 'Return date is required for round trip';
      } else if (returnDateControl.errors['returnBeforeDeparture']) {
        this.validationErrors.returnDate = 'Return date must be after departure date';
      }
    }
    
    // Form-level errors
    if (form.errors) {
      if (form.errors['sameCity']) {
        this.validationErrors.to = 'From and To cities cannot be the same';
      }
    }
  }
  
  getTransportTypeName(): string {
    switch (this.transportType) {
      case 'bus': return 'Bus';
      case 'train': return 'Train';
      case 'flight': return 'Flight';
      default: return 'this mode';
    }
  }

  // Get today's date in YYYY-MM-DD format
  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Get minimum date for return date (should be same as or after departure date)
  getMinReturnDate(): string {
    return this.date || this.getTodayDate();
  }

  onSearch() {
    // Mark all fields as touched to show validation errors
    Object.keys(this.searchForm.controls).forEach(key => {
      this.searchForm.get(key)?.markAsTouched();
    });
    
    // Check if from and to cities are the same
    const fromValue = this.searchForm.get('from')?.value;
    const toValue = this.searchForm.get('to')?.value;
    
    if (fromValue && toValue && fromValue === toValue) {
      this.toast.warning('From and To cities cannot be the same. Please select different cities.');
      this.searchForm.get('to')?.setErrors({ sameCity: true });
      this.updateValidationErrors();
      return;
    }
    
    // Update validation errors
    this.updateValidationErrors();
    
    // Check if form is valid
    if (this.searchForm.invalid) {
      // Show appropriate error messages
      if (this.searchForm.errors?.['sameCity']) {
        this.toast.warning('From and To cities cannot be the same');
      } else {
        this.toast.warning('Please fill in all required fields correctly');
      }
      return;
    }

    // Prepare search data to pass to booking page
    // Clear booking flag when navigating from home to booking
    sessionStorage.removeItem('_bookingPageActive');
    
    // Store search data in sessionStorage for the target component to use
    const searchData = {
      transportType: this.transportType,
      from: this.from,
      to: this.to,
      date: this.date,
      returnDate: this.returnDate || '',
      tripType: this.tripType
    };
    sessionStorage.setItem('searchData', JSON.stringify(searchData));

    // Navigate to the specific transport page
    switch (this.transportType) {
      case 'bus':
        this.router.navigate(['/booking/bus']);
        break;
      case 'train':
        this.router.navigate(['/booking/train']);
        break;
      case 'flight':
        this.router.navigate(['/booking/plane']);
        break;
      default:
        this.router.navigate(['/search-results']);
    }
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

  // Get unique cities - EXACT same logic as each booking component
  get availableCities(): string[] {
    switch (this.transportType) {
      case 'bus':
        // EXACT same logic as bus-booking component
        const busCities = new Set<string>();
        this.busRoutes.forEach(route => {
          busCities.add(route.from);
          busCities.add(route.to);
        });
        return Array.from(busCities).sort();
        
      case 'train':
        // EXACT same logic as train-booking component
        const trainCities = new Set<string>();
        this.trainRoutes.forEach(route => {
          trainCities.add(route.from);
          trainCities.add(route.to);
        });
        return Array.from(trainCities).sort();
        
      case 'flight':
        // EXACT same logic as plane-booking component
        return getAllAirportCities();
        
      default:
        return [];
    }
  }

  getUniqueCities(): string[] {
    // Use the same logic as bus-booking component
    return this.availableCities;
  }

  getDestinationCities(): string[] {
    // Use the same logic as bus-booking component - show all available cities
    return this.availableCities;
  }

  getFromPlaceholder(): string {
    switch (this.transportType) {
      case 'train':
        return 'From Station';
      case 'flight':
        return 'Leaving from';
      default:
        return 'From City';
    }
  }

  getToPlaceholder(): string {
    switch (this.transportType) {
      case 'train':
        return 'To Station';
      case 'flight':
        return 'Going to';
      default:
        return 'To City';
    }
  }

  onFromCityChange() {
    const fromValue = this.searchForm.get('from')?.value;
    
    // Check if the selected city is valid for current transport type
    if (fromValue && !this.availableCities.includes(fromValue)) {
      // City is not available for this transport type
      this.searchForm.get('from')?.setErrors({ invalidCity: true });
      this.updateValidationErrors();
    } else {
      // Reset "To" city when "From" city changes (only if it was the same)
      const toValue = this.searchForm.get('to')?.value;
      if (toValue === fromValue) {
        this.searchForm.patchValue({ to: '' });
        this.toast.warning('From and To cities cannot be the same');
      }
      // Re-validate
      this.searchForm.get('from')?.updateValueAndValidity();
      this.searchForm.get('to')?.updateValueAndValidity();
      this.updateValidationErrors();
    }
  }
  
  onToCityChange() {
    const toValue = this.searchForm.get('to')?.value;
    const fromValue = this.searchForm.get('from')?.value;
    
    // Check if to city is same as from city
    if (toValue && toValue === fromValue) {
      this.searchForm.patchValue({ to: '' });
      this.toast.warning('From and To cities cannot be the same');
      this.updateValidationErrors();
      return;
    }
    
    // Check if the selected city is valid for current transport type
    if (toValue && !this.availableCities.includes(toValue)) {
      // City is not available for this transport type
      this.searchForm.get('to')?.setErrors({ invalidCity: true });
      this.updateValidationErrors();
    } else {
      // Re-validate
      this.searchForm.get('to')?.updateValueAndValidity();
      this.searchForm.updateValueAndValidity();
      this.updateValidationErrors();
    }
  }

  onTripTypeChange() {
    const newTripType = this.searchForm.get('tripType')?.value;
    this.tripType = newTripType;
    
    // Clear return date when switching to one way
    if (newTripType === 'oneway') {
      this.searchForm.patchValue({ returnDate: '' });
      this.searchForm.get('returnDate')?.clearValidators();
      this.searchForm.get('returnDate')?.updateValueAndValidity();
    } else {
      // Add required validator for return date when round trip
      this.searchForm.get('returnDate')?.setValidators([
        Validators.required,
        this.returnDateAfterDepartureValidator.bind(this)
      ]);
      this.searchForm.get('returnDate')?.updateValueAndValidity();
    }
  }

  onTransportTypeChange(newTransportType: 'bus' | 'train' | 'flight') {
    // Don't do anything if switching to the same transport type
    if (newTransportType === this.transportType) {
      return;
    }
    
    // Clear booking state when switching transport types
    this.bookingStateService.clearState();
    
    // Save current form data for the CURRENT transport type before switching
    const oldTransportType = this.transportType;
    this.preservedFormDataByType[oldTransportType] = {
      from: this.from,
      to: this.to,
      date: this.date,
      returnDate: this.returnDate,
      tripType: this.tripType
    };
    
    // Update transport type
    this.previousTransportType = this.transportType;
    this.transportType = newTransportType;
    
    // Get available cities for NEW transport type
    const newAvailableCities = this.availableCities;
    
    // Try to restore form data for the NEW transport type
    const preservedData = this.preservedFormDataByType[this.transportType] || {};
    
    // Check if preserved cities are available in the new transport type
    let newFrom = '';
    let newTo = '';
    
    if (preservedData.from) {
      if (newAvailableCities.includes(preservedData.from)) {
        // City is available in new transport type, restore it
        newFrom = preservedData.from;
      } else {
        // City is not available, clear it but keep it in preserved data for when we switch back
        this.searchForm.get('from')?.setErrors({ invalidCity: true });
      }
    }
    
    if (preservedData.to) {
      if (newAvailableCities.includes(preservedData.to)) {
        // City is available in new transport type, restore it
        newTo = preservedData.to;
      } else {
        // City is not available, clear it but keep it in preserved data for when we switch back
        this.searchForm.get('to')?.setErrors({ invalidCity: true });
      }
    }
    
    // Update form with preserved valid data or current data
    this.searchForm.patchValue({
      from: newFrom,
      to: newTo,
      date: preservedData.date || this.date || this.getTodayDate(),
      returnDate: preservedData.returnDate || this.returnDate || '',
      tripType: preservedData.tripType || this.tripType || 'oneway'
    });
    
    // Clear errors if cities are valid
    if (newFrom) {
      this.searchForm.get('from')?.setErrors(null);
      this.searchForm.get('from')?.updateValueAndValidity();
    }
    if (newTo) {
      this.searchForm.get('to')?.setErrors(null);
      this.searchForm.get('to')?.updateValueAndValidity();
    }
    
    // Re-validate all fields
    this.updateValidationErrors();
  }

  swapCities() {
    // Swap from and to cities
    const currentFrom = this.searchForm.get('from')?.value;
    const currentTo = this.searchForm.get('to')?.value;
    
    // Don't swap if both are empty or same
    if (!currentFrom || !currentTo || currentFrom === currentTo) {
      return;
    }
    
    this.searchForm.patchValue({
      from: currentTo,
      to: currentFrom
    });
    
    // Re-validate after swap
    this.searchForm.get('from')?.updateValueAndValidity();
    this.searchForm.get('to')?.updateValueAndValidity();
    this.updateValidationErrors();
  }

  getCityCode(city: string): string {
    if (!city) return '';
    
    // Simple city code mapping
    const cityCodes: { [key: string]: string } = {
      'Delhi': 'DEL',
      'Mumbai': 'BOM',
      'Bangalore': 'BLR',
      'Chennai': 'MAA',
      'Kolkata': 'CCU',
      'Hyderabad': 'HYD',
      'Pune': 'PNQ',
      'Ahmedabad': 'AMD',
      'Jaipur': 'JAI',
      'Kochi': 'COK'
    };
    
    return cityCodes[city] || city.substring(0, 3).toUpperCase();
  }

  getFormattedDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().substring(2);
    
    return `${day} ${month}'${year}`;
  }

  getDayName(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  searchDestination(city: string) {
    // Clear booking state and flag when starting new search
    this.bookingStateService.clearState();
    sessionStorage.removeItem('_bookingPageActive');
    
    this.searchForm.patchValue({
      from: '',
      to: city
    });
    this.transportType = 'bus';
    // Scroll to search form
    const searchCard = document.querySelector('.search-card');
    if (searchCard) {
      searchCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
