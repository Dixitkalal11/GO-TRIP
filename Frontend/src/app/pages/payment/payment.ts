import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { BookingDataService } from '../../services/booking-data.service';
import { DiscountCoinsService } from '../../services/discount-coins.service';
import { ToastService } from '../../services/toast.service';
import { BookingStateService } from '../../services/booking-state.service';
import { ValidationService } from '../../services/validation.service';
import { FormErrorComponent } from '../../components/form-error/form-error.component';

interface BookingData {
  fromCity: string;
  toCity: string;
  travelDate: string;
  selectedMode: string;
  selectedBus: any;
  selectedTrain: any;
  selectedPlane: any;
  selectedTour: any;
  passengers: any[];
  contact: any;
  selectedSeats: string[];
  totalPrice: number;
  totalCoins: number;
  isRoundTrip?: boolean;
  returnDate?: string;
  returnTime?: string;
  returnOperator?: string;
  returnSeatNumbers?: string[];
  returnPnrNumber?: string;
  returnBerthAllocated?: string[];
  returnClassCoach?: string;
  discountType?: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, FormErrorComponent],
  templateUrl: './payment.html',
  styleUrls: ['./payment.css']
})
export class PaymentComponent implements OnInit {
  bookingData: BookingData | null = null;
  userCoins: number = 0;
  paymentMethod: 'card' | 'wallet' = 'card';
  selectedWallet: 'paytm' | 'phonepe' | 'gpay' | null = null;
  isProcessing: boolean = false;
  isSuccess: boolean = false;
  isFailed: boolean = false;
  cardTouched: boolean = false;
  card = {
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  };

  // Coin usage properties
  useCoins: boolean = false;
  coinsToUse: number = 0;
  maxCoinsToUse: number = 0;
  coinValue: number = 0.5; // 1 coin = ₹0.5
  maxCoinsPerTrip: number = 5; // Will be updated dynamically based on booking history
  userBookingCount: number = 0;
  // Stepper size for coins control
  stepSize: number = 1;

  // Expose Math object for template usage
  Math = Math;

  @ViewChild('cardForm') cardForm!: NgForm;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private bookingDataService: BookingDataService,
    private discountCoinsService: DiscountCoinsService,
    private toast: ToastService,
    private bookingStateService: BookingStateService,
    public validationService: ValidationService
  ) {}

  ngOnInit() {
    this.loadUserCoins();
    // Get booking data from router state
    const navigation = this.router.getCurrentNavigation();
    console.log('Navigation object:', navigation);
    console.log('Navigation extras:', navigation?.extras);
    console.log('Navigation state:', navigation?.extras?.state);

    if (navigation?.extras?.state?.['bookingData']) {
      this.bookingData = navigation.extras.state['bookingData'];
      console.log('Received booking data from router state:', this.bookingData);
      // Recalculate coins once booking data is present
      this.calculateMaxCoinsToUse();
    } else {
      console.log('No booking data found in navigation state');
      // Fallback 1: try to get from service
      const serviceData = this.bookingDataService.getBookingData();
      if (serviceData) {
        this.bookingData = serviceData;
        console.log('Received booking data from service:', this.bookingData);
        this.calculateMaxCoinsToUse();
      } else {
        // Fallback 2: try to get from query params
        this.route.queryParams.subscribe(params => {
          console.log('Query params:', params);
          if (params['bookingData']) {
            this.bookingData = JSON.parse(params['bookingData']);
            console.log('Received booking data from query params:', this.bookingData);
            this.calculateMaxCoinsToUse();
          }
        });
      }
    }
  }

  loadUserCoins() {
    // Load user coins from database
    const token = localStorage.getItem('token');
    if (!token) {
      // No token - user not logged in
      this.userCoins = 0;
      this.maxCoinsPerTrip = 5; // Default for new users
      this.calculateMaxCoinsToUse();
      return;
    }

    // Load user coins
    this.http.get<any>('http://localhost:5000/api/auth/coins', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.userCoins = response.coins || 0;
        console.log('Loaded user coins from backend:', this.userCoins);
        // Recalculate now that we have the actual coin balance
        this.calculateMaxCoinsToUse();
      },
      error: (error) => {
        console.error('Error loading user coins:', error);
        this.userCoins = 0;
        // Ensure UI updates even if coin fetch fails
        this.calculateMaxCoinsToUse();
      }
    });

    // Load user's max coins allowed based on booking history
    this.http.get<any>('http://localhost:5000/api/bookings/max-coins', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.userBookingCount = response.bookingCount || 0;
        this.maxCoinsPerTrip = response.maxCoinsAllowed || 5;
        this.calculateMaxCoinsToUse();
        console.log('User booking count:', this.userBookingCount);
        console.log('Max coins allowed:', this.maxCoinsPerTrip);
      },
      error: (error) => {
        console.error('Error loading max coins:', error);
        this.maxCoinsPerTrip = 5; // Default fallback
        this.calculateMaxCoinsToUse();
      }
    });
  }

  calculateMaxCoinsToUse() {
    const totalPrice = this.getTotalPrice();
    const maxCoinsByPrice = Math.floor(totalPrice / this.coinValue);
    const maxCoinsByUserBalance = this.userCoins;

    // Maximum coins to use = min(user balance, max per trip, max by price)
    this.maxCoinsToUse = Math.min(
      maxCoinsByUserBalance,
      this.maxCoinsPerTrip,
      maxCoinsByPrice
    );

    // Derive a reasonable step size (about 10 steps from 0 to max)
    this.stepSize = Math.max(1, Math.round(this.maxCoinsToUse / 10));

    console.log('Coin calculation:', {
      userCoins: this.userCoins,
      totalPrice: totalPrice,
      maxCoinsByPrice: maxCoinsByPrice,
      maxCoinsPerTrip: this.maxCoinsPerTrip,
      maxCoinsToUse: this.maxCoinsToUse
    });
  }

  getTotalPrice(): number {
    return this.bookingData?.totalPrice || 0;
  }

  getFinalAmount(): number {
    const totalPrice = this.getTotalPrice();
    const coinDiscount = this.useCoins ? (this.coinsToUse * this.coinValue) : 0;
    return Math.max(0, totalPrice - coinDiscount);
  }

  getCoinDiscount(): number {
    return this.useCoins ? (this.coinsToUse * this.coinValue) : 0;
  }

  toggleCoinUsage() {
    this.useCoins = !this.useCoins;
    if (this.useCoins) {
      this.coinsToUse = this.maxCoinsToUse;
    } else {
      this.coinsToUse = 0;
    }
  }

  updateCoinsToUse() {
    if (this.coinsToUse > this.maxCoinsToUse) {
      this.coinsToUse = this.maxCoinsToUse;
    }
    if (this.coinsToUse < 0) {
      this.coinsToUse = 0;
    }
  }

  // New controls for coins without slider/input
  adjustCoins(delta: number) {
    this.coinsToUse = Math.min(this.maxCoinsToUse, Math.max(0, this.coinsToUse + delta));
  }

  setCoinsPercent(percent: number) {
    const value = Math.round((this.maxCoinsToUse * percent) / 100);
    this.coinsToUse = value;
    this.updateCoinsToUse();
  }

  isPercentSelected(percent: number): boolean {
    if (this.maxCoinsToUse === 0) { return percent === 0 && this.coinsToUse === 0; }
    const currentPercent = Math.round((this.coinsToUse / this.maxCoinsToUse) * 100);
    if (percent === 0) return this.coinsToUse === 0;
    if (percent === 100) return this.coinsToUse === this.maxCoinsToUse;
    return currentPercent === percent;
  }

  useAllCoins() {
    this.coinsToUse = this.maxCoinsToUse;
  }

  useNoCoins() {
    this.coinsToUse = 0;
  }

  getTotalCoins(): number {
    return this.bookingData?.totalCoins || 0;
  }

  // Random payment success/failure using odd/even method
  payNow() {
    if (!this.bookingData) { this.toast.error('No booking data found'); return; }

    this.isProcessing = true;
    this.isSuccess = false;
    this.isFailed = false;

    // Generate random number and use odd/even for success/failure
    // Use Date.now() to ensure better randomness
    const randomNumber = Math.floor(Math.random() * 100) + 1; // 1-100 (simpler range)
    const isEven = randomNumber % 2 === 0;

    console.log(`🎲 Random number: ${randomNumber}, ${isEven ? 'Even' : 'Odd'} - ${isEven ? 'SUCCESS' : 'FAILURE'}`);
    console.log(`🎲 Timestamp: ${Date.now()}, Math.random(): ${Math.random()}`);

    // Simulate payment processing time
    setTimeout(() => {
      this.isProcessing = false;

      if (isEven) {
        this.isSuccess = true;
        this.isFailed = false;

        // Calculate coin changes
        const coinsToAward = Math.floor(this.getTotalPrice() * 0.02);
        const coinsUsed = this.useCoins ? this.coinsToUse : 0;
        const netCoinChange = coinsToAward - coinsUsed;

        console.log(`🎉 Payment successful! Awarding ${coinsToAward} coins, using ${coinsUsed} coins, net change: ${netCoinChange}`);
        this.toast.success('Payment successful! Your booking is confirmed.');

        // Create booking in database and update coins
        this.createBookingAndUpdateCoins(coinsToAward, coinsUsed);

        // Clear booking state after successful payment
        this.bookingStateService.clearState();
        
        // Redirect to my bookings after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/my-bookings']);
        }, 3000);
      } else {
        this.isSuccess = false;
        this.isFailed = true;
        console.log('❌ Payment failed!');
        this.toast.error('Payment failed. Please try again.');
      }
    }, 2000); // 2 second processing time
  }

  // UI helpers and validation
  selectMethod(method: 'card' | 'wallet') {
    this.paymentMethod = method;
  }

  selectWallet(wallet: 'paytm' | 'phonepe' | 'gpay') {
    this.selectedWallet = wallet;
  }

  handlePay() {
    if (this.paymentMethod === 'card') {
      this.cardTouched = true;
      if (!this.validCardForm()) { return; }
      this.payNow();
    } else {
      // Wallet: show QR and wait for user confirmation
      if (!this.selectedWallet) { return; }
    }
  }

  confirmWalletPayment() {
    // Call after user pays via QR
    if (this.selectedWallet) {
      this.payNow();
    }
  }

  isPayDisabled(): boolean {
    if (this.paymentMethod === 'card') {
      return !this.validCardForm();
    }
    // For wallet, pay is handled via QR confirmation button
    return true;
  }

  formatCardNumber() {
    // keep digits only and format as xxxx xxxx xxxx xxxx
    const digits = this.card.number.replace(/\D/g, '').slice(0, 16);
    this.card.number = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  formatExpiry() {
    const digits = this.card.expiry.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) {
      this.card.expiry = digits;
    } else {
      this.card.expiry = digits.slice(0, 2) + '/' + digits.slice(2);
    }
  }

  validCardNumber(): boolean {
    const digits = this.card.number.replace(/\s/g, '');
    return /^\d{16}$/.test(digits);
  }

  validExpiry(): boolean {
    if (!/^\d{2}\/\d{2}$/.test(this.card.expiry)) return false;
    const [mm, yy] = this.card.expiry.split('/').map(v => parseInt(v, 10));
    if (mm < 1 || mm > 12) return false;
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (yy < currentYear) return false;
    if (yy === currentYear && mm < currentMonth) return false;
    return true;
  }

  validCvv(): boolean {
    return /^\d{3,4}$/.test(this.card.cvv);
  }

  validName(): boolean {
    return /^[A-Za-z][A-Za-z ]{2,}$/.test(this.card.name.trim());
  }

  validCardForm(): boolean {
    return this.validCardNumber() && this.validExpiry() && this.validCvv() && this.validName();
  }

  // Image helpers
  getWalletLogo(wallet: 'paytm' | 'phonepe' | 'gpay'): string {
    const map: Record<string, string> = {
      paytm: 'assets/images/paytm.png',
      phonepe: 'assets/images/phonpe.png',
      gpay: 'assets/images/googlepay.png'
    };
    return map[wallet];
  }

  getWalletQr(wallet: 'paytm' | 'phonepe' | 'gpay'): string {
    // Use local QR code image file
    // The amount is displayed above the QR code in the UI
    return 'assets/images/gpay_qr.jpeg';
  }

  onImgError(event: Event, isQr: boolean = false) {
    const target = event.target as HTMLImageElement;
    if (isQr) {
      const svg = encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260">\n' +
        '<rect width="100%" height="100%" fill="#f8fafc"/>\n' +
        '<rect x="10" y="10" width="240" height="240" fill="none" stroke="#cbd5e1" stroke-width="4" stroke-dasharray="6 6"/>\n' +
        '<text x="50%" y="50%" text-anchor="middle" fill="#94a3b8" font-family="Arial" font-size="16">QR not found</text>\n' +
        '</svg>'
      );
      target.src = `data:image/svg+xml;utf8,${svg}`;
    } else {
      target.src = 'assets/images/paytm.png';
    }
  }

  createBookingAndUpdateCoins(coinsToAward: number, coinsUsed: number) {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for booking creation');
      return;
    }

    // Get current discount type from service
    let currentDiscountType = 'regular';
    this.discountCoinsService.getSelectedDiscountType().subscribe(type => {
      currentDiscountType = type;
    }).unsubscribe();

    // Prepare booking data for backend
    const paymentMethodDisplay = this.paymentMethod === 'card' ? 'Credit/Debit Card' : (this.selectedWallet ? this.selectedWallet.toUpperCase() : 'Wallet');
    const paymentId = this.generatePaymentId();
    const bookingData = {
      // Add payment info directly to booking data
      paid_via: paymentMethodDisplay,
      payment_id: paymentId,
      fromCity: this.bookingData?.fromCity,
      toCity: this.bookingData?.toCity,
      travelDate: this.bookingData?.travelDate,
      selectedMode: this.bookingData?.selectedMode,
      selectedOption: {
        operator: this.bookingData?.selectedBus?.operator ||
                  this.bookingData?.selectedTrain?.operator ||
                  this.bookingData?.selectedPlane?.operator ||
                  this.bookingData?.selectedTour?.operator ||
                  'Unknown Operator'
      },
      selectedBus: this.bookingData?.selectedBus,
      selectedTrain: this.bookingData?.selectedTrain,
      selectedPlane: this.bookingData?.selectedPlane,
      selectedTour: this.bookingData?.selectedTour,
      totalPrice: this.getTotalPrice(),
      passengers: this.bookingData?.passengers || [],
      selectedSeats: this.bookingData?.selectedSeats || [],
      contact: this.bookingData?.contact || {},
      discountType: currentDiscountType,
      isRoundTrip: this.bookingData?.isRoundTrip || false,
      returnDate: this.bookingData?.returnDate,
      returnTime: this.bookingData?.returnTime,
      returnOperator: this.bookingData?.returnOperator,
      returnSeatNumbers: this.bookingData?.returnSeatNumbers,
      returnPnrNumber: this.bookingData?.returnPnrNumber,
      returnBerthAllocated: this.bookingData?.returnBerthAllocated,
      returnClassCoach: this.bookingData?.returnClassCoach,
      paymentMethod: paymentMethodDisplay,
      paymentId: paymentId
    };

    console.log('📋 Creating booking with data:', bookingData);

    // Call the backend to create booking and update coins in one transaction
    this.http.post('http://localhost:5000/api/bookings/test-booking', {
      bookingData: bookingData,
      coinsUsed: coinsUsed
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        console.log('✅ Booking created successfully:', response);
        // Optionally store last payment info for local reference
        localStorage.setItem('lastPaymentId', paymentId);
        localStorage.setItem('lastPaymentMethod', paymentMethodDisplay);
        // Create a payment record in backend (separate payments table)
        try {
          const createdBookingId = response?.booking?.id || response?.bookingId || response?.id;
          if (createdBookingId) {
            this.createPaymentRecord({
              bookingId: createdBookingId,
              method: paymentMethodDisplay,
              paymentId: paymentId,
              amount: this.getFinalAmount(),
              status: 'success',
              meta: {
                coinsUsed: this.useCoins ? this.coinsToUse : 0,
                discount: this.getCoinDiscount(),
                selectedWallet: this.selectedWallet || null
              }
            });
          } else {
            console.warn('⚠️ Could not resolve booking id from booking creation response to create payment record.');
          }
        } catch (e) {
          console.warn('⚠️ Skipped creating payment record due to error:', e);
        }
        // Update the user's coin balance in AuthService
        this.authService.updateUserCoins(response.newCoinBalance);
        // Refresh user data from backend to ensure navbar gets latest info
        this.authService.refreshUserData();
        // Reload user coins in this component
        this.loadUserCoins();

        // Show the payment ID to the user
        this.toast.success(`Payment successful. ID: ${paymentId}`);

        // Verify the booking persisted with payment fields (with small retries)
        this.verifyPaymentPersistence(paymentId, paymentMethodDisplay, this.getFinalAmount(), 3);
      },
      error: (error) => {
        console.error('❌ Error creating booking:', error);
        console.error('❌ Error details:', error.error);
        console.error('❌ Error status:', error.status);
        // Fallback to old method if new endpoint fails
        this.updateCoinsAfterPayment(coinsToAward, coinsUsed);
      }
    });
  }

  private generatePaymentId(): string {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ts = Date.now().toString(36).toUpperCase();
    return `GT-PAY-${ts}-${rand}`;
  }

  private verifyPaymentPersistence(paymentId: string, method: string, amount: number, retries: number = 1) {
    const token = localStorage.getItem('token');
    if (!token) { return; }
    // If we already know payments API is unavailable, skip verification silently
    if (localStorage.getItem('skipPaymentsApi') === 'true') {
      return;
    }
    this.http.get<any>('http://localhost:5000/api/bookings', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        const bookings = response.bookings || [];
        const found = bookings.find((b: any) => b.paymentId === paymentId || b.payment_id === paymentId);
        if (found) {
          console.log('🔎 Verified booking persistence with payment fields:', {
            paymentMethod: found.paymentMethod || found.payment_method,
            paymentId: found.paymentId || found.payment_id,
            price: found.price
          });
        } else {
          // Try verifying in payments table as fallback
          this.http.get<any>(`http://localhost:5000/api/payments?paymentId=${encodeURIComponent(paymentId)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).subscribe({
            next: (payResp) => {
              const payments = payResp?.payments || payResp || [];
              const p = Array.isArray(payments)
                ? payments.find((x: any) => x.paymentId === paymentId || x.payment_id === paymentId)
                : (payments.paymentId === paymentId || payments.payment_id === paymentId ? payments : null);
              if (p) {
                console.log('🔎 Verified payment in payments table:', p);
              } else if (retries > 1) {
                setTimeout(() => this.verifyPaymentPersistence(paymentId, method, amount, retries - 1), 1200);
              } else {
                console.warn('⚠️ Could not verify payment fields. Ensure backend stores and returns payment rows.');
                this.toast.warning('Payment saved; syncing with server. If not visible in a moment, refresh My Bookings.');
              }
            },
            error: (err) => {
              if (err?.status === 404) {
                // Cache skip flag so future payments do not attempt this
                localStorage.setItem('skipPaymentsApi', 'true');
                return;
              }
              if (retries > 1) {
                setTimeout(() => this.verifyPaymentPersistence(paymentId, method, amount, retries - 1), 1200);
              } else {
                console.warn('⚠️ Could not verify payment fields. Ensure backend stores and returns payment rows.');
                this.toast.warning('Payment saved; syncing with server. If not visible in a moment, refresh My Bookings.');
              }
            }
          });
        }
      },
      error: (err) => {
        console.warn('⚠️ Skipping verification due to fetch error:', err?.message || err);
      }
    });
  }

  private createPaymentRecord(payload: { bookingId: number; method: string; paymentId: string; amount: number; status: 'success' | 'failed' | 'pending'; meta?: any; }) {
    const token = localStorage.getItem('token');
    if (!token) { return; }
    // If payments API is not available, skip silently
    if (localStorage.getItem('skipPaymentsApi') === 'true') {
      return;
    }
    const body = {
      bookingId: payload.bookingId,
      method: payload.method,
      paymentId: payload.paymentId,
      amount: payload.amount,
      status: payload.status,
      meta: payload.meta || {}
    };
    this.http.post('http://localhost:5000/api/payments', body, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (resp) => {
        console.log('🧾 Payment record created:', resp);
      },
      error: (err) => {
        if (err?.status === 404) {
          // Cache skip to avoid future calls while backend endpoint is absent
          localStorage.setItem('skipPaymentsApi', 'true');
          return;
        }
        console.warn('⚠️ Failed to create payment record:', err?.message || err);
      }
    });
  }

  updateCoinsAfterPayment(coinsToAward: number, coinsUsed: number) {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for coin update');
      return;
    }

    // First, subtract used coins (if any)
    if (coinsUsed > 0) {
      this.http.put('http://localhost:5000/api/auth/coins', {
        coins: coinsUsed,
        operation: 'subtract'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: (response: any) => {
          console.log('✅ Coins subtracted:', response);
          // Then add earned coins
          this.addEarnedCoins(coinsToAward, token);
        },
        error: (error) => {
          console.error('❌ Error subtracting coins:', error);
          // Still try to add earned coins
          this.addEarnedCoins(coinsToAward, token);
        }
      });
    } else {
      // No coins used, just add earned coins
      this.addEarnedCoins(coinsToAward, token);
    }
  }

  addEarnedCoins(coinsToAward: number, token: string) {
    if (coinsToAward > 0) {
      this.http.put('http://localhost:5000/api/auth/coins', {
        coins: coinsToAward,
        operation: 'add'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: (response: any) => {
          console.log('✅ Coins added:', response);
          // Update the user's coin balance in AuthService
          this.authService.updateUserCoins(response.coins);
          // Refresh user data from backend to ensure navbar gets latest info
          this.authService.refreshUserData();
          // Reload user coins in this component
          this.loadUserCoins();
        },
        error: (error) => {
          console.error('❌ Error adding coins:', error);
        }
      });
    } else {
      // No coins to add, just reload the current balance
      this.loadUserCoins();
    }
  }

  goBackToBooking() {
    this.router.navigate(['/booking/bus']);
  }
}
