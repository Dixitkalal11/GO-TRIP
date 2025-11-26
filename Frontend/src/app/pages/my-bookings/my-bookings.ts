import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TransactionService, Transaction } from '../../services/transaction.service';
import { ToastService } from '../../services/toast.service';
import jsPDF from 'jspdf';

interface Booking {
  id: number;
  bookingId?: string; // Database bookingId (e.g., GT-1762078376742957)
  fromCity: string;
  toCity: string;
  travelDate: string;
  travelMode: string;
  operator: string;
  price: number;
  passengers: any[];
  status: string;
  createdAt: string;
  discountType?: 'regular' | 'student' | 'senior';
  departureTime?: string;
  arrivalTime?: string;
  seatNumbers?: string[];
  pnrNumber?: string;
  berthAllocated?: string[];
  classCoach?: string;
  contactNumber?: string;
  isRoundTrip?: boolean;
  returnDate?: string;
  returnTime?: string;
  returnOperator?: string;
  returnSeatNumbers?: string[];
  returnPnrNumber?: string;
  returnBerthAllocated?: string[];
  returnClassCoach?: string;
  paymentMethod?: string;
  paymentId?: string;
  // Allow snake_case from backend as well
  payment_method?: string;
  payment_id?: string;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-bookings.html',
  styleUrls: ['./my-bookings.css']
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  transactions: Transaction[] = [];
  loading: boolean = true;
  error: string = '';
  activeTab: string = 'bookings';
  searchTerm: string = '';
  dateFilter: string = '';
  typeFilter: 'all' | 'payment' | 'coin_earned' | 'coin_spent' = 'all';
  filteredTransactions: Transaction[] = [];

  // Cancel modal state
  showCancelModal: boolean = false;
  cancelTarget: any = null;
  cancelReason: string = '';
  cancelNotes: string = '';
  cancelFeePreview: number = 0;
  cancelRefundPreview: number = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    private transactionService: TransactionService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadBookings();
    this.loadTransactions();
  }

  loadBookings() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    console.log('🔍 Loading bookings with token:', token.substring(0, 20) + '...');

    this.http.get<any>('http://localhost:5000/api/bookings', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        console.log('📋 Bookings response:', response);
        this.bookings = (response.bookings || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        // Client-side augmentation: if the latest booking is missing payment fields but we
        // recently generated them, attach from localStorage so UI/PDF show the data.
        try {
          const lastPaymentId = localStorage.getItem('lastPaymentId');
          const lastPaymentMethod = localStorage.getItem('lastPaymentMethod');
          if (this.bookings.length && lastPaymentId && lastPaymentMethod) {
            const latest = this.bookings[0] as any;
            const hasFields = !!(latest.paymentId || latest.payment_id);
            const createdAt = new Date(latest.createdAt).getTime();
            const now = Date.now();
            if (!hasFields && now - createdAt < 5 * 60 * 1000) { // within 5 minutes
              latest.paymentId = lastPaymentId;
              latest.paymentMethod = lastPaymentMethod;
              console.log('🧩 Augmented latest booking with payment fields from client cache');
            }
          }
        } catch {}
        console.log('📋 Bookings loaded:', this.bookings.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading bookings:', error);
        console.error('❌ Error details:', error.error);
        if (error.status === 401) {
          console.error('Token expired or invalid, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.router.navigate(['/login']);
          return;
        }
        this.error = error.error?.error || 'Failed to load bookings';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'failed':
        return 'status-failed';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'Confirmed';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return 'Pending';
    }
  }

  getDiscountTypeText(discountType?: string): string {
    switch (discountType) {
      case 'student':
        return 'Student';
      case 'senior':
        return 'Senior Citizen';
      default:
        return 'Regular';
    }
  }

  getTransportIcon(travelMode: string): string {
    switch (travelMode.toLowerCase()) {
      case 'bus':
        return 'bi-bus-front';
      case 'train':
        return 'bi-train-front';
      case 'plane':
      case 'flight':
        return 'bi-airplane';
      default:
        return 'bi-bus-front';
    }
  }

  generateBookingId(id: number): string {
    // Generate a deterministic booking ID based on the actual booking ID
    // This ensures the same booking always gets the same display ID
    const baseId = id.toString().padStart(6, '0');
    const checksum = (id * 7 + 12345) % 10000; // Simple deterministic checksum
    return `${baseId}${checksum}`;
  }

  getJourneyTime(booking: Booking): string {
    // Generate deterministic journey times based on booking ID and travel mode
    const times = {
      'bus': ['06:00 AM - 02:00 PM', '08:00 AM - 04:00 PM', '10:00 PM - 06:00 AM'],
      'train': ['06:30 AM - 02:30 PM', '08:15 AM - 04:15 PM', '11:00 PM - 07:00 AM'],
      'flight': ['07:00 AM - 09:30 AM', '02:00 PM - 04:30 PM', '08:00 PM - 10:30 PM']
    };
    
    const modeTimes = times[booking.travelMode.toLowerCase() as keyof typeof times] || times.bus;
    // Use booking ID to deterministically select a time
    const index = booking.id % modeTimes.length;
    return modeTimes[index];
  }

  calculateCoins(price: number): number {
    // Calculate 5% of price as coins
    return Math.floor(price * 0.05);
  }

  downloadTicket(booking: Booking) {
    if (booking.status !== 'confirmed') {
      this.toast.info('Ticket can only be downloaded for confirmed bookings');
      return;
    }

    // Create a simple ticket content
    const ticketContent = this.generateTicketContent(booking);
    
    // Create and download the ticket
    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-GT-${this.generateBookingId(booking.id)}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  generateTicketContent(booking: Booking): string {
    return `
========================================
           GOTRIP TICKET
========================================

Booking ID: GT-${this.generateBookingId(booking.id)}
Operator: ${booking.operator}
Route: ${booking.fromCity} → ${booking.toCity}
Date: ${booking.travelDate}
Time: ${this.getJourneyTime(booking)}
Passengers: ${booking.passengers.length}
Total Amount: ₹${booking.price}
Status: ${booking.status.toUpperCase()}

========================================
Thank you for choosing GoTrip!
========================================
    `.trim();
  }

  loadTransactions() {
    const token = localStorage.getItem('token');
    if (!token) {
      // User not logged in, don't try to load transactions
      this.transactions = [];
      this.filteredTransactions = [];
      return;
    }

    this.transactionService.getUserTransactions().subscribe({
      next: (response) => {
        this.transactions = response.transactions || [];
        this.filteredTransactions = this.transactions;
        console.log('💳 Transactions loaded:', this.transactions.length);
      },
      error: (error) => {
        // Only log error if it's not a 401 (unauthorized) - user might not be logged in
        if (error.status !== 401) {
          console.error('❌ Error loading transactions:', error);
        }
        // Set empty arrays on error
        this.transactions = [];
        this.filteredTransactions = [];
      }
    });
  }

  filterTransactions() {
    let filtered = this.transactions;

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        transaction.type.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filter by date
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter);
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filter by type
    if (this.typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === this.typeFilter);
    }

    this.filteredTransactions = filtered;
  }

  clearFilters() {
    this.searchTerm = '';
    this.dateFilter = '';
    this.typeFilter = 'all';
    this.filteredTransactions = this.transactions;
  }

  // Helpers for cancelled tab
  getCancelledBookings(): Booking[] {
    return this.bookings.filter((b: any) => (b as any).status === 'cancelled');
  }

  hasCancelled(): boolean {
    return this.getCancelledBookings().length > 0;
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'transactions') {
      this.loadTransactions();
    }
  }

  getTransactionIcon(type: string): string {
    switch (type) {
      case 'payment':
        return 'bi-credit-card';
      case 'coin_earned':
        return 'bi-coin';
      case 'coin_spent':
        return 'bi-coin';
      case 'refund':
        return 'bi-arrow-down-circle';
      case 'fee':
        return 'bi-exclamation-octagon';
      case 'coin_refund':
        return 'bi-coin';
      case 'coin_revoke':
        return 'bi-coin';
      default:
        return 'bi-arrow-right';
    }
  }

  getTransactionColor(type: string): string {
    if (type === 'coin_earned' || type === 'refund' || type === 'coin_refund') return 'text-success';
    if (type === 'coin_spent' || type === 'payment' || type === 'fee' || type === 'coin_revoke') return 'text-danger';
    return 'text-info';
  }

  transactionAmountText(t: Transaction): string {
    switch (t.type) {
      case 'payment':
      case 'fee':
        return `-₹${t.amount}`;
      case 'refund':
        return `+₹${t.amount}`;
      case 'coin_earned':
      case 'coin_refund':
        return `+${t.amount} coins`;
      case 'coin_spent':
      case 'coin_revoke':
        return `-${t.amount} coins`;
      default:
        return `${t.amount}`;
    }
  }

  // ===== Cancel flow =====
  openCancelModal(booking: any) {
    if (!booking || booking.status !== 'confirmed') { return; }
    this.cancelTarget = booking;
    this.cancelFeePreview = Math.min(Math.round(Number(booking.price) * 0.10), 500);
    this.cancelRefundPreview = Math.max(Number(booking.price) - this.cancelFeePreview, 0);
    this.cancelReason = '';
    this.cancelNotes = '';
    this.showCancelModal = true;
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.cancelTarget = null;
    this.cancelReason = '';
    this.cancelNotes = '';
  }

  cancelBooking(bookingId: number, reason: string) {
    const token = localStorage.getItem('token');
    if (!token) { this.toast.error('Login required'); return; }
    this.http.post('http://localhost:5000/api/bookings/' + bookingId + '/cancel',
      { reason }, { headers: { 'Authorization': `Bearer ${token}` } }
    ).subscribe({
      next: (r: any) => {
        this.toast.success(r?.message || 'Booking cancelled');
        this.loadBookings();
        this.loadTransactions();
        this.closeCancelModal();
      },
      error: (e) => {
        console.error('Cancel error', e);
        this.toast.error(e?.error?.error || 'Failed to cancel booking');
      }
    });
  }

  downloadTicketPDF(booking: Booking) {
    console.log('PDF Download clicked for booking:', booking);
    
    if (booking.status !== 'confirmed') {
      this.toast.info('Ticket can only be downloaded for confirmed bookings');
      return;
    }

    try {
      console.log('Creating PDF document...');
      
      // Test if jsPDF is available
      if (typeof jsPDF === 'undefined') {
        this.toast.error('jsPDF library not loaded. Please refresh the page.');
        return;
      }
      
      const doc = new jsPDF();
      console.log('jsPDF instance created successfully');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // GoTrip Logo (using text as placeholder - you can replace with actual logo image)
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 123, 255); // Blue color
    doc.text('GoTrip', pageWidth / 2, 25, { align: 'center' });
    
    // Ticket title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0); // Black color
    doc.text('TRAVEL TICKET', pageWidth / 2, 35, { align: 'center' });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 45, pageWidth - 20, 45);

    // Ticket details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    let yPosition = 60;
    
    // Basic booking details
    const basicDetails = [
      ['Booking ID:', `GT-${this.generateBookingId(booking.id)}`],
      ['Operator:', booking.operator],
      ['Route:', `${booking.fromCity} → ${booking.toCity}`],
      ['Date:', booking.travelDate],
      ['Time:', this.getJourneyTime(booking)],
      ['Trip Type:', booking.isRoundTrip ? 'Round Trip' : 'One Way'],
      ['Discount Type:', this.getDiscountTypeText(booking.discountType)],
      ['Payment Method:', (booking as any).paymentMethod || (booking as any).payment_method || 'N/A'],
      ['Payment ID:', (booking as any).paymentId || (booking as any).payment_id || 'N/A'],
      ['Total Amount:', `₹${booking.price}`],
      ['Status:', booking.status.toUpperCase()]
    ];

    // Add return trip details if it's a round trip
    if (booking.isRoundTrip && booking.returnDate) {
      basicDetails.splice(5, 0, ['Return Date:', booking.returnDate]);
      if (booking.returnTime) {
        basicDetails.splice(6, 0, ['Return Time:', booking.returnTime]);
      }
      if (booking.returnOperator) {
        basicDetails.splice(7, 0, ['Return Operator:', booking.returnOperator]);
      }
    }

    basicDetails.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 30, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yPosition);
      yPosition += 12;
    });

    yPosition += 10;

    // Passenger details section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PASSENGER DETAILS', 30, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Helper function to parse JSON strings
    const parseJsonField = (field: any, defaultValue: any = []) => {
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch (e) {
          console.error('Error parsing field:', e);
          return defaultValue;
        }
      }
      return field || defaultValue;
    };

    // Parse passengers if it's a string
    let passengers = parseJsonField(booking.passengers, []);
    if (!Array.isArray(passengers)) {
      passengers = [];
    }

    // Parse other array fields
    const seatNumbers = parseJsonField(booking.seatNumbers, []);
    const returnSeatNumbers = parseJsonField(booking.returnSeatNumbers, []);
    const berthAllocated = parseJsonField(booking.berthAllocated, []);
    const returnBerthAllocated = parseJsonField(booking.returnBerthAllocated, []);

    // Add passenger details based on transport type
    passengers.forEach((passenger: any, index: number) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`Passenger ${index + 1}:`, 30, yPosition);
      yPosition += 8;

      // Passenger name
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${passenger.fullName || passenger.name || 'N/A'}`, 35, yPosition);
      yPosition += 8;

      // Contact number
      doc.text(`Contact: ${passenger.contactNumber || booking.contactNumber || 'N/A'}`, 35, yPosition);
      yPosition += 8;

      // Transport-specific details
      if (booking.travelMode.toLowerCase() === 'bus') {
        // Bus specific details
        const seatNumber = seatNumbers[index] || passenger.seatNumber || 'N/A';
        doc.text(`Seat Number: ${seatNumber}`, 35, yPosition);
        yPosition += 8;
      } else if (booking.travelMode.toLowerCase() === 'train') {
        // Train specific details
        doc.text(`PNR Number: ${booking.pnrNumber || passenger.pnrNumber || 'N/A'}`, 35, yPosition);
        yPosition += 8;
        const berth = berthAllocated[index] || passenger.berthAllocated || 'N/A';
        doc.text(`Berth Allocated: ${berth}`, 35, yPosition);
        yPosition += 8;
        doc.text(`Class/Coach: ${booking.classCoach || passenger.classCoach || 'N/A'}`, 35, yPosition);
        yPosition += 8;
      } else if (booking.travelMode.toLowerCase() === 'flight' || booking.travelMode.toLowerCase() === 'plane') {
        // Flight specific details
        const seatNumber = seatNumbers[index] || passenger.seatNumber || 'N/A';
        doc.text(`Seat Number: ${seatNumber}`, 35, yPosition);
        yPosition += 8;
      }

      yPosition += 5; // Space between passengers
    });

    // Add return trip passenger details if it's a round trip
    if (booking.isRoundTrip) {
      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RETURN TRIP DETAILS', 30, yPosition);
      yPosition += 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      passengers.forEach((passenger: any, index: number) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`Return Passenger ${index + 1}:`, 30, yPosition);
        yPosition += 8;

        // Passenger name
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${passenger.fullName || passenger.name || 'N/A'}`, 35, yPosition);
        yPosition += 8;

        // Contact number
        doc.text(`Contact: ${passenger.contactNumber || booking.contactNumber || 'N/A'}`, 35, yPosition);
        yPosition += 8;

        // Transport-specific return details
        if (booking.travelMode.toLowerCase() === 'bus') {
          // Bus specific details
          const returnSeatNumber = returnSeatNumbers[index] || passenger.returnSeatNumber || 'N/A';
          doc.text(`Return Seat Number: ${returnSeatNumber}`, 35, yPosition);
          yPosition += 8;
        } else if (booking.travelMode.toLowerCase() === 'train') {
          // Train specific details
          doc.text(`Return PNR Number: ${booking.returnPnrNumber || passenger.returnPnrNumber || 'N/A'}`, 35, yPosition);
          yPosition += 8;
          const returnBerth = returnBerthAllocated[index] || passenger.returnBerthAllocated || 'N/A';
          doc.text(`Return Berth Allocated: ${returnBerth}`, 35, yPosition);
          yPosition += 8;
          doc.text(`Return Class/Coach: ${booking.returnClassCoach || passenger.returnClassCoach || 'N/A'}`, 35, yPosition);
          yPosition += 8;
        } else if (booking.travelMode.toLowerCase() === 'flight' || booking.travelMode.toLowerCase() === 'plane') {
          // Flight specific details
          const returnSeatNumber = returnSeatNumbers[index] || passenger.returnSeatNumber || 'N/A';
          doc.text(`Return Seat Number: ${returnSeatNumber}`, 35, yPosition);
          yPosition += 8;
        }

        yPosition += 5; // Space between passengers
      });
    }

    // Footer
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 40, pageWidth - 20, pageHeight - 40);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for choosing GoTrip!', pageWidth / 2, pageHeight - 25, { align: 'center' });
    doc.text('For support, contact: support@gotrip.com', pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text('Safe travels!', pageWidth / 2, pageHeight - 5, { align: 'center' });

    // Download the PDF
    const fileName = `GoTrip_${booking.travelMode}_Ticket_${this.generateBookingId(booking.id)}.pdf`;
    console.log('Saving PDF with filename:', fileName);
    doc.save(fileName);
    console.log('PDF download completed successfully');
    
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.toast.error('Error generating PDF. Please try again.');
    }
  }

  sendTicketEmail(booking: Booking) {
    if (booking.status !== 'confirmed') {
      this.toast.info('Ticket can only be sent for confirmed bookings');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.toast.error('Please login again');
      this.router.navigate(['/login']);
      return;
    }

    // Use the database bookingId if available, otherwise use numeric ID
    const bookingIdentifier = booking.bookingId || booking.id.toString();
    
    console.log('📧 Sending ticket email for booking:', bookingIdentifier);
    
    this.http.post(`http://localhost:5000/api/bookings/${bookingIdentifier}/send-ticket`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        console.log('✅ Ticket email sent:', response);
        this.toast.success('Ticket sent to your email successfully!');
      },
      error: (error) => {
        console.error('❌ Error sending ticket email:', error);
        const errorMsg = error.error?.error || error.error?.message || 'Failed to send ticket email';
        const hint = error.error?.hint || '';
        this.toast.error(`${errorMsg}${hint ? '. ' + hint : ''}`);
      }
    });
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}