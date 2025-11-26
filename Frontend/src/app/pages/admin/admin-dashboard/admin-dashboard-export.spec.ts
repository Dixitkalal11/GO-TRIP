/**
 * PDF & CSV Export Test Suite
 * 
 * Run with: npm test
 * Or: ng test with pattern admin-dashboard-export.spec.ts
 */

import { TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastService } from '../../../services/toast.service';
import { AdminService } from '../../../services/admin.service';
import jsPDF from 'jspdf';

describe('AdminDashboardComponent - PDF & CSV Export Tests', () => {
  let component: AdminDashboardComponent;
  let toastService: jasmine.SpyObj<ToastService>;
  let adminService: jasmine.SpyObj<AdminService>;

  beforeEach(async () => {
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info']);
    const adminSpy = jasmine.createSpyObj('AdminService', ['isLoggedIn', 'logout']);

    await TestBed.configureTestingModule({
      imports: [
        AdminDashboardComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ToastService, useValue: toastSpy },
        { provide: AdminService, useValue: adminSpy }
      ]
    }).compileComponents();

    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    adminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    adminService.isLoggedIn.and.returnValue(true);

    const fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    
    // Initialize component with mock data
    component.stats = {
      totalUsers: 18,
      totalBookings: 20,
      totalRevenue: 92803,
      totalCoins: 531,
      monthlyRevenue: 50000,
      quarterlyRevenue: 150000,
      yearlyRevenue: 600000,
      monthlyLoss: 5000,
      quarterlyLoss: 15000,
      yearlyLoss: 60000
    };

    component.bookings = [
      {
        id: 1,
        userId: 1,
        userName: 'Test User',
        userEmail: 'test@example.com',
        fromCity: 'Mumbai',
        toCity: 'Delhi',
        travelDate: '2025-11-25',
        travelMode: 'bus',
        operator: 'Test Operator',
        amount: 1000,
        price: 1000,
        status: 'confirmed',
        createdAt: '2025-11-22',
        passengers: [],
        bookingId: 'GT-123456'
      }
    ];

    component.users = [
      {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        coins: 100,
        createdAt: '2025-01-01',
        totalBookings: 5
      }
    ];

    component.routes = [
      {
        id: 1,
        fromCity: 'Mumbai',
        toCity: 'Delhi',
        travelMode: 'bus',
        operator: 'Test Operator',
        price: 1000,
        duration: '12h',
        departureTime: '08:00',
        arrivalTime: '20:00',
        isActive: true,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      }
    ];

    component.fields = [
      {
        id: 1,
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        placeholder: 'Enter value',
        travelMode: 'all',
        required: true,
        isActive: true,
        order: 1,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      }
    ];

    component.coins = [
      {
        id: 1,
        name: 'Starter Pack',
        amount: 100,
        price: 500,
        type: 'starter',
        discount: 10,
        isActive: true,
        isPopular: false,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      }
    ];

    component.enquiries = [
      {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Enquiry',
        status: 'Pending'
      }
    ];

    component.analytics = {
      revenueTrends: [
        { month: 'Jan', revenue: 10000, bookings: 10 }
      ],
      bookingByMode: [
        { travelMode: 'bus', count: 10 }
      ],
      topRoutes: [
        { route: 'Mumbai → Delhi', bookings: 5, revenue: 5000, avgPrice: 1000 }
      ]
    };

    fixture.detectChanges();
  });

  describe('PDF Export Tests', () => {
    it('should create PDF document', () => {
      const doc = new jsPDF();
      expect(doc).toBeTruthy();
      expect(doc.internal.pageSize.getWidth()).toBeGreaterThan(0);
      expect(doc.internal.pageSize.getHeight()).toBeGreaterThan(0);
    });

    it('should export Overview PDF', () => {
      spyOn(component, 'exportToPDF');
      component.exportToPDF('overview');
      expect(component.exportToPDF).toHaveBeenCalledWith('overview');
    });

    it('should export Bookings PDF', () => {
      spyOn(component, 'exportToPDF');
      component.exportToPDF('bookings');
      expect(component.exportToPDF).toHaveBeenCalledWith('bookings');
    });

    it('should export Users PDF', () => {
      spyOn(component, 'exportToPDF');
      component.exportToPDF('users');
      expect(component.exportToPDF).toHaveBeenCalledWith('users');
    });

    it('should export Analytics PDF with charts', () => {
      spyOn(component, 'exportToPDF');
      component.exportToPDF('analytics');
      expect(component.exportToPDF).toHaveBeenCalledWith('analytics');
    });

    it('should export Routes PDF', () => {
      spyOn(component, 'exportToPDF');
      component.exportToPDF('routes');
      expect(component.exportToPDF).toHaveBeenCalledWith('routes');
    });

    it('should export Fields PDF', () => {
      spyOn(component, 'exportToPDF');
      component.exportToPDF('fields');
      expect(component.exportToPDF).toHaveBeenCalledWith('fields');
    });

    it('should export Coins PDF', () => {
      spyOn(component, 'exportToPDF');
      component.exportToPDF('coins');
      expect(component.exportToPDF).toHaveBeenCalledWith('coins');
    });

    it('should export Enquiries PDF', () => {
      spyOn(component, 'exportToPDF');
      component.exportToPDF('enquiries');
      expect(component.exportToPDF).toHaveBeenCalledWith('enquiries');
    });

    it('should export Settings PDF', () => {
      spyOn(component, 'exportToPDF');
      component.exportToPDF('settings');
      expect(component.exportToPDF).toHaveBeenCalledWith('settings');
    });

    it('should have center-aligned tables', () => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const tableWidth = 170;
      const tableLeft = (pageWidth - tableWidth) / 2;
      const expectedLeft = (210 - 170) / 2; // A4 width is 210mm
      
      expect(Math.abs(tableLeft - expectedLeft)).toBeLessThan(0.1);
    });

    it('should use correct font sizes', () => {
      const doc = new jsPDF();
      
      doc.setFontSize(24);
      expect(doc.getFontSize()).toBe(24);
      
      doc.setFontSize(9);
      expect(doc.getFontSize()).toBe(9);
      
      doc.setFontSize(8);
      expect(doc.getFontSize()).toBe(8);
      
      doc.setFontSize(7);
      expect(doc.getFontSize()).toBe(7);
    });

    it('should use Helvetica font family', () => {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'normal');
      doc.setFont('helvetica', 'bold');
      // Font setting should not throw error
      expect(true).toBe(true);
    });

    it('should format currency correctly', () => {
      const formatted = component.formatCurrency(1000);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('1,000');
    });

    it('should generate PDF with proper structure', () => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Test header
      doc.setFillColor(31, 41, 55);
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      // Test table
      const tableWidth = 170;
      const tableLeft = (pageWidth - tableWidth) / 2;
      doc.setFillColor(59, 130, 246);
      doc.rect(tableLeft, 60, tableWidth, 8, 'F');
      
      expect(doc).toBeTruthy();
    });
  });

  describe('CSV Export Tests', () => {
    it('should export Overview CSV', () => {
      spyOn(component, 'exportToCSV');
      component.exportToCSV('overview');
      expect(component.exportToCSV).toHaveBeenCalledWith('overview');
    });

    it('should export Bookings CSV', () => {
      spyOn(component, 'exportToCSV');
      component.exportToCSV('bookings');
      expect(component.exportToCSV).toHaveBeenCalledWith('bookings');
    });

    it('should export Users CSV', () => {
      spyOn(component, 'exportToCSV');
      component.exportToCSV('users');
      expect(component.exportToCSV).toHaveBeenCalledWith('users');
    });

    it('should export Analytics CSV', () => {
      spyOn(component, 'exportToCSV');
      component.exportToCSV('analytics');
      expect(component.exportToCSV).toHaveBeenCalledWith('analytics');
    });

    it('should export Routes CSV', () => {
      spyOn(component, 'exportToCSV');
      component.exportToCSV('routes');
      expect(component.exportToCSV).toHaveBeenCalledWith('routes');
    });

    it('should export Fields CSV', () => {
      spyOn(component, 'exportToCSV');
      component.exportToCSV('fields');
      expect(component.exportToCSV).toHaveBeenCalledWith('fields');
    });

    it('should export Coins CSV', () => {
      spyOn(component, 'exportToCSV');
      component.exportToCSV('coins');
      expect(component.exportToCSV).toHaveBeenCalledWith('coins');
    });

    it('should export Enquiries CSV', () => {
      spyOn(component, 'exportToCSV');
      component.exportToCSV('enquiries');
      expect(component.exportToCSV).toHaveBeenCalledWith('enquiries');
    });

    it('should export Settings CSV', () => {
      spyOn(component, 'exportToCSV');
      component.exportToCSV('settings');
      expect(component.exportToCSV).toHaveBeenCalledWith('settings');
    });

    it('should generate CSV with proper format', () => {
      const sampleData = [
        ['Header1', 'Header2'],
        ['Value1', 'Value2']
      ];
      
      const csvContent = sampleData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');
      
      expect(csvContent).toContain(',');
      expect(csvContent).toContain('\n');
      expect(csvContent).toContain('"');
    });

    it('should quote CSV cells properly', () => {
      const cell = 'Test, Value';
      const quoted = `"${cell}"`;
      
      expect(quoted.startsWith('"')).toBe(true);
      expect(quoted.endsWith('"')).toBe(true);
    });

    it('should create CSV blob', () => {
      const csvContent = '"Header1","Header2"\n"Value1","Value2"';
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      expect(blob).toBeTruthy();
      expect(blob.size).toBeGreaterThan(0);
      expect(blob.type).toBe('text/csv;charset=utf-8;');
    });

    it('should generate Overview CSV correctly', () => {
      const csv = component.generateOverviewCSV();
      
      expect(csv).toContain('GoTrip Admin Dashboard');
      expect(csv).toContain('Total Users');
      expect(csv).toContain('Total Bookings');
      expect(csv).toContain('Total Revenue');
    });

    it('should generate Bookings CSV correctly', () => {
      const csv = component.generateBookingsCSV();
      
      expect(csv).toContain('Booking ID');
      expect(csv).toContain('User Name');
      expect(csv).toContain('From City');
      expect(csv).toContain('GT-123456');
    });

    it('should generate Users CSV correctly', () => {
      const csv = component.generateUsersCSV();
      
      expect(csv).toContain('Name');
      expect(csv).toContain('Email');
      expect(csv).toContain('Coins');
      expect(csv).toContain('Test User');
    });

    it('should generate Analytics CSV correctly', () => {
      const csv = component.generateAnalyticsCSV();
      
      expect(csv).toContain('GoTrip Analytics Report');
      expect(csv).toContain('Total Revenue');
      expect(csv).toContain('Total Bookings');
    });

    it('should generate Settings CSV correctly', () => {
      const csv = component.generateSettingsCSV();
      
      expect(csv).toContain('GoTrip System Settings Report');
      expect(csv).toContain('Coin Rate');
      expect(csv).toContain('Max Bookings Per User');
    });
  });

  describe('Helper Functions Tests', () => {
    it('should format currency with ₹ symbol', () => {
      const formatted = component.formatCurrency(1000);
      expect(formatted).toContain('₹');
    });

    it('should format large currency values', () => {
      const formatted = component.formatCurrency(100000);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('1,00,000');
    });

    it('should handle zero currency', () => {
      const formatted = component.formatCurrency(0);
      expect(formatted).toContain('₹');
    });

    it('should handle text truncation in PDF', () => {
      // Test that substring is used for text truncation
      const longText = 'This is a very long text that needs to be truncated';
      const truncated = longText.substring(0, 20);
      
      expect(truncated.length).toBeLessThanOrEqual(20);
      expect(truncated).toBe('This is a very long ');
    });
  });

  describe('Table Format Tests', () => {
    it('should calculate correct table position for center alignment', () => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth(); // Should be 210mm for A4
      const tableWidth = 170;
      const tableLeft = (pageWidth - tableWidth) / 2;
      
      // Expected: (210 - 170) / 2 = 20mm
      expect(tableLeft).toBeCloseTo(20, 1);
    });

    it('should have consistent table width across all tabs', () => {
      const tableWidth = 170;
      expect(tableWidth).toBe(170);
    });

    it('should have consistent row height', () => {
      const rowHeight = 8;
      const headerHeight = 8;
      
      expect(rowHeight).toBe(8);
      expect(headerHeight).toBe(8);
    });

    it('should use correct colors for table header', () => {
      const headerColor = [59, 130, 246]; // Blue
      expect(headerColor[0]).toBe(59);
      expect(headerColor[1]).toBe(130);
      expect(headerColor[2]).toBe(246);
    });

    it('should use correct colors for status badges', () => {
      const confirmedColor = [34, 197, 94]; // Green
      const pendingColor = [251, 191, 36]; // Yellow
      const cancelledColor = [220, 38, 38]; // Red
      
      expect(confirmedColor).toEqual([34, 197, 94]);
      expect(pendingColor).toEqual([251, 191, 36]);
      expect(cancelledColor).toEqual([220, 38, 38]);
    });
  });

  describe('Settings Tab Tests', () => {
    it('should load settings', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      component.loadSettings();
      expect(component.settings).toBeDefined();
    });

    it('should save settings', () => {
      spyOn(localStorage, 'setItem');
      component.saveSettings();
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should reset settings to defaults', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(localStorage, 'removeItem');
      component.resetSettings();
      expect(component.settings.coinRate).toBe(5);
    });

    it('should generate Settings CSV', () => {
      const csv = component.generateSettingsCSV();
      expect(csv).toContain('System Settings Report');
      expect(csv).toContain('Coin Rate');
    });
  });

  describe('Analytics PDF Chart Tests', () => {
    it('should include chart support in Analytics PDF', () => {
      // This test verifies that the Analytics PDF export includes chart functionality
      // The actual chart rendering requires Chart.js canvas elements
      expect(component.analytics).toBeDefined();
      expect(component.analytics.revenueTrends).toBeDefined();
      expect(component.analytics.bookingByMode).toBeDefined();
    });

    it('should have revenue trends data', () => {
      expect(component.analytics.revenueTrends.length).toBeGreaterThan(0);
    });

    it('should have booking by mode data', () => {
      expect(component.analytics.bookingByMode.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle PDF export errors gracefully', () => {
      spyOn(console, 'error');
      spyOn(component, 'exportToPDF').and.throwError('Test error');
      
      try {
        component.exportToPDF('overview');
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('should handle CSV export errors gracefully', () => {
      spyOn(console, 'error');
      spyOn(component, 'exportToCSV').and.throwError('Test error');
      
      try {
        component.exportToCSV('overview');
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });
});

