import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingDataService } from '../../../services/booking-data.service';
import { ToastService } from '../../../services/toast.service';
import { DiscountCoinsService, DiscountInfo } from '../../../services/discount-coins.service';
import { ValidationService } from '../../../services/validation.service';
import { FormErrorComponent } from '../../../components/form-error/form-error.component';

interface TourOption {
  id: number;
  title: string;
  operator: string;
  fromCity: string;
  toCity: string;
  duration: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  amenities: string[];
  description: string;
  departureTime: string;
  arrivalTime: string;
  seatsLeft: number;
}

interface Passenger {
  fullName: string;
  age: number;
  gender: string;
  idProofType: string;
  idProofNumber: string;
  emergencyContact: string;
}

interface BookingContact {
  mobileNumber: string;
  emailId: string;
}

@Component({
  selector: 'app-tour-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, FormErrorComponent],
  templateUrl: './tour-booking.html',
  styleUrls: ['./tour-booking.css']
})
export class TourBookingComponent implements OnInit {
  fromCity: string = '';
  toCity: string = '';
  travelDate: string = '';
  selectedTour: TourOption | null = null;
  passengers: Passenger[] = [{
    fullName: '',
    age: 0,
    gender: '',
    idProofType: '',
    idProofNumber: '',
    emergencyContact: ''
  }];
  
  bookingContact: BookingContact = {
    mobileNumber: '',
    emailId: ''
  };
  
  genderOptions = ['Male', 'Female', 'Other'];
  idProofTypes = ['Aadhaar Card', 'PAN Card', 'Driving License', 'Passport', 'Voter ID', 'Other'];
  
  // Discount and coins system
  selectedDiscountType: 'regular' | 'student' | 'senior' = 'regular';
  userCoins: number = 0;
  discountConfigs: DiscountInfo[] = [];
  userBookingStats: any = { totalBookings: 0 };
  discountCoinsService: DiscountCoinsService; // Expose for template

  @ViewChild('contactForm') contactForm!: NgForm;

  constructor(
    private router: Router,
    private bookingDataService: BookingDataService,
    discountCoinsService: DiscountCoinsService,
    private toast: ToastService,
    public validationService: ValidationService
  ) {
    this.discountCoinsService = discountCoinsService;
  }

  ngOnInit() {
    // Initialize discount system
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

    // Check if coming from packages page
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
        
        // Set the selected tour directly
        this.selectedTour = option;
        
        // Clear package flags
        sessionStorage.removeItem('fromPackage');
        sessionStorage.removeItem('selectedPackageOption');
        sessionStorage.removeItem('searchData');
        
        return;
      } catch (error) {
        console.error('Error parsing package option:', error);
      }
    }
    
    // Set default date to today
    const today = new Date();
    this.travelDate = today.toISOString().split('T')[0];
  }

  addPassenger() {
    if (this.passengers.length < 10) {
      this.passengers.push({
        fullName: '',
        age: 0,
        gender: '',
        idProofType: '',
        idProofNumber: '',
        emergencyContact: ''
      });
    }
  }

  removePassenger(index: number) {
    if (this.passengers.length > 1) {
      this.passengers.splice(index, 1);
    }
  }

  getTotalPrice(): number {
    if (!this.selectedTour) return 0;
    
    const basePrice = this.selectedTour.price * this.passengers.length;
    const config = this.discountConfigs.find(c => c.type === this.selectedDiscountType);
    
    if (!config) return basePrice;
    
    const discount = (basePrice * config.discountPercentage) / 100;
    return Math.max(0, basePrice - discount);
  }

  getTotalCoins(): number {
    if (!this.selectedTour) return 0;
    
    const config = this.discountConfigs.find(c => c.type === this.selectedDiscountType);
    if (!config) return 0;
    
    const baseCoins = config.baseCoinsEarned * this.passengers.length;
    const bonusCoins = this.userBookingStats.totalBookings < 3 ? 5 * this.passengers.length : 3 * this.passengers.length;
    
    return baseCoins + bonusCoins;
  }

  getCurrentCoinsForConfig(config: DiscountInfo): number {
    const baseCoins = config.baseCoinsEarned;
    const bonusCoins = this.userBookingStats.totalBookings < 3 ? 5 : 3;
    return baseCoins + bonusCoins;
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

    // Validate contact
    if (!this.bookingContact.mobileNumber || !this.bookingContact.emailId) {
      this.toast.warning('Please fill in contact details');
      return false;
    }

    // Validate all passengers
    for (let i = 0; i < this.passengers.length; i++) {
      const p = this.passengers[i];
      if (!p.fullName || !p.age || !p.gender || !p.idProofType || !p.idProofNumber) {
        this.toast.warning(`Please fill all required details for Passenger ${i + 1}`);
        return false;
      }
    }

    return true;
  }

  proceedToPayment() {
    const isValid = this.validatePassengerDetails();
    if (isValid) {
      const bookingData = {
        fromCity: this.fromCity,
        toCity: this.toCity,
        travelDate: this.travelDate,
        selectedMode: 'tour',
        selectedTour: this.selectedTour,
        passengers: this.passengers,
        contact: this.bookingContact,
        totalPrice: this.getTotalPrice(),
        totalCoins: this.getTotalCoins(),
        discountType: this.selectedDiscountType
      };

      console.log('Sending tour booking data to payment:', bookingData);

      // Store booking data in service
      this.bookingDataService.setBookingData(bookingData);

      // Navigate to payment page
      this.router.navigate(['/payment'], { 
        state: { bookingData: bookingData } 
      });
    }
  }

  goBack() {
    this.router.navigate(['/booking']);
  }
}

