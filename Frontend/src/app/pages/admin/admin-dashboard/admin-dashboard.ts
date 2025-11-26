import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';

// Register Chart.js components
Chart.register(...registerables);

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  totalCoins: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  yearlyRevenue: number;
  monthlyLoss: number;
  quarterlyLoss: number;
  yearlyLoss: number;
}

interface Booking {
  id: number;
  userId: number;
  userName: string;
  userEmail?: string;
  fromCity: string;
  toCity: string;
  travelDate: string;
  travelMode: string;
  operator: string;
  amount: number;
  price: number;
  status: string;
  createdAt: string;
  passengers: any[];
  bookingId?: string;
  journeyTime?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  coins: number;
  createdAt: string;
  totalBookings: number;
}

interface Route {
  id: number;
  fromCity: string;
  toCity: string;
  travelMode: string;
  operator: string;
  price: number;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Passenger {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  travelMode: string;
  fromCity: string;
  toCity: string;
  travelDate: string;
  bookingId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Field {
  id: number;
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  travelMode: string;
  required: boolean;
  isActive: boolean;
  order: number;
  validation?: string;
  createdAt: string;
  updatedAt: string;
}

interface Coin {
  id: number;
  name: string;
  amount: number;
  price: number;
  type: string;
  discount?: number;
  description?: string;
  isActive: boolean;
  isPopular: boolean;
  sales?: number;
  createdAt: string;
  updatedAt: string;
}

type TabType = 'overview' | 'bookings' | 'users' | 'analytics' | 'routes' | 'fields' | 'coins' | 'settings' | 'enquiries';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  activeTab: TabType = 'overview';
  loading: boolean = true;
  error: string = '';
  
  // Dashboard Data
  stats: DashboardStats = {
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalCoins: 0,
    monthlyRevenue: 0,
    quarterlyRevenue: 0,
    yearlyRevenue: 0,
    monthlyLoss: 0,
    quarterlyLoss: 0,
    yearlyLoss: 0
  };
  
  bookings: Booking[] = [];
  users: User[] = [];
  routes: Route[] = [];
  enquiries: any[] = [];
  enquiryFilter: string = 'all';
  // Resolve modal state
  showResolveModal: boolean = false;
  resolveNote: string = '';
  resolveTarget: any = null;
  
  // Analytics data
  analytics: any = null;
  
  // Route management
  showRouteForm: boolean = false;
  editingRoute: Route | null = null;
  selectedRouteMode: string = 'all';
  routeForm: any = {
    fromCity: '',
    toCity: '',
    travelMode: 'bus',
    operator: '',
    price: 0,
    duration: '',
    departureTime: '',
    arrivalTime: '',
    isActive: true
  };

  // Passenger Management Properties
  passengers: Passenger[] = [];
  showPassengerForm = false;
  editingPassenger: Passenger | null = null;
  selectedPassengerMode: string = 'all';
  passengerForm: any = {
    name: '',
    email: '',
    phone: '',
    age: 0,
    gender: 'male',
    travelMode: 'bus',
    fromCity: '',
    toCity: '',
    travelDate: '',
    bookingId: '',
    isActive: true
  };

  // Field Management Properties
  fields: Field[] = [];
  showFieldForm = false;
  editingField: Field | null = null;
  selectedFieldMode: string = 'all';
  fieldForm: any = {
    name: '',
    label: '',
    type: 'text',
    placeholder: '',
    travelMode: 'all',
    required: false,
    isActive: true,
    order: 1,
    validation: ''
  };

  // Coin Management Properties
  coins: Coin[] = [];
  coinStats: any = null;
  showCoinForm = false;
  editingCoin: Coin | null = null;
  selectedCoinFilter: string = 'all';
  coinForm: any = {
    name: '',
    amount: 0,
    price: 0,
    type: 'starter',
    discount: 0,
    description: '',
    isActive: true,
    isPopular: false
  };

  // Settings Properties
  settings: any = {
    coinRate: 5, // Percentage of booking price converted to coins
    maxBookingsPerUser: 10,
    maxCoinsPerUser: 1000,
    studentDiscount: 15,
    seniorDiscount: 20,
    studentCoinsRequired: 50,
    seniorCoinsRequired: 100,
    bookingCancellationHours: 24,
    refundProcessingDays: 7,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    siteName: 'GoTrip',
    siteDescription: 'Your gateway to amazing journeys across India',
    supportEmail: 'support@gotrip.com',
    supportPhone: '+91-1234567890',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: ''
  };
  settingsLoading: boolean = false;
  settingsSaving: boolean = false;
  
  // Chart references
  @ViewChild('revenueChart', { static: false }) revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('modeChart', { static: false }) modeChartRef!: ElementRef<HTMLCanvasElement>;
  
  // Chart instances
  revenueChart: Chart | null = null;
  modeChart: Chart | null = null;
  
  // Filters and Search
  bookingStatusFilter: string = 'all';
  userSearchTerm: string = '';
  bookingSearchTerm: string = '';
  
  // Pagination
  currentBookingPage: number = 1;
  currentUserPage: number = 1;
  itemsPerPage: number = 10;
  
  // Charts Data (for future implementation)
  revenueChartData: any[] = [];
  bookingTrendsData: any[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private adminService: AdminService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.checkAuthentication();
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    // Charts will be rendered when analytics data is loaded
  }

  get filteredEnquiries(): any[] {
    if (this.enquiryFilter === 'all') return this.enquiries;
    const tag = `[${this.enquiryFilter}`; // matches prefix like [Payment
    return this.enquiries.filter(q => (q.subject || '').includes(tag));
  }

  checkAuthentication() {
    if (!this.adminService.isLoggedIn()) {
      this.error = 'Please login to access admin dashboard';
      this.router.navigate(['/login']);
      return;
    }
  }

  async loadDashboardData() {
    this.loading = true;
    this.error = '';
    
    try {
      await Promise.all([
        this.loadStats(),
        this.loadBookings(),
        this.loadUsers()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.error = 'Failed to load dashboard data';
    } finally {
      this.loading = false;
    }
  }

  loadStats(): Promise<void> {
    return new Promise((resolve, reject) => {
        this.http.get('http://localhost:5000/api/admin/stats').subscribe({
        next: (response: any) => {
          console.log('✅ Stats loaded:', response);
          console.log('📊 Stats data:', response.stats);
          this.stats = response.stats;
          console.log('📊 Assigned stats:', this.stats);
          resolve();
        },
        error: (error) => {
          console.error('❌ Error loading stats:', error);
          reject(error);
        }
      });
    });
  }

  loadBookings(): Promise<void> {
    return new Promise((resolve, reject) => {
        this.http.get('http://localhost:5000/api/admin/bookings').subscribe({
        next: (response: any) => {
          console.log('✅ Bookings loaded:', response.bookings.length);
          this.bookings = response.bookings;
          resolve();
        },
        error: (error) => {
          console.error('❌ Error loading bookings:', error);
          reject(error);
        }
      });
    });
  }

  loadUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:5000/api/admin/users').subscribe({
        next: (response: any) => {
          console.log('✅ Users loaded:', response.users.length);
          this.users = response.users;
          resolve();
        },
        error: (error) => {
          console.error('❌ Error loading users:', error);
          reject(error);
        }
      });
    });
  }

  loadAnalytics(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:5000/api/admin/analytics').subscribe({
        next: (response: any) => {
          console.log('✅ Analytics loaded:', response.analytics);
          this.analytics = response.analytics;
          // Render charts after data is loaded
          setTimeout(() => {
            this.renderCharts();
          }, 100);
          resolve();
        },
        error: (error) => {
          console.error('❌ Error loading analytics:', error);
          reject(error);
        }
      });
    });
  }

  loadRoutes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:5000/api/admin/routes').subscribe({
        next: (response: any) => {
          console.log('✅ Routes loaded:', response.routes.length);
          this.routes = response.routes;
          resolve();
        },
        error: (error) => {
          console.error('❌ Error loading routes:', error);
          reject(error);
        }
      });
    });
  }

  // Tab Management
  switchTab(tab: TabType) {
    this.activeTab = tab;
    if (tab === 'bookings') {
      this.loadBookings();
    } else if (tab === 'users') {
      this.loadUsers();
    } else if (tab === 'analytics') {
      this.loadAnalytics();
    } else if (tab === 'routes') {
      this.loadRoutes();
    } else if (tab === 'fields') {
      this.loadFields();
    } else if (tab === 'coins') {
      this.loadCoins();
    } else if (tab === 'enquiries') {
      this.loadEnquiries();
    } else if (tab === 'settings') {
      this.loadSettings();
    }
  }

  // Filtering and Search
  get filteredBookings(): Booking[] {
    let filtered = this.bookings;
    
    if (this.bookingStatusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === this.bookingStatusFilter);
    }
    
    if (this.bookingSearchTerm) {
      const searchTerm = this.bookingSearchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.userName.toLowerCase().includes(searchTerm) ||
        booking.fromCity.toLowerCase().includes(searchTerm) ||
        booking.toCity.toLowerCase().includes(searchTerm) ||
        booking.operator.toLowerCase().includes(searchTerm) ||
        booking.bookingId?.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  }

  loadEnquiries(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:5000/api/enquiries/admin').subscribe({
        next: (response: any) => {
          this.enquiries = response.enquiries || [];
          resolve();
        },
        error: (error) => {
          console.error('❌ Error loading enquiries:', error);
          this.enquiries = [];
          resolve();
        }
      });
    });
  }

  openResolveModal(q: any) {
    this.resolveTarget = q;
    this.resolveNote = '';
    this.showResolveModal = true;
  }

  closeResolveModal() {
    this.showResolveModal = false;
    this.resolveTarget = null;
    this.resolveNote = '';
  }

  confirmResolve() {
    if (!this.resolveTarget) return;
    this.http.put(`http://localhost:5000/api/enquiries/${this.resolveTarget.id}/status`, { status: 'solved', resolutionNote: this.resolveNote || '' }).subscribe({
      next: (resp: any) => {
        const newStatus = resp?.enquiry?.status || 'solved';
        if (this.resolveTarget) {
          this.resolveTarget.status = newStatus;
        }
        if (resp?.emailSent) {
          this.toast.success('Enquiry updated and email sent to user');
        } else {
          this.toast.info('Enquiry updated. Email not sent: ' + (resp?.emailError || 'check mail settings'));
        }
        this.loadEnquiries();
        this.closeResolveModal();
      },
      error: (e) => {
        console.error(e);
        this.toast.error('Failed to update enquiry');
      }
    });
  }

  get filteredUsers(): User[] {
    if (!this.userSearchTerm) return this.users;
    
    const searchTerm = this.userSearchTerm.toLowerCase();
    return this.users.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }

  // Pagination
  get paginatedBookings(): Booking[] {
    const start = (this.currentBookingPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredBookings.slice(start, end);
  }

  get paginatedUsers(): User[] {
    const start = (this.currentUserPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  get totalBookingPages(): number {
    return Math.ceil(this.filteredBookings.length / this.itemsPerPage);
  }

  get totalUserPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  // Utility Methods
  formatCurrency(amount: number): string {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₹0';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }


  // Analytics helper functions
  getConfirmationRate(): number {
    if (!this.analytics?.bookingStatus) return 0;
    const confirmed = this.analytics.bookingStatus.find((s: any) => s.status === 'confirmed');
    const total = this.analytics.bookingStatus.reduce((sum: number, s: any) => sum + s.count, 0);
    return total > 0 ? Math.round((confirmed?.count || 0) / total * 100) : 0;
  }

  getStatusPercentage(count: number): number {
    if (!this.analytics?.bookingStatus) return 0;
    const total = this.analytics.bookingStatus.reduce((sum: number, s: any) => sum + s.count, 0);
    return total > 0 ? Math.round(count / total * 100) : 0;
  }

  getHourBarWidth(bookings: number): number {
    if (!this.analytics?.peakHours) return 0;
    const maxBookings = Math.max(...this.analytics.peakHours.map((h: any) => h.bookings));
    return maxBookings > 0 ? (bookings / maxBookings) * 100 : 0;
  }

  getTotalNewUsers(): number {
    if (!this.analytics?.userTrends) return 0;
    return this.analytics.userTrends.reduce((sum: number, trend: any) => sum + trend.newUsers, 0);
  }

  // Route Management Methods
  openRouteForm(route?: Route) {
    if (route) {
      this.editingRoute = route;
      this.routeForm = { ...route };
    } else {
      this.editingRoute = null;
      this.routeForm = {
        fromCity: '',
        toCity: '',
        travelMode: 'bus',
        operator: '',
        price: 0,
        duration: '',
        departureTime: '',
        arrivalTime: '',
        isActive: true
      };
    }
    this.showRouteForm = true;
  }

  closeRouteForm() {
    this.showRouteForm = false;
    this.editingRoute = null;
    this.routeForm = {
      fromCity: '',
      toCity: '',
      travelMode: 'bus',
      operator: '',
      price: 0,
      duration: '',
      departureTime: '',
      arrivalTime: '',
      isActive: true
    };
  }

  saveRoute() {
    if (this.editingRoute) {
      this.updateRoute();
    } else {
      this.createRoute();
    }
  }

  createRoute() {
    this.http.post('http://localhost:5000/api/admin/routes', this.routeForm).subscribe({
      next: (response: any) => {
        console.log('✅ Route created:', response);
        this.toast.success('Route created successfully!');
        this.closeRouteForm();
        this.loadRoutes();
      },
      error: (error) => {
        console.error('❌ Error creating route:', error);
        this.toast.error('Error creating route: ' + (error.error?.error || 'Unknown error'));
      }
    });
  }

  updateRoute() {
    if (!this.editingRoute) return;
    
    this.http.put(`http://localhost:5000/api/admin/routes/${this.editingRoute.id}`, this.routeForm).subscribe({
      next: (response: any) => {
        console.log('✅ Route updated:', response);
        this.toast.success('Route updated successfully!');
        this.closeRouteForm();
        this.loadRoutes();
      },
      error: (error) => {
        console.error('❌ Error updating route:', error);
        this.toast.error('Error updating route: ' + (error.error?.error || 'Unknown error'));
      }
    });
  }

  deleteRoute(route: Route) {
    if (confirm(`Are you sure you want to delete the route from ${route.fromCity} to ${route.toCity}?`)) {
      this.http.delete(`http://localhost:5000/api/admin/routes/${route.id}`).subscribe({
        next: (response: any) => {
          console.log('✅ Route deleted:', response);
          this.toast.success('Route deleted successfully!');
          this.loadRoutes();
        },
        error: (error) => {
          console.error('❌ Error deleting route:', error);
          this.toast.error('Error deleting route: ' + (error.error?.error || 'Unknown error'));
        }
      });
    }
  }

  get filteredRoutes(): Route[] {
    return this.routes;
  }

  // Route mode filtering methods
  selectRouteMode(mode: string) {
    this.selectedRouteMode = mode;
  }

  getRoutesByMode(mode: string): Route[] {
    if (mode === 'all') {
      return this.routes;
    }
    return this.routes.filter(route => route.travelMode === mode);
  }

  getFilteredRoutes(): Route[] {
    return this.getRoutesByMode(this.selectedRouteMode);
  }

  // Passenger Management Methods
  loadPassengers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:5000/api/admin/passengers').subscribe({
        next: (response: any) => {
          console.log('✅ Passengers loaded:', response.passengers.length);
          this.passengers = response.passengers;
          resolve();
        },
        error: (error) => {
          console.error('❌ Error loading passengers:', error);
          // For now, create mock data
          this.passengers = this.generateMockPassengers();
          resolve();
        }
      });
    });
  }

  generateMockPassengers(): Passenger[] {
    return [
      {
        id: 1,
        name: 'Rajesh Kumar Sharma',
        email: 'rajesh.sharma@example.com',
        phone: '+91 9876543210',
        age: 28,
        gender: 'male',
        travelMode: 'bus',
        fromCity: 'Mumbai',
        toCity: 'Delhi',
        travelDate: '2024-01-15',
        bookingId: 'BUS001',
        isActive: true,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 2,
        name: 'Priya Singh',
        email: 'priya.singh@example.com',
        phone: '+91 9876543211',
        age: 25,
        gender: 'female',
        travelMode: 'train',
        fromCity: 'Bangalore',
        toCity: 'Chennai',
        travelDate: '2024-01-16',
        bookingId: 'TRAIN001',
        isActive: true,
        createdAt: '2024-01-11',
        updatedAt: '2024-01-11'
      },
      {
        id: 3,
        name: 'Amit Patel',
        email: 'amit.patel@example.com',
        phone: '+91 9876543212',
        age: 35,
        gender: 'male',
        travelMode: 'flight',
        fromCity: 'Delhi',
        toCity: 'Mumbai',
        travelDate: '2024-01-17',
        bookingId: 'FLIGHT001',
        isActive: true,
        createdAt: '2024-01-12',
        updatedAt: '2024-01-12'
      },
      {
        id: 4,
        name: 'Sneha Gupta',
        email: 'sneha.gupta@example.com',
        phone: '+91 9876543213',
        age: 30,
        gender: 'female',
        travelMode: 'bus',
        fromCity: 'Pune',
        toCity: 'Goa',
        travelDate: '2024-01-18',
        bookingId: 'BUS002',
        isActive: true,
        createdAt: '2024-01-13',
        updatedAt: '2024-01-13'
      },
      {
        id: 5,
        name: 'Vikram Reddy',
        email: 'vikram.reddy@example.com',
        phone: '+91 9876543214',
        age: 42,
        gender: 'male',
        travelMode: 'train',
        fromCity: 'Hyderabad',
        toCity: 'Bangalore',
        travelDate: '2024-01-19',
        bookingId: 'TRAIN002',
        isActive: true,
        createdAt: '2024-01-14',
        updatedAt: '2024-01-14'
      },
      {
        id: 6,
        name: 'Anita Joshi',
        email: 'anita.joshi@example.com',
        phone: '+91 9876543215',
        age: 27,
        gender: 'female',
        travelMode: 'flight',
        fromCity: 'Kolkata',
        toCity: 'Delhi',
        travelDate: '2024-01-20',
        bookingId: 'FLIGHT002',
        isActive: true,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      }
    ];
  }

  openPassengerForm(passenger?: Passenger) {
    if (passenger) {
      this.editingPassenger = passenger;
      this.passengerForm = { ...passenger };
    } else {
      this.editingPassenger = null;
      this.passengerForm = {
        name: '',
        email: '',
        phone: '',
        age: 0,
        gender: 'male',
        travelMode: 'bus',
        fromCity: '',
        toCity: '',
        travelDate: '',
        bookingId: '',
        isActive: true
      };
    }
    this.showPassengerForm = true;
  }

  closePassengerForm() {
    this.showPassengerForm = false;
    this.editingPassenger = null;
    this.passengerForm = {
      name: '',
      email: '',
      phone: '',
      age: 0,
      gender: 'male',
      travelMode: 'bus',
      fromCity: '',
      toCity: '',
      travelDate: '',
      bookingId: '',
      isActive: true
    };
  }

  savePassenger() {
    if (this.editingPassenger) {
      this.updatePassenger();
    } else {
      this.createPassenger();
    }
  }

  createPassenger() {
    this.http.post('http://localhost:5000/api/admin/passengers', this.passengerForm).subscribe({
      next: (response: any) => {
        console.log('✅ Passenger created:', response);
        this.toast.success('Passenger created successfully!');
        this.closePassengerForm();
        this.loadPassengers();
      },
      error: (error) => {
        console.error('❌ Error creating passenger:', error);
        this.toast.error('Error creating passenger: ' + (error.error?.error || 'Unknown error'));
      }
    });
  }

  updatePassenger() {
    if (!this.editingPassenger) return;
    
    this.http.put(`http://localhost:5000/api/admin/passengers/${this.editingPassenger.id}`, this.passengerForm).subscribe({
      next: (response: any) => {
        console.log('✅ Passenger updated:', response);
        this.toast.success('Passenger updated successfully!');
        this.closePassengerForm();
        this.loadPassengers();
      },
      error: (error) => {
        console.error('❌ Error updating passenger:', error);
        this.toast.error('Error updating passenger: ' + (error.error?.error || 'Unknown error'));
      }
    });
  }

  deletePassenger(passenger: Passenger) {
    if (confirm(`Are you sure you want to delete passenger ${passenger.name}?`)) {
      this.http.delete(`http://localhost:5000/api/admin/passengers/${passenger.id}`).subscribe({
        next: (response: any) => {
          console.log('✅ Passenger deleted:', response);
          this.toast.success('Passenger deleted successfully!');
          this.loadPassengers();
        },
        error: (error) => {
          console.error('❌ Error deleting passenger:', error);
          this.toast.error('Error deleting passenger: ' + (error.error?.error || 'Unknown error'));
        }
      });
    }
  }

  selectPassengerMode(mode: string) {
    this.selectedPassengerMode = mode;
  }

  getPassengersByMode(mode: string): Passenger[] {
    if (mode === 'all') {
      return this.passengers;
    }
    return this.passengers.filter(passenger => passenger.travelMode === mode);
  }

  getFilteredPassengers(): Passenger[] {
    return this.getPassengersByMode(this.selectedPassengerMode);
  }

  getTotalPassengers(): number {
    return this.passengers.length;
  }

  // Field Management Methods
  loadFields(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:5000/api/admin/fields').subscribe({
        next: (response: any) => {
          console.log('✅ Fields loaded:', response.fields.length);
          this.fields = response.fields;
          resolve();
        },
        error: (error) => {
          console.error('❌ Error loading fields:', error);
          // For now, create mock data
          this.fields = this.generateMockFields();
          resolve();
        }
      });
    });
  }

  generateMockFields(): Field[] {
    return [
      {
        id: 1,
        name: 'passenger_name',
        label: 'Full Name',
        type: 'text',
        placeholder: 'Enter passenger full name',
        travelMode: 'all',
        required: true,
        isActive: true,
        order: 1,
        validation: 'min:2,max:50',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 2,
        name: 'passenger_email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'Enter email address',
        travelMode: 'all',
        required: true,
        isActive: true,
        order: 2,
        validation: 'email',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 3,
        name: 'passenger_phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: 'Enter phone number',
        travelMode: 'all',
        required: true,
        isActive: true,
        order: 3,
        validation: 'min:10,max:15',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 4,
        name: 'passenger_age',
        label: 'Age',
        type: 'number',
        placeholder: 'Enter age',
        travelMode: 'all',
        required: true,
        isActive: true,
        order: 4,
        validation: 'min:1,max:120',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 5,
        name: 'passenger_gender',
        label: 'Gender',
        type: 'select',
        placeholder: 'Select gender',
        travelMode: 'all',
        required: true,
        isActive: true,
        order: 5,
        validation: '',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 6,
        name: 'emergency_contact',
        label: 'Emergency Contact',
        type: 'text',
        placeholder: 'Enter emergency contact name',
        travelMode: 'flight',
        required: false,
        isActive: true,
        order: 6,
        validation: 'min:2,max:50',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 7,
        name: 'seat_preference',
        label: 'Seat Preference',
        type: 'select',
        placeholder: 'Select seat preference',
        travelMode: 'flight',
        required: false,
        isActive: true,
        order: 7,
        validation: '',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 8,
        name: 'meal_preference',
        label: 'Meal Preference',
        type: 'select',
        placeholder: 'Select meal preference',
        travelMode: 'flight',
        required: false,
        isActive: true,
        order: 8,
        validation: '',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      }
    ];
  }

  openFieldForm(field?: Field): void {
    if (field) {
      this.editingField = field;
      this.fieldForm = { ...field };
    } else {
      this.editingField = null;
      this.fieldForm = {
        name: '',
        label: '',
        type: 'text',
        placeholder: '',
        travelMode: 'all',
        required: false,
        isActive: true,
        order: this.fields.length + 1,
        validation: ''
      };
    }
    this.showFieldForm = true;
  }

  closeFieldForm(): void {
    this.showFieldForm = false;
    this.editingField = null;
    this.fieldForm = {
      name: '',
      label: '',
      type: 'text',
      placeholder: '',
      travelMode: 'all',
      required: false,
      isActive: true,
      order: 1,
      validation: ''
    };
  }

  saveField(): void {
    if (this.editingField) {
      this.updateField();
    } else {
      this.createField();
    }
  }

  createField(): void {
    const newField: Field = {
      id: Date.now(),
      ...this.fieldForm,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.fields.push(newField);
    this.closeFieldForm();
    console.log('✅ Field created:', newField);
  }

  updateField(): void {
    if (!this.editingField) return;

    const index = this.fields.findIndex(f => f.id === this.editingField!.id);
    if (index !== -1) {
      this.fields[index] = {
        ...this.fields[index],
        ...this.fieldForm,
        updatedAt: new Date().toISOString()
      };
    }

    this.closeFieldForm();
    console.log('✅ Field updated:', this.fields[index]);
  }

  deleteField(field: Field): void {
    if (confirm(`Are you sure you want to delete the field "${field.label}"?`)) {
      const index = this.fields.findIndex(f => f.id === field.id);
      if (index !== -1) {
        this.fields.splice(index, 1);
        console.log('✅ Field deleted:', field.label);
      }
    }
  }

  selectFieldMode(mode: string): void {
    this.selectedFieldMode = mode;
  }

  getFieldsByMode(mode: string): Field[] {
    if (mode === 'all') {
      return this.fields;
    }
    return this.fields.filter(field => field.travelMode === mode || field.travelMode === 'all');
  }

  getFilteredFields(): Field[] {
    return this.getFieldsByMode(this.selectedFieldMode);
  }

  getTotalFields(): number {
    return this.fields.length;
  }

  // Coin Management Methods
  loadCoins(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Load coins and statistics in parallel
      Promise.all([
        this.loadCoinPackages(),
        this.loadCoinStatistics()
      ]).then(() => {
        resolve();
      }).catch((error) => {
        console.error('❌ Error loading coin data:', error);
        // Fallback to mock data
        this.coins = this.generateMockCoins();
        this.coinStats = this.generateMockCoinStats();
        resolve();
      });
    });
  }

  loadCoinPackages(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:5000/api/admin/coins').subscribe({
        next: (response: any) => {
          console.log('✅ Coin packages loaded from backend:', response.coins.length);
          this.coins = response.coins;
          resolve();
        },
        error: (error) => {
          console.error('❌ Error loading coin packages:', error);
          reject(error);
        }
      });
    });
  }

  loadCoinStatistics(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:5000/api/admin/coins/stats').subscribe({
        next: (response: any) => {
          console.log('✅ Coin statistics loaded from backend:', response.stats);
          this.coinStats = response.stats;
          resolve();
        },
        error: (error) => {
          console.error('❌ Error loading coin statistics:', error);
          reject(error);
        }
      });
    });
  }

  generateMockCoins(): Coin[] {
    return [
      {
        id: 1,
        name: 'Starter Pack',
        amount: 100,
        price: 99,
        type: 'starter',
        discount: 0,
        description: 'Perfect for trying out our services',
        isActive: true,
        isPopular: true,
        sales: 1250,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 2,
        name: 'Standard Bundle',
        amount: 500,
        price: 399,
        type: 'standard',
        discount: 10,
        description: 'Great value for regular users',
        isActive: true,
        isPopular: true,
        sales: 890,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 3,
        name: 'Premium Package',
        amount: 1000,
        price: 699,
        type: 'premium',
        discount: 15,
        description: 'Best value for frequent travelers',
        isActive: true,
        isPopular: false,
        sales: 456,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 4,
        name: 'VIP Elite',
        amount: 2500,
        price: 1499,
        type: 'vip',
        discount: 20,
        description: 'Exclusive package for VIP members',
        isActive: true,
        isPopular: false,
        sales: 234,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 5,
        name: 'Special Offer',
        amount: 2000,
        price: 999,
        type: 'special',
        discount: 25,
        description: 'Limited time special offer',
        isActive: true,
        isPopular: true,
        sales: 678,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 6,
        name: 'Mini Pack',
        amount: 50,
        price: 49,
        type: 'starter',
        discount: 0,
        description: 'Small pack for light users',
        isActive: false,
        isPopular: false,
        sales: 123,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      }
    ];
  }

  generateMockCoinStats(): any {
    return {
      totalCoinsInCirculation: 1250000,
      totalRevenue: 2500000,
      activeUsers: 3500,
      averagePurchase: 714.29,
      distributedCoins: 1000000,
      usedCoins: 750000,
      lostCoins: 50000,
      pendingCoins: 200000,
      availableCoins: 200000,
      coinUtilizationRate: 75.0,
      coinLossRate: 5.0,
      coinPendingRate: 20.0,
      packageDistribution: [
        { type: 'starter', packageCount: 2, totalCoins: 137300, totalSales: 1373, avgPrice: 74.0 },
        { type: 'standard', packageCount: 1, totalCoins: 445000, totalSales: 890, avgPrice: 359.1 },
        { type: 'premium', packageCount: 1, totalCoins: 456000, totalSales: 456, avgPrice: 594.15 },
        { type: 'vip', packageCount: 1, totalCoins: 585000, totalSales: 234, avgPrice: 1199.2 },
        { type: 'special', packageCount: 1, totalCoins: 1356000, totalSales: 678, avgPrice: 749.25 }
      ],
      topPackages: [
        { name: 'Starter Pack', amount: 100, price: 99, type: 'starter', discount: 0, sales: 1250, totalCoinsSold: 125000, totalRevenue: 123750 },
        { name: 'Standard Bundle', amount: 500, price: 399, type: 'standard', discount: 10, sales: 890, totalCoinsSold: 445000, totalRevenue: 319590 },
        { name: 'Special Offer', amount: 2000, price: 999, type: 'special', discount: 25, sales: 678, totalCoinsSold: 1356000, totalRevenue: 508050 },
        { name: 'Premium Package', amount: 1000, price: 699, type: 'premium', discount: 15, sales: 456, totalCoinsSold: 456000, totalRevenue: 270864 },
        { name: 'VIP Elite', amount: 2500, price: 1499, type: 'vip', discount: 20, sales: 234, totalCoinsSold: 585000, totalRevenue: 280632 }
      ]
    };
  }

  openCoinForm(coin?: Coin): void {
    if (coin) {
      this.editingCoin = coin;
      this.coinForm = { ...coin };
    } else {
      this.editingCoin = null;
      this.coinForm = {
        name: '',
        amount: 0,
        price: 0,
        type: 'starter',
        discount: 0,
        description: '',
        isActive: true,
        isPopular: false
      };
    }
    this.showCoinForm = true;
  }

  closeCoinForm(): void {
    this.showCoinForm = false;
    this.editingCoin = null;
    this.coinForm = {
      name: '',
      amount: 0,
      price: 0,
      type: 'starter',
      discount: 0,
      description: '',
      isActive: true,
      isPopular: false
    };
  }

  saveCoin(): void {
    if (this.editingCoin) {
      this.updateCoin();
    } else {
      this.createCoin();
    }
  }

  createCoin(): void {
    this.http.post('http://localhost:5000/api/admin/coins', this.coinForm).subscribe({
      next: (response: any) => {
        console.log('✅ Coin package created in backend:', response);
        // Reload coins and statistics from backend
        this.loadCoins();
        this.closeCoinForm();
        this.toast.success('Coin package created successfully!');
      },
      error: (error) => {
        console.error('❌ Error creating coin package:', error);
        this.toast.error('Error creating coin package. Please try again.');
      }
    });
  }

  updateCoin(): void {
    if (!this.editingCoin) return;

    this.http.put(`http://localhost:5000/api/admin/coins/${this.editingCoin.id}`, this.coinForm).subscribe({
      next: (response: any) => {
        console.log('✅ Coin package updated in backend:', response);
        // Reload coins from backend
        this.loadCoins();
        this.closeCoinForm();
        this.toast.success('Coin package updated successfully!');
      },
      error: (error) => {
        console.error('❌ Error updating coin package:', error);
        this.toast.error('Error updating coin package. Please try again.');
      }
    });
  }

  deleteCoin(coin: Coin): void {
    if (confirm(`Are you sure you want to delete the coin package "${coin.name}"?`)) {
      this.http.delete(`http://localhost:5000/api/admin/coins/${coin.id}`).subscribe({
        next: (response: any) => {
          console.log('✅ Coin package deleted from backend:', response);
          // Reload coins from backend
          this.loadCoins();
          this.toast.success('Coin package deleted successfully!');
        },
        error: (error) => {
          console.error('❌ Error deleting coin package:', error);
          this.toast.error('Error deleting coin package. Please try again.');
        }
      });
    }
  }

  selectCoinFilter(filter: string): void {
    this.selectedCoinFilter = filter;
  }

  getFilteredCoins(): Coin[] {
    switch (this.selectedCoinFilter) {
      case 'active':
        return this.getActiveCoinPackages();
      case 'popular':
        return this.getPopularCoinPackages();
      case 'premium':
        return this.getPremiumCoinPackages();
      default:
        return this.coins;
    }
  }

  getActiveCoinPackages(): Coin[] {
    return this.coins.filter(coin => coin.isActive);
  }

  getPopularCoinPackages(): Coin[] {
    return this.coins.filter(coin => coin.isPopular);
  }

  getPremiumCoinPackages(): Coin[] {
    return this.coins.filter(coin => coin.type === 'premium' || coin.type === 'vip');
  }

  getTotalCoins(): number {
    return this.coins.length;
  }

  getTotalCoinsInCirculation(): number {
    return this.coins.reduce((total, coin) => total + (coin.amount * (coin.sales || 0)), 0);
  }

  getTotalCoinRevenue(): number {
    return this.coins.reduce((total, coin) => {
      const discountedPrice = coin.price * (1 - (coin.discount || 0) / 100);
      return total + (discountedPrice * (coin.sales || 0));
    }, 0);
  }

  getActiveCoinUsers(): number {
    return this.coins.reduce((total, coin) => total + (coin.sales || 0), 0);
  }

  getAveragePurchase(): number {
    const totalRevenue = this.getTotalCoinRevenue();
    const totalUsers = this.getActiveCoinUsers();
    return totalUsers > 0 ? totalRevenue / totalUsers : 0;
  }

  // Chart rendering methods
  renderCharts() {
    this.renderRevenueChart();
    this.renderModeChart();
  }

  renderRevenueChart() {
    if (!this.analytics?.revenueTrends || !this.revenueChartRef) return;

    // Destroy existing chart
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }

    const ctx = this.revenueChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.analytics.revenueTrends.map((item: any) => item.month),
        datasets: [{
          label: 'Revenue (₹)',
          data: this.analytics.revenueTrends.map((item: any) => item.revenue),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₹' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  renderModeChart() {
    if (!this.analytics?.bookingByMode || !this.modeChartRef) return;

    // Destroy existing chart
    if (this.modeChart) {
      this.modeChart.destroy();
    }

    const ctx = this.modeChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.modeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.analytics.bookingByMode.map((item: any) => item.travelMode),
        datasets: [{
          data: this.analytics.bookingByMode.map((item: any) => item.count),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  getTransportIcon(travelMode: string): string {
    switch (travelMode.toLowerCase()) {
      case 'flight':
      case 'plane':
        return 'bi-airplane';
      case 'train':
        return 'bi-train-front';
      case 'bus':
        return 'bi-bus-front';
      default:
        return 'bi-geo-alt';
    }
  }

  // Actions
  refreshData() {
    this.loadDashboardData();
  }

  logout() {
    this.adminService.logout();
    this.router.navigate(['/login']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  // Booking Actions
  updateBookingStatus(booking: Booking, newStatus: string) {
    // TODO: Implement booking status update
    console.log('Update booking status:', booking.id, newStatus);
  }

  deleteBooking(booking: Booking) {
    if (confirm(`Are you sure you want to delete booking ${booking.bookingId || booking.id}?`)) {
      // TODO: Implement booking deletion
      console.log('Delete booking:', booking.id);
    }
  }

  // User Actions
  updateUserCoins(user: User, newCoins: number) {
    // TODO: Implement user coin update
    console.log('Update user coins:', user.id, newCoins);
  }

  // Analytics
  getRevenueGrowth(): number {
    if (this.stats.monthlyRevenue === 0) return 0;
    return ((this.stats.monthlyRevenue - this.stats.monthlyLoss) / this.stats.monthlyRevenue) * 100;
  }

  getBookingGrowth(): number {
    // TODO: Calculate booking growth percentage
    return 0;
  }

  getTopRoutes(): any[] {
    const routeCounts: { [key: string]: number } = {};
    this.bookings.forEach(booking => {
      const route = `${booking.fromCity} → ${booking.toCity}`;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });
    
    return Object.entries(routeCounts)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Pagination methods
  goToFirstBookingPage() {
    this.currentBookingPage = 1;
  }

  goToPreviousBookingPage() {
    if (this.currentBookingPage > 1) {
      this.currentBookingPage--;
    }
  }

  goToNextBookingPage() {
    if (this.currentBookingPage < this.totalBookingPages) {
      this.currentBookingPage++;
    }
  }

  goToLastBookingPage() {
    this.currentBookingPage = this.totalBookingPages;
  }

  goToFirstUserPage() {
    this.currentUserPage = 1;
  }

  goToPreviousUserPage() {
    if (this.currentUserPage > 1) {
      this.currentUserPage--;
    }
  }

  goToNextUserPage() {
    if (this.currentUserPage < this.totalUserPages) {
      this.currentUserPage++;
    }
  }

  goToLastUserPage() {
    this.currentUserPage = this.totalUserPages;
  }

  // Helper function to draw header
  drawPDFHeader(doc: jsPDF, pageWidth: number, tab: string): number {
    // Header background
    doc.setFillColor(31, 41, 55); // Dark gray
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Logo/Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('GoTrip', pageWidth / 2, 20, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('Admin Dashboard Report', pageWidth / 2, 32, { align: 'center' });
    
    // Report type badge
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(pageWidth / 2 - 40, 38, 80, 8, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(tab.charAt(0).toUpperCase() + tab.slice(1) + ' Report', pageWidth / 2, 43, { align: 'center' });
    
    return 60;
  }

  // Helper function to draw footer
  drawPDFFooter(doc: jsPDF, pageWidth: number, pageHeight: number, pageNum: number, totalPages: number) {
    const footerY = pageHeight - 15;
    
    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
    
    // Footer text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, footerY);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
    doc.text('GoTrip Admin Dashboard', pageWidth - 20, footerY, { align: 'right' });
  }

  // Helper function to draw section header
  drawSectionHeader(doc: jsPDF, title: string, y: number, pageWidth: number): number {
    // Section background - centered
    const sectionWidth = pageWidth - 40;
    const sectionLeft = (pageWidth - sectionWidth) / 2;
    doc.setFillColor(243, 244, 246); // Light gray
    doc.rect(sectionLeft, y - 8, sectionWidth, 12, 'F');
    
    // Section title - centered
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(title, pageWidth / 2, y, { align: 'center' });
    
    // Underline - centered
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(2);
    const underlineWidth = 55;
    const underlineLeft = (pageWidth - underlineWidth) / 2;
    doc.line(underlineLeft, y + 2, underlineLeft + underlineWidth, y + 2);
    
    return y + 15;
  }

  // Helper function to draw metric card
  drawMetricCard(doc: jsPDF, label: string, value: string, x: number, y: number, width: number, height: number): void {
    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.rect(x, y, width, height, 'FD');
    
    // Label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(label, x + 5, y + 8);
    
    // Value
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(value, x + 5, y + 18);
  }

  // Export Functions
  exportToPDF(tab: string) {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentPage = 1;
      
      // Draw header
      let yPosition = this.drawPDFHeader(doc, pageWidth, tab);
      
      // Draw footer for first page
      this.drawPDFFooter(doc, pageWidth, pageHeight, currentPage, 1);

      // Content based on tab
      let totalPages = 1;
      switch (tab) {
        case 'overview':
          totalPages = this.exportOverviewToPDF(doc, yPosition, pageWidth, pageHeight);
          break;
        case 'bookings':
          totalPages = this.exportBookingsToPDF(doc, yPosition, pageWidth, pageHeight);
          break;
        case 'users':
          totalPages = this.exportUsersToPDF(doc, yPosition, pageWidth, pageHeight);
          break;
        case 'analytics':
          totalPages = this.exportAnalyticsToPDF(doc, yPosition, pageWidth, pageHeight);
          break;
        case 'routes':
          totalPages = this.exportRoutesToPDF(doc, yPosition, pageWidth, pageHeight);
          break;
        case 'fields':
          totalPages = this.exportFieldsToPDF(doc, yPosition, pageWidth, pageHeight);
          break;
        case 'coins':
          totalPages = this.exportCoinsToPDF(doc, yPosition, pageWidth, pageHeight);
          break;
        case 'enquiries':
          totalPages = this.exportEnquiriesToPDF(doc, yPosition, pageWidth, pageHeight);
          break;
        case 'settings':
          totalPages = this.exportSettingsToPDF(doc, yPosition, pageWidth, pageHeight);
          break;
        default:
          doc.setTextColor(100, 100, 100);
          doc.text('No data available for this tab.', 20, yPosition);
      }

      // Update footer for all pages
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        this.drawPDFFooter(doc, pageWidth, pageHeight, i, totalPages);
      }

      doc.save(`GoTrip_${tab}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      this.toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.toast.error('Failed to generate PDF report');
    }
  }

  exportOverviewToPDF(doc: jsPDF, yPos: number, pageWidth: number, pageHeight: number): number {
    let y = yPos;
    let pageNum = 1;
    
    // Section header
    y = this.drawSectionHeader(doc, 'Dashboard Statistics', y, pageWidth);
    
    // Key Metrics in grid layout - centered
    const cardWidth = 80;
    const cardHeight = 25;
    const cardGap = 10;
    const totalCardsWidth = (cardWidth * 2) + cardGap;
    let cardX = (pageWidth - totalCardsWidth) / 2;
    let cardY = y;
    
    // Row 1
    this.drawMetricCard(doc, 'Total Users', this.stats.totalUsers.toString(), cardX, cardY, cardWidth, cardHeight);
    cardX += cardWidth + cardGap;
    this.drawMetricCard(doc, 'Total Bookings', this.stats.totalBookings.toString(), cardX, cardY, cardWidth, cardHeight);
    cardY += cardHeight + 10;
    cardX = (pageWidth - totalCardsWidth) / 2;
    
    // Row 2
    this.drawMetricCard(doc, 'Total Revenue', this.formatCurrency(this.stats.totalRevenue), cardX, cardY, cardWidth, cardHeight);
    cardX += cardWidth + cardGap;
    this.drawMetricCard(doc, 'Total Coins', this.stats.totalCoins.toString(), cardX, cardY, cardWidth, cardHeight);
    cardY += cardHeight + 20;
    
    // Revenue Section
    y = this.drawSectionHeader(doc, 'Revenue Breakdown', cardY, pageWidth);
    
    // Revenue table - centered
    const tableWidth = 170;
    const tableLeft = (pageWidth - tableWidth) / 2;
    const tableRight = tableLeft + tableWidth;
    const rowHeight = 8;
    const headerHeight = 8;
    
    // Table header
    doc.setFillColor(59, 130, 246);
    doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Period', tableLeft + 5, y + 6);
    doc.text('Revenue', tableLeft + 50, y + 6);
    doc.text('Loss', tableLeft + 110, y + 6);
    doc.text('Net', tableLeft + 145, y + 6);
    
    y += headerHeight;
    const revenueData = [
      ['Monthly', this.formatCurrency(this.stats.monthlyRevenue), this.formatCurrency(this.stats.monthlyLoss), this.formatCurrency(this.stats.monthlyRevenue - this.stats.monthlyLoss)],
      ['Quarterly', this.formatCurrency(this.stats.quarterlyRevenue), this.formatCurrency(this.stats.quarterlyLoss), this.formatCurrency(this.stats.quarterlyRevenue - this.stats.quarterlyLoss)],
      ['Yearly', this.formatCurrency(this.stats.yearlyRevenue), this.formatCurrency(this.stats.yearlyLoss), this.formatCurrency(this.stats.yearlyRevenue - this.stats.yearlyLoss)]
    ];
    
    doc.setFont('helvetica', 'normal');
    revenueData.forEach((row, index) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        pageNum++;
        y = 60;
      }
      
      // Alternate row color
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(tableLeft, y - 2, tableWidth, rowHeight, 'F');
      }
      
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(9);
      doc.text(row[0], tableLeft + 5, y + 5);
      doc.text(row[1], tableLeft + 50, y + 5);
      doc.setTextColor(220, 38, 38);
      doc.text(row[2], tableLeft + 110, y + 5);
      doc.setTextColor(34, 197, 94);
      doc.text(row[3], tableLeft + 145, y + 5);
      
      // Row border
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(tableLeft, y + rowHeight - 1, tableRight, y + rowHeight - 1);
      
      y += rowHeight;
    });
    
    return pageNum;
  }

  exportBookingsToPDF(doc: jsPDF, yPos: number, pageWidth: number, pageHeight: number): number {
    let y = yPos;
    let pageNum = 1;
    
    const bookings = this.filteredBookings;
    if (bookings.length === 0) {
      y = this.drawSectionHeader(doc, 'Bookings Report', y, pageWidth);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('No bookings found.', pageWidth / 2, y, { align: 'center' });
      return pageNum;
    }

    y = this.drawSectionHeader(doc, `Bookings Report (${bookings.length} total)`, y, pageWidth);
    
    // Table configuration - centered
    const tableWidth = 170; // Total table width
    const tableLeft = (pageWidth - tableWidth) / 2;
    const tableRight = tableLeft + tableWidth;
    const rowHeight = 8;
    const headerHeight = 8;
    
    // Column positions (relative to tableLeft)
    const colBookingId = tableLeft + 3;
    const colUser = tableLeft + 35;
    const colRoute = tableLeft + 75;
    const colMode = tableLeft + 120;
    const colAmount = tableLeft + 140;
    const colStatus = tableLeft + 155;
    
    // Table header
    doc.setFillColor(59, 130, 246);
    doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Booking ID', colBookingId, y + 6);
    doc.text('User', colUser, y + 6);
    doc.text('Route', colRoute, y + 6);
    doc.text('Mode', colMode, y + 6);
    doc.text('Amount', colAmount, y + 6);
    doc.text('Status', colStatus, y + 6);
    
    y += headerHeight;
    
    bookings.forEach((booking, index) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        pageNum++;
        y = 60;
        // Redraw header on new page
        this.drawPDFHeader(doc, pageWidth, 'bookings');
        // Redraw table header
        doc.setFillColor(59, 130, 246);
        doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Booking ID', colBookingId, y + 6);
        doc.text('User', colUser, y + 6);
        doc.text('Route', colRoute, y + 6);
        doc.text('Mode', colMode, y + 6);
        doc.text('Amount', colAmount, y + 6);
        doc.text('Status', colStatus, y + 6);
        y += headerHeight;
      }
      
      // Alternate row color
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(tableLeft, y - 2, tableWidth, rowHeight, 'F');
      }
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      doc.text((booking.bookingId || `GT-${booking.id}`).substring(0, 12), colBookingId, y + 5);
      doc.text(booking.userName.substring(0, 15), colUser, y + 5);
      doc.text(`${booking.fromCity} → ${booking.toCity}`.substring(0, 18), colRoute, y + 5);
      doc.text((booking.travelMode || 'N/A').toUpperCase(), colMode, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
      doc.text(this.formatCurrency(booking.price), colAmount, y + 5);
      
      // Status badge
      const statusColor = booking.status === 'confirmed' ? [34, 197, 94] : 
                         booking.status === 'pending' ? [251, 191, 36] : [220, 38, 38];
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.rect(colStatus, y, 15, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      const statusText = (booking.status || 'Pending').toUpperCase().substring(0, 8);
      doc.text(statusText, colStatus + 7.5, y + 4.5, { align: 'center' });
      
      // Row border
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(tableLeft, y + rowHeight - 1, tableRight, y + rowHeight - 1);
      
      y += rowHeight;
    });
    
    return pageNum;
  }

  exportUsersToPDF(doc: jsPDF, yPos: number, pageWidth: number, pageHeight: number): number {
    let y = yPos;
    let pageNum = 1;
    
    const users = this.filteredUsers;
    if (users.length === 0) {
      y = this.drawSectionHeader(doc, 'Users Report', y, pageWidth);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('No users found.', pageWidth / 2, y, { align: 'center' });
      return pageNum;
    }

    y = this.drawSectionHeader(doc, `Users Report (${users.length} total)`, y, pageWidth);
    
    // Table configuration - centered
    const tableWidth = 170;
    const tableLeft = (pageWidth - tableWidth) / 2;
    const tableRight = tableLeft + tableWidth;
    const rowHeight = 8;
    const headerHeight = 8;
    
    // Column positions
    const colName = tableLeft + 3;
    const colEmail = tableLeft + 60;
    const colCoins = tableLeft + 125;
    const colBookings = tableLeft + 145;
    const colMemberSince = tableLeft + 160;
    
    // Table header
    doc.setFillColor(59, 130, 246);
    doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Name', colName, y + 6);
    doc.text('Email', colEmail, y + 6);
    doc.text('Coins', colCoins, y + 6);
    doc.text('Bookings', colBookings, y + 6);
    doc.text('Since', colMemberSince, y + 6);
    
    y += headerHeight;
    
    users.forEach((user, index) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        pageNum++;
        y = 60;
        this.drawPDFHeader(doc, pageWidth, 'users');
        doc.setFillColor(59, 130, 246);
        doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Name', colName, y + 6);
        doc.text('Email', colEmail, y + 6);
        doc.text('Coins', colCoins, y + 6);
        doc.text('Bookings', colBookings, y + 6);
        doc.text('Since', colMemberSince, y + 6);
        y += headerHeight;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(tableLeft, y - 2, tableWidth, rowHeight, 'F');
      }
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      doc.text(user.name.substring(0, 25), colName, y + 5);
      doc.text(user.email.substring(0, 28), colEmail, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(251, 191, 36);
      doc.text(user.coins.toString(), colCoins, y + 5);
      doc.setTextColor(34, 197, 94);
      doc.text((user.totalBookings || 0).toString(), colBookings, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(7);
      const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A';
      doc.text(createdDate, colMemberSince, y + 5);
      
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(tableLeft, y + rowHeight - 1, tableRight, y + rowHeight - 1);
      
      y += rowHeight;
    });
    
    return pageNum;
  }

  exportAnalyticsToPDF(doc: jsPDF, yPos: number, pageWidth: number, pageHeight: number): number {
    let y = yPos;
    let pageNum = 1;
    
    y = this.drawSectionHeader(doc, 'Analytics Report', y, pageWidth);
    
    if (!this.analytics) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Analytics data not available.', pageWidth / 2, y, { align: 'center' });
      return pageNum;
    }

    const totalRevenue = this.analytics.revenueTrends?.[0]?.revenue || 0;
    const totalBookings = this.analytics.revenueTrends?.[0]?.bookings || 0;
    const confirmationRate = this.getConfirmationRate();
    
    // Key metrics cards - centered
    const cardWidth = 80;
    const cardHeight = 25;
    const cardGap = 10;
    const totalCardsWidth = (cardWidth * 2) + cardGap;
    let cardX = (pageWidth - totalCardsWidth) / 2;
    let cardY = y;
    
    this.drawMetricCard(doc, 'Total Revenue', this.formatCurrency(totalRevenue), cardX, cardY, cardWidth, cardHeight);
    cardX += cardWidth + cardGap;
    this.drawMetricCard(doc, 'Total Bookings', totalBookings.toString(), cardX, cardY, cardWidth, cardHeight);
    cardY += cardHeight + 10;
    cardX = (pageWidth - totalCardsWidth) / 2;
    this.drawMetricCard(doc, 'New Users', this.getTotalNewUsers().toString(), cardX, cardY, cardWidth, cardHeight);
    cardX += cardWidth + cardGap;
    this.drawMetricCard(doc, 'Confirmation Rate', `${confirmationRate}%`, cardX, cardY, cardWidth, cardHeight);
    
    y = cardY + cardHeight + 20;

    // Add Revenue Trends Chart
    if (this.revenueChart && this.revenueChartRef) {
      try {
        const chartImage = this.revenueChart.toBase64Image();
        const chartWidth = pageWidth - 40;
        const chartHeight = 60;
        
        if (y + chartHeight > pageHeight - 30) {
          doc.addPage();
          pageNum++;
          y = 60;
          this.drawPDFHeader(doc, pageWidth, 'analytics');
        }
        
        // Chart title
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text('Revenue Trends', pageWidth / 2, y, { align: 'center' });
        y += 8;
        
        // Add chart image
        doc.addImage(chartImage, 'PNG', 20, y, chartWidth, chartHeight);
        y += chartHeight + 15;
      } catch (e) {
        console.error('Error adding revenue chart to PDF:', e);
      }
    }

    // Add Bookings by Travel Mode Chart (Pie Chart)
    if (this.modeChart && this.modeChartRef) {
      try {
        const chartImage = this.modeChart.toBase64Image();
        const chartWidth = pageWidth - 40;
        const chartHeight = 60;
        
        if (y + chartHeight > pageHeight - 30) {
          doc.addPage();
          pageNum++;
          y = 60;
          this.drawPDFHeader(doc, pageWidth, 'analytics');
        }
        
        // Chart title
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text('Bookings by Travel Mode', pageWidth / 2, y, { align: 'center' });
        y += 8;
        
        // Add chart image
        doc.addImage(chartImage, 'PNG', 20, y, chartWidth, chartHeight);
        y += chartHeight + 15;
      } catch (e) {
        console.error('Error adding mode chart to PDF:', e);
      }
    }

    // Add Revenue Trends Data Table
    if (this.analytics.revenueTrends && this.analytics.revenueTrends.length > 0) {
      if (y > pageHeight - 50) {
        doc.addPage();
        pageNum++;
        y = 60;
        this.drawPDFHeader(doc, pageWidth, 'analytics');
      }
      
      y = this.drawSectionHeader(doc, 'Revenue Trends Data', y, pageWidth);
      
      const tableWidth = 150;
      const tableLeft = (pageWidth - tableWidth) / 2;
      const tableRight = tableLeft + tableWidth;
      const rowHeight = 7;
      const headerHeight = 7;
      
      // Table header
      doc.setFillColor(59, 130, 246);
      doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Month', tableLeft + 5, y + 5);
      doc.text('Revenue', tableLeft + 60, y + 5);
      doc.text('Bookings', tableLeft + 110, y + 5);
      
      y += headerHeight;
      
      this.analytics.revenueTrends.slice(0, 12).forEach((trend: any, index: number) => {
        if (y > pageHeight - 30) {
          doc.addPage();
          pageNum++;
          y = 60;
          this.drawPDFHeader(doc, pageWidth, 'analytics');
          doc.setFillColor(59, 130, 246);
          doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text('Month', tableLeft + 5, y + 5);
          doc.text('Revenue', tableLeft + 60, y + 5);
          doc.text('Bookings', tableLeft + 110, y + 5);
          y += headerHeight;
        }
        
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(tableLeft, y - 1, tableWidth, rowHeight, 'F');
        }
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(31, 41, 55);
        doc.text((trend.month || 'N/A').substring(0, 15), tableLeft + 5, y + 5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(34, 197, 94);
        doc.text(this.formatCurrency(trend.revenue || 0), tableLeft + 60, y + 5);
        doc.setTextColor(59, 130, 246);
        doc.text((trend.bookings || 0).toString(), tableLeft + 110, y + 5);
        
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.line(tableLeft, y + rowHeight - 1, tableRight, y + rowHeight - 1);
        
        y += rowHeight;
      });
    }

    // Add Top Routes Table
    if (this.analytics.topRoutes && this.analytics.topRoutes.length > 0) {
      if (y > pageHeight - 50) {
        doc.addPage();
        pageNum++;
        y = 60;
        this.drawPDFHeader(doc, pageWidth, 'analytics');
      }
      
      y += 10;
      y = this.drawSectionHeader(doc, 'Top Routes', y, pageWidth);
      
      const tableWidth = 150;
      const tableLeft = (pageWidth - tableWidth) / 2;
      const tableRight = tableLeft + tableWidth;
      const rowHeight = 7;
      const headerHeight = 7;
      
      // Table header
      doc.setFillColor(59, 130, 246);
      doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Route', tableLeft + 5, y + 5);
      doc.text('Bookings', tableLeft + 80, y + 5);
      doc.text('Revenue', tableLeft + 110, y + 5);
      
      y += headerHeight;
      
      this.analytics.topRoutes.slice(0, 10).forEach((route: any, index: number) => {
        if (y > pageHeight - 30) {
          doc.addPage();
          pageNum++;
          y = 60;
          this.drawPDFHeader(doc, pageWidth, 'analytics');
          doc.setFillColor(59, 130, 246);
          doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text('Route', tableLeft + 5, y + 5);
          doc.text('Bookings', tableLeft + 80, y + 5);
          doc.text('Revenue', tableLeft + 110, y + 5);
          y += headerHeight;
        }
        
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(tableLeft, y - 1, tableWidth, rowHeight, 'F');
        }
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(31, 41, 55);
        doc.text((route.route || 'N/A').substring(0, 25), tableLeft + 5, y + 5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text((route.bookings || 0).toString(), tableLeft + 80, y + 5);
        doc.setTextColor(34, 197, 94);
        doc.text(this.formatCurrency(route.revenue || 0), tableLeft + 110, y + 5);
        
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.line(tableLeft, y + rowHeight - 1, tableRight, y + rowHeight - 1);
        
        y += rowHeight;
      });
    }
    
    return pageNum;
  }

  exportRoutesToPDF(doc: jsPDF, yPos: number, pageWidth: number, pageHeight: number): number {
    let y = yPos;
    let pageNum = 1;
    
    const routes = this.getFilteredRoutes();
    if (routes.length === 0) {
      y = this.drawSectionHeader(doc, 'Routes Report', y, pageWidth);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('No routes found.', pageWidth / 2, y, { align: 'center' });
      return pageNum;
    }

    y = this.drawSectionHeader(doc, `Routes Report (${routes.length} total)`, y, pageWidth);
    
    // Table configuration - centered
    const tableWidth = 170;
    const tableLeft = (pageWidth - tableWidth) / 2;
    const tableRight = tableLeft + tableWidth;
    const rowHeight = 8;
    const headerHeight = 8;
    
    // Column positions
    const colRoute = tableLeft + 3;
    const colMode = tableLeft + 75;
    const colOperator = tableLeft + 105;
    const colPrice = tableLeft + 145;
    const colDuration = tableLeft + 160;
    
    // Table header
    doc.setFillColor(59, 130, 246);
    doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Route', colRoute, y + 6);
    doc.text('Mode', colMode, y + 6);
    doc.text('Operator', colOperator, y + 6);
    doc.text('Price', colPrice, y + 6);
    doc.text('Duration', colDuration, y + 6);
    
    y += headerHeight;
    
    routes.forEach((route, index) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        pageNum++;
        y = 60;
        this.drawPDFHeader(doc, pageWidth, 'routes');
        doc.setFillColor(59, 130, 246);
        doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Route', colRoute, y + 6);
        doc.text('Mode', colMode, y + 6);
        doc.text('Operator', colOperator, y + 6);
        doc.text('Price', colPrice, y + 6);
        doc.text('Duration', colDuration, y + 6);
        y += headerHeight;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(tableLeft, y - 2, tableWidth, rowHeight, 'F');
      }
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      doc.text(`${route.fromCity} → ${route.toCity}`.substring(0, 25), colRoute, y + 5);
      doc.text((route.travelMode || 'N/A').toUpperCase(), colMode, y + 5);
      doc.text((route.operator || 'N/A').substring(0, 18), colOperator, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
      doc.text(this.formatCurrency(route.price), colPrice, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text(route.duration || 'N/A', colDuration, y + 5);
      
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(tableLeft, y + rowHeight - 1, tableRight, y + rowHeight - 1);
      
      y += rowHeight;
    });
    
    return pageNum;
  }

  exportFieldsToPDF(doc: jsPDF, yPos: number, pageWidth: number, pageHeight: number): number {
    let y = yPos;
    let pageNum = 1;
    
    const fields = this.getFilteredFields();
    if (fields.length === 0) {
      y = this.drawSectionHeader(doc, 'Fields Report', y, pageWidth);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('No fields found.', pageWidth / 2, y, { align: 'center' });
      return pageNum;
    }

    y = this.drawSectionHeader(doc, `Fields Report (${fields.length} total)`, y, pageWidth);
    
    // Table configuration - centered
    const tableWidth = 170;
    const tableLeft = (pageWidth - tableWidth) / 2;
    const tableRight = tableLeft + tableWidth;
    const rowHeight = 8;
    const headerHeight = 8;
    
    // Column positions
    const colFieldName = tableLeft + 3;
    const colLabel = tableLeft + 60;
    const colType = tableLeft + 110;
    const colMode = tableLeft + 130;
    const colRequired = tableLeft + 145;
    const colActive = tableLeft + 160;
    
    // Table header
    doc.setFillColor(59, 130, 246);
    doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Field', colFieldName, y + 6);
    doc.text('Label', colLabel, y + 6);
    doc.text('Type', colType, y + 6);
    doc.text('Mode', colMode, y + 6);
    doc.text('Req', colRequired, y + 6);
    doc.text('Active', colActive, y + 6);
    
    y += headerHeight;
    
    fields.forEach((field, index) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        pageNum++;
        y = 60;
        this.drawPDFHeader(doc, pageWidth, 'fields');
        doc.setFillColor(59, 130, 246);
        doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Field', colFieldName, y + 6);
        doc.text('Label', colLabel, y + 6);
        doc.text('Type', colType, y + 6);
        doc.text('Mode', colMode, y + 6);
        doc.text('Req', colRequired, y + 6);
        doc.text('Active', colActive, y + 6);
        y += headerHeight;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(tableLeft, y - 2, tableWidth, rowHeight, 'F');
      }
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      doc.text((field.name || 'N/A').substring(0, 20), colFieldName, y + 5);
      doc.text((field.label || 'N/A').substring(0, 20), colLabel, y + 5);
      doc.text(field.type || 'N/A', colType, y + 5);
      doc.text((field.travelMode || 'N/A').toUpperCase(), colMode, y + 5);
      
      const requiredColor = field.required ? [34, 197, 94] : [107, 114, 128];
      doc.setFillColor(requiredColor[0], requiredColor[1], requiredColor[2]);
      doc.rect(colRequired, y, 12, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(field.required ? 'YES' : 'NO', colRequired + 6, y + 4.5, { align: 'center' });
      
      const activeColor = field.isActive ? [34, 197, 94] : [220, 38, 38];
      doc.setFillColor(activeColor[0], activeColor[1], activeColor[2]);
      doc.rect(colActive, y, 12, 6, 'F');
      doc.text(field.isActive ? 'YES' : 'NO', colActive + 6, y + 4.5, { align: 'center' });
      
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(tableLeft, y + rowHeight - 1, tableRight, y + rowHeight - 1);
      
      y += rowHeight;
    });
    
    return pageNum;
  }

  exportCoinsToPDF(doc: jsPDF, yPos: number, pageWidth: number, pageHeight: number): number {
    let y = yPos;
    let pageNum = 1;
    
    const coins = this.getFilteredCoins();
    if (coins.length === 0) {
      y = this.drawSectionHeader(doc, 'Coin Packages Report', y, pageWidth);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('No coin packages found.', pageWidth / 2, y, { align: 'center' });
      return pageNum;
    }

    y = this.drawSectionHeader(doc, `Coin Packages Report (${coins.length} total)`, y, pageWidth);
    
    // Table configuration - centered
    const tableWidth = 170;
    const tableLeft = (pageWidth - tableWidth) / 2;
    const tableRight = tableLeft + tableWidth;
    const rowHeight = 8;
    const headerHeight = 8;
    
    // Column positions
    const colName = tableLeft + 3;
    const colCoins = tableLeft + 70;
    const colPrice = tableLeft + 95;
    const colType = tableLeft + 130;
    const colDiscount = tableLeft + 150;
    const colStatus = tableLeft + 165;
    
    // Table header
    doc.setFillColor(59, 130, 246);
    doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Package', colName, y + 6);
    doc.text('Coins', colCoins, y + 6);
    doc.text('Price', colPrice, y + 6);
    doc.text('Type', colType, y + 6);
    doc.text('Disc', colDiscount, y + 6);
    doc.text('Status', colStatus, y + 6);
    
    y += headerHeight;
    
    coins.forEach((coin, index) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        pageNum++;
        y = 60;
        this.drawPDFHeader(doc, pageWidth, 'coins');
        doc.setFillColor(59, 130, 246);
        doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Package', colName, y + 6);
        doc.text('Coins', colCoins, y + 6);
        doc.text('Price', colPrice, y + 6);
        doc.text('Type', colType, y + 6);
        doc.text('Disc', colDiscount, y + 6);
        doc.text('Status', colStatus, y + 6);
        y += headerHeight;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(tableLeft, y - 2, tableWidth, rowHeight, 'F');
      }
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      doc.text((coin.name || 'N/A').substring(0, 25), colName, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(251, 191, 36);
      doc.text(coin.amount?.toString() || '0', colCoins, y + 5);
      doc.setTextColor(34, 197, 94);
      doc.text(this.formatCurrency(coin.price), colPrice, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text((coin.type || 'N/A').toUpperCase(), colType, y + 5);
      doc.text(`${coin.discount || 0}%`, colDiscount, y + 5);
      
      const statusColor = coin.isActive ? [34, 197, 94] : [220, 38, 38];
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.rect(colStatus, y, 12, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      const statusText = coin.isActive ? 'ACTIVE' : 'INACTIVE';
      doc.text(statusText, colStatus + 6, y + 4.5, { align: 'center' });
      
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(tableLeft, y + rowHeight - 1, tableRight, y + rowHeight - 1);
      
      y += rowHeight;
    });
    
    return pageNum;
  }

  exportEnquiriesToPDF(doc: jsPDF, yPos: number, pageWidth: number, pageHeight: number): number {
    let y = yPos;
    let pageNum = 1;
    
    const enquiries = this.filteredEnquiries;
    if (enquiries.length === 0) {
      y = this.drawSectionHeader(doc, 'Enquiries Report', y, pageWidth);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('No enquiries found.', pageWidth / 2, y, { align: 'center' });
      return pageNum;
    }

    y = this.drawSectionHeader(doc, `Enquiries Report (${enquiries.length} total)`, y, pageWidth);
    
    // Table configuration - centered
    const tableWidth = 170;
    const tableLeft = (pageWidth - tableWidth) / 2;
    const tableRight = tableLeft + tableWidth;
    const rowHeight = 8;
    const headerHeight = 8;
    
    // Column positions
    const colId = tableLeft + 3;
    const colName = tableLeft + 25;
    const colEmail = tableLeft + 70;
    const colSubject = tableLeft + 120;
    const colStatus = tableLeft + 160;
    
    // Table header
    doc.setFillColor(59, 130, 246);
    doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('ID', colId, y + 6);
    doc.text('Name', colName, y + 6);
    doc.text('Email', colEmail, y + 6);
    doc.text('Subject', colSubject, y + 6);
    doc.text('Status', colStatus, y + 6);
    
    y += headerHeight;
    
    enquiries.forEach((enquiry, index) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        pageNum++;
        y = 60;
        this.drawPDFHeader(doc, pageWidth, 'enquiries');
        doc.setFillColor(59, 130, 246);
        doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('ID', colId, y + 6);
        doc.text('Name', colName, y + 6);
        doc.text('Email', colEmail, y + 6);
        doc.text('Subject', colSubject, y + 6);
        doc.text('Status', colStatus, y + 6);
        y += headerHeight;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(tableLeft, y - 2, tableWidth, rowHeight, 'F');
      }
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      doc.text(enquiry.id?.toString() || 'N/A', colId, y + 5);
      doc.text((enquiry.name || 'N/A').substring(0, 20), colName, y + 5);
      doc.text((enquiry.email || 'N/A').substring(0, 25), colEmail, y + 5);
      doc.text((enquiry.subject || 'N/A').substring(0, 20), colSubject, y + 5);
      
      const status = (enquiry.status || 'Pending').toLowerCase();
      const statusColor = status === 'solved' || status === 'resolved' ? [34, 197, 94] : [251, 191, 36];
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.rect(colStatus, y, 12, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      const statusText = (enquiry.status || 'Pending').toUpperCase().substring(0, 8);
      doc.text(statusText, colStatus + 6, y + 4.5, { align: 'center' });
      
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(tableLeft, y + rowHeight - 1, tableRight, y + rowHeight - 1);
      
      y += rowHeight;
    });
    
    return pageNum;
  }

  exportSettingsToPDF(doc: jsPDF, yPos: number, pageWidth: number, pageHeight: number): number {
    let y = yPos;
    let pageNum = 1;

    y = this.drawSectionHeader(doc, 'System Settings Report', y, pageWidth);

    // Table configuration - centered
    const tableWidth = 170;
    const tableLeft = (pageWidth - tableWidth) / 2;
    const tableRight = tableLeft + tableWidth;
    const rowHeight = 8;
    const headerHeight = 8;

    // Table header
    doc.setFillColor(59, 130, 246);
    doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Setting', tableLeft + 5, y + 6);
    doc.text('Value', tableLeft + 120, y + 6);

    y += headerHeight;

    const settingsData = [
      ['Coin Rate (%)', this.settings.coinRate.toString()],
      ['Max Bookings Per User', this.settings.maxBookingsPerUser.toString()],
      ['Max Coins Per User', this.settings.maxCoinsPerUser.toString()],
      ['Student Discount (%)', this.settings.studentDiscount.toString()],
      ['Senior Discount (%)', this.settings.seniorDiscount.toString()],
      ['Student Coins Required', this.settings.studentCoinsRequired.toString()],
      ['Senior Coins Required', this.settings.seniorCoinsRequired.toString()],
      ['Cancellation Hours', this.settings.bookingCancellationHours.toString()],
      ['Refund Processing Days', this.settings.refundProcessingDays.toString()],
      ['Email Notifications', this.settings.emailNotifications ? 'Enabled' : 'Disabled'],
      ['SMS Notifications', this.settings.smsNotifications ? 'Enabled' : 'Disabled'],
      ['Maintenance Mode', this.settings.maintenanceMode ? 'Enabled' : 'Disabled'],
      ['Site Name', this.settings.siteName],
      ['Support Email', this.settings.supportEmail],
      ['Support Phone', this.settings.supportPhone]
    ];

    settingsData.forEach((row, index) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        pageNum++;
        y = 60;
        this.drawPDFHeader(doc, pageWidth, 'settings');
        doc.setFillColor(59, 130, 246);
        doc.rect(tableLeft, y, tableWidth, headerHeight, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Setting', tableLeft + 5, y + 6);
        doc.text('Value', tableLeft + 120, y + 6);
        y += headerHeight;
      }

      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(tableLeft, y - 2, tableWidth, rowHeight, 'F');
      }

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      doc.text(row[0].substring(0, 40), tableLeft + 5, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.text(row[1].substring(0, 30), tableLeft + 120, y + 5);

      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(tableLeft, y + rowHeight - 1, tableRight, y + rowHeight - 1);

      y += rowHeight;
    });

    return pageNum;
  }

  exportToCSV(tab: string) {
    try {
      let csvContent = '';
      let filename = '';

      switch (tab) {
        case 'overview':
          csvContent = this.generateOverviewCSV();
          filename = `GoTrip_Overview_Report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'bookings':
          csvContent = this.generateBookingsCSV();
          filename = `GoTrip_Bookings_Report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'users':
          csvContent = this.generateUsersCSV();
          filename = `GoTrip_Users_Report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'analytics':
          csvContent = this.generateAnalyticsCSV();
          filename = `GoTrip_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'routes':
          csvContent = this.generateRoutesCSV();
          filename = `GoTrip_Routes_Report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'fields':
          csvContent = this.generateFieldsCSV();
          filename = `GoTrip_Fields_Report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'coins':
          csvContent = this.generateCoinsCSV();
          filename = `GoTrip_Coins_Report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'enquiries':
          csvContent = this.generateEnquiriesCSV();
          filename = `GoTrip_Enquiries_Report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'settings':
          csvContent = this.generateSettingsCSV();
          filename = `GoTrip_Settings_Report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        default:
          this.toast.error('Invalid tab for export');
          return;
      }

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.toast.success('CSV report generated successfully!');
    } catch (error) {
      console.error('Error generating CSV:', error);
      this.toast.error('Failed to generate CSV report');
    }
  }

  generateOverviewCSV(): string {
    const rows = [
      ['GoTrip Admin Dashboard - Overview Report'],
      ['Generated', new Date().toLocaleString()],
      [],
      ['Metric', 'Value'],
      ['Total Users', this.stats.totalUsers.toString()],
      ['Total Bookings', this.stats.totalBookings.toString()],
      ['Total Revenue', this.formatCurrency(this.stats.totalRevenue)],
      ['Total Coins', this.stats.totalCoins.toString()],
      ['Monthly Revenue', this.formatCurrency(this.stats.monthlyRevenue)],
      ['Quarterly Revenue', this.formatCurrency(this.stats.quarterlyRevenue)],
      ['Yearly Revenue', this.formatCurrency(this.stats.yearlyRevenue)],
      ['Monthly Loss', this.formatCurrency(this.stats.monthlyLoss)],
      ['Quarterly Loss', this.formatCurrency(this.stats.quarterlyLoss)],
      ['Yearly Loss', this.formatCurrency(this.stats.yearlyLoss)]
    ];
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  generateBookingsCSV(): string {
    const bookings = this.filteredBookings;
    const rows = [
      ['Booking ID', 'User Name', 'User Email', 'From City', 'To City', 'Travel Mode', 'Operator', 'Travel Date', 'Price', 'Status']
    ];
    bookings.forEach(booking => {
      rows.push([
        booking.bookingId || `GT-${booking.id}`,
        booking.userName || '',
        booking.userEmail || '',
        booking.fromCity || '',
        booking.toCity || '',
        booking.travelMode || '',
        booking.operator || '',
        booking.travelDate || '',
        booking.price?.toString() || '0',
        booking.status || ''
      ]);
    });
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  generateUsersCSV(): string {
    const users = this.filteredUsers;
    const rows = [
      ['Name', 'Email', 'Coins', 'Total Bookings', 'Created At']
    ];
    users.forEach(user => {
      rows.push([
        user.name || '',
        user.email || '',
        user.coins?.toString() || '0',
        (user.totalBookings || 0).toString(),
        user.createdAt || ''
      ]);
    });
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  generateAnalyticsCSV(): string {
    const rows = [
      ['GoTrip Analytics Report'],
      ['Generated', new Date().toLocaleString()],
      []
    ];
    if (this.analytics) {
      rows.push(['Metric', 'Value']);
      const totalRevenue = this.analytics.revenueTrends?.[0]?.revenue || 0;
      const totalBookings = this.analytics.revenueTrends?.[0]?.bookings || 0;
      rows.push(['Total Revenue', this.formatCurrency(totalRevenue)]);
      rows.push(['Total Bookings', totalBookings.toString()]);
      rows.push(['Confirmation Rate', `${this.getConfirmationRate()}%`]);
    }
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  generateRoutesCSV(): string {
    const routes = this.getFilteredRoutes();
    const rows = [
      ['From City', 'To City', 'Travel Mode', 'Operator', 'Price', 'Duration', 'Departure Time', 'Arrival Time', 'Active']
    ];
    routes.forEach(route => {
      rows.push([
        route.fromCity || '',
        route.toCity || '',
        route.travelMode || '',
        route.operator || '',
        route.price?.toString() || '0',
        route.duration || '',
        route.departureTime || '',
        route.arrivalTime || '',
        route.isActive ? 'Yes' : 'No'
      ]);
    });
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  generateFieldsCSV(): string {
    const fields = this.getFilteredFields();
    const rows = [
      ['Field Name', 'Label', 'Type', 'Travel Mode', 'Required', 'Active', 'Order', 'Placeholder']
    ];
    fields.forEach(field => {
      rows.push([
        field.name || '',
        field.label || '',
        field.type || '',
        field.travelMode || '',
        field.required ? 'Yes' : 'No',
        field.isActive ? 'Yes' : 'No',
        field.order?.toString() || '0',
        field.placeholder || ''
      ]);
    });
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  generateCoinsCSV(): string {
    const coins = this.getFilteredCoins();
    const rows = [
      ['Name', 'Amount', 'Price', 'Type', 'Discount', 'Active', 'Popular', 'Sales']
    ];
    coins.forEach(coin => {
      rows.push([
        coin.name || '',
        coin.amount?.toString() || '0',
        coin.price?.toString() || '0',
        coin.type || '',
        (coin.discount || 0).toString(),
        coin.isActive ? 'Yes' : 'No',
        coin.isPopular ? 'Yes' : 'No',
        (coin.sales || 0).toString()
      ]);
    });
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  generateEnquiriesCSV(): string {
    const enquiries = this.filteredEnquiries;
    const rows = [
      ['ID', 'Name', 'Email', 'Subject', 'Status']
    ];
    enquiries.forEach(enquiry => {
      rows.push([
        enquiry.id?.toString() || '',
        enquiry.name || '',
        enquiry.email || '',
        enquiry.subject || '',
        enquiry.status || 'Pending'
      ]);
    });
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  generateSettingsCSV(): string {
    const rows = [
      ['GoTrip System Settings Report'],
      ['Generated', new Date().toLocaleString()],
      [],
      ['Setting', 'Value'],
      ['Coin Rate (%)', this.settings.coinRate.toString()],
      ['Max Bookings Per User', this.settings.maxBookingsPerUser.toString()],
      ['Max Coins Per User', this.settings.maxCoinsPerUser.toString()],
      ['Student Discount (%)', this.settings.studentDiscount.toString()],
      ['Senior Discount (%)', this.settings.seniorDiscount.toString()],
      ['Student Coins Required', this.settings.studentCoinsRequired.toString()],
      ['Senior Coins Required', this.settings.seniorCoinsRequired.toString()],
      ['Booking Cancellation Hours', this.settings.bookingCancellationHours.toString()],
      ['Refund Processing Days', this.settings.refundProcessingDays.toString()],
      ['Email Notifications', this.settings.emailNotifications ? 'Enabled' : 'Disabled'],
      ['SMS Notifications', this.settings.smsNotifications ? 'Enabled' : 'Disabled'],
      ['Maintenance Mode', this.settings.maintenanceMode ? 'Enabled' : 'Disabled'],
      ['Site Name', this.settings.siteName],
      ['Support Email', this.settings.supportEmail],
      ['Support Phone', this.settings.supportPhone]
    ];
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  loadSettings(): void {
    this.settingsLoading = true;
    // In a real app, this would fetch from backend
    // For now, we'll use localStorage or default values
    const savedSettings = localStorage.getItem('gotrip_settings');
    if (savedSettings) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
    this.settingsLoading = false;
  }

  saveSettings(): void {
    this.settingsSaving = true;
    // In a real app, this would save to backend
    // For now, we'll save to localStorage
    try {
      localStorage.setItem('gotrip_settings', JSON.stringify(this.settings));
      this.toast.success('Settings saved successfully!');
      // In production, make API call:
      // this.http.put('http://localhost:5000/api/admin/settings', this.settings).subscribe({
      //   next: () => this.toast.success('Settings saved successfully!'),
      //   error: () => this.toast.error('Failed to save settings')
      // });
    } catch (e) {
      console.error('Error saving settings:', e);
      this.toast.error('Failed to save settings');
    } finally {
      this.settingsSaving = false;
    }
  }

  resetSettings(): void {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      this.settings = {
        coinRate: 5,
        maxBookingsPerUser: 10,
        maxCoinsPerUser: 1000,
        studentDiscount: 15,
        seniorDiscount: 20,
        studentCoinsRequired: 50,
        seniorCoinsRequired: 100,
        bookingCancellationHours: 24,
        refundProcessingDays: 7,
        emailNotifications: true,
        smsNotifications: false,
        maintenanceMode: false,
        siteName: 'GoTrip',
        siteDescription: 'Your gateway to amazing journeys across India',
        supportEmail: 'support@gotrip.com',
        supportPhone: '+91-1234567890',
        razorpayKeyId: '',
        razorpayKeySecret: '',
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: ''
      };
      localStorage.removeItem('gotrip_settings');
      this.toast.info('Settings reset to default values');
    }
  }
}
