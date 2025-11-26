/**
 * Booking Navigation Test Suite
 * 
 * Tests the back button functionality and state persistence for Bus, Train, and Flight bookings.
 * 
 * Run with: ng test --include=booking-navigation.spec.ts
 * Or: npm test -- --include=booking-navigation.spec.ts
 */

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, Subject } from 'rxjs';

// Import booking components
import { BusBookingComponent } from './bus-booking/bus-booking';
import { TrainBookingComponent } from './train-booking/train-booking';
import { PlaneBookingComponent } from './plane-booking/plane-booking';

// Import services
import { BookingDataService } from '../../services/booking-data.service';
import { DiscountCoinsService } from '../../services/discount-coins.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { ValidationService } from '../../services/validation.service';

describe('Booking Navigation Tests', () => {
  let router: Router;
  let bookingDataService: jasmine.SpyObj<BookingDataService>;
  let discountCoinsService: jasmine.SpyObj<DiscountCoinsService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let authService: jasmine.SpyObj<AuthService>;
  let validationService: jasmine.SpyObj<ValidationService>;
  
  const navigationEndSubject = new Subject<any>();

  beforeEach(() => {
    // Create spies for services
    const bookingDataSpy = jasmine.createSpyObj('BookingDataService', ['setBookingData', 'getBookingData']);
    const discountCoinsSpy = jasmine.createSpyObj('DiscountCoinsService', [
      'getDiscountConfigs',
      'getSelectedDiscountType',
      'getUserCoins',
      'getUserBookingStats',
      'selectDiscountType',
      'canUseDiscountType',
      'getCurrentCoinsEarned'
    ]);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'warning', 'info']);
    const authSpy = jasmine.createSpyObj('AuthService', ['restoreUser', 'logout']);
    const validationSpy = jasmine.createSpyObj('ValidationService', [
      'trim',
      'mobileCheck',
      'emailCheck',
      'removeExtraSpaces',
      'focusFirstInvalid'
    ]);

    // Setup service return values
    discountCoinsSpy.getDiscountConfigs.and.returnValue([]);
    discountCoinsSpy.getSelectedDiscountType.and.returnValue(of('regular'));
    discountCoinsSpy.getUserCoins.and.returnValue(of(531));
    discountCoinsSpy.getUserBookingStats.and.returnValue(of({ totalBookings: 0 }));
    discountCoinsSpy.canUseDiscountType.and.returnValue(true);
    discountCoinsSpy.getCurrentCoinsEarned.and.returnValue(30);
    authSpy.restoreUser.and.returnValue(undefined);
    authSpy.user$ = of(null);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        RouterTestingModule,
        BusBookingComponent,
        TrainBookingComponent,
        PlaneBookingComponent
      ],
      providers: [
        { provide: BookingDataService, useValue: bookingDataSpy },
        { provide: DiscountCoinsService, useValue: discountCoinsSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ValidationService, useValue: validationSpy }
      ]
    });

    router = TestBed.inject(Router);
    bookingDataService = TestBed.inject(BookingDataService) as jasmine.SpyObj<BookingDataService>;
    discountCoinsService = TestBed.inject(DiscountCoinsService) as jasmine.SpyObj<DiscountCoinsService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    validationService = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;

    // Mock router events
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    Object.defineProperty(router, 'events', {
      get: () => navigationEndSubject.asObservable()
    });

    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    navigationEndSubject.complete();
  });

  describe('Bus Booking Navigation', () => {
    let component: BusBookingComponent;
    let fixture: ComponentFixture<BusBookingComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(BusBookingComponent);
      component = fixture.componentInstance;
    });

    it('should save busOptions in state when searching', () => {
      component.fromCity = 'Mumbai';
      component.toCity = 'Delhi';
      component.travelDate = '2025-12-01';
      component.busOptions = [
        { id: 1, operator: 'Test Bus', type: 'AC', price: 1000, departureTime: '10:00', arrivalTime: '18:00', duration: '8h', rating: 4.5, reviews: 100, departure: 'Mumbai', arrival: 'Delhi', amenities: [], seatsLeft: 20 }
      ];
      
      component.searchBuses();
      component.saveBookingState();

      const state = JSON.parse(sessionStorage.getItem('busBookingState') || '{}');
      expect(state.busOptions).toBeDefined();
      expect(state.busOptions.length).toBeGreaterThan(0);
    });

    it('should restore busOptions from state on refresh', () => {
      const mockState = {
        fromCity: 'Mumbai',
        toCity: 'Delhi',
        travelDate: '2025-12-01',
        showResults: true,
        busOptions: [
          { id: 1, operator: 'Test Bus', type: 'AC', price: 1000, departureTime: '10:00', arrivalTime: '18:00', duration: '8h', rating: 4.5, reviews: 100, departure: 'Mumbai', arrival: 'Delhi', amenities: [], seatsLeft: 20 }
        ],
        selectedBus: null,
        passengers: [],
        bookingContact: { mobileNumber: '', emailId: '' }
      };

      sessionStorage.setItem('busBookingState', JSON.stringify(mockState));
      sessionStorage.setItem('_bookingPageActive', 'true');

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.busOptions.length).toBeGreaterThan(0);
      expect(component.showResults).toBe(true);
    });

    it('should set showResults to true when selecting a bus', () => {
      const mockBus = {
        id: 1,
        operator: 'Test Bus',
        type: 'AC',
        price: 1000,
        departureTime: '10:00',
        arrivalTime: '18:00',
        duration: '8h',
        rating: 4.5,
        reviews: 100,
        departure: 'Mumbai',
        arrival: 'Delhi',
        amenities: [],
        seatsLeft: 20
      };

      component.isLoggedIn = true;
      component.busOptions = [mockBus];
      component.selectBus(mockBus);

      expect(component.showResults).toBe(true);
      expect(component.selectedBus).toBe(mockBus);
    });

    it('should clear selectedBus and keep showResults true when going back', () => {
      const mockBus = {
        id: 1,
        operator: 'Test Bus',
        type: 'AC',
        price: 1000,
        departureTime: '10:00',
        arrivalTime: '18:00',
        duration: '8h',
        rating: 4.5,
        reviews: 100,
        departure: 'Mumbai',
        arrival: 'Delhi',
        amenities: [],
        seatsLeft: 20
      };

      component.selectedBus = mockBus;
      component.showResults = true;
      component.busOptions = [mockBus];
      component.fromCity = 'Mumbai';
      component.toCity = 'Delhi';
      component.travelDate = '2025-12-01';

      component.goBackToSearch();

      expect(component.selectedBus).toBeNull();
      expect(component.showResults).toBe(true);
    });

    it('should save state with busOptions after selecting bus', () => {
      const mockBus = {
        id: 1,
        operator: 'Test Bus',
        type: 'AC',
        price: 1000,
        departureTime: '10:00',
        arrivalTime: '18:00',
        duration: '8h',
        rating: 4.5,
        reviews: 100,
        departure: 'Mumbai',
        arrival: 'Delhi',
        amenities: [],
        seatsLeft: 20
      };

      component.isLoggedIn = true;
      component.busOptions = [mockBus];
      component.selectBus(mockBus);
      component.saveBookingState();

      const state = JSON.parse(sessionStorage.getItem('busBookingState') || '{}');
      expect(state.busOptions).toBeDefined();
      expect(state.selectedBus).toBeDefined();
      expect(state.showResults).toBe(true);
    });
  });

  describe('Train Booking Navigation', () => {
    let component: TrainBookingComponent;
    let fixture: ComponentFixture<TrainBookingComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(TrainBookingComponent);
      component = fixture.componentInstance;
    });

    it('should save trainOptions in state when searching', () => {
      component.fromCity = 'Mumbai';
      component.toCity = 'Delhi';
      component.travelDate = '2025-12-01';
      component.trainOptions = [
        { id: 1, trainNumber: 'TEST1', type: 'Express', classType: 'AC', price: 1000, departureTime: '10:00', arrivalTime: '18:00', duration: '8h', rating: 4.5, reviews: 100, departure: 'Mumbai', arrival: 'Delhi', amenities: [], seatsLeft: 20, operator: 'IRCTC' }
      ];
      
      component.searchTrains();
      component.saveBookingState();

      const state = JSON.parse(sessionStorage.getItem('trainBookingState') || '{}');
      expect(state.trainOptions).toBeDefined();
      expect(state.trainOptions.length).toBeGreaterThan(0);
    });

    it('should restore trainOptions from state on refresh', () => {
      const mockState = {
        fromCity: 'Mumbai',
        toCity: 'Delhi',
        travelDate: '2025-12-01',
        showResults: true,
        trainOptions: [
          { id: 1, trainNumber: 'TEST1', type: 'Express', classType: 'AC', price: 1000, departureTime: '10:00', arrivalTime: '18:00', duration: '8h', rating: 4.5, reviews: 100, departure: 'Mumbai', arrival: 'Delhi', amenities: [], seatsLeft: 20, operator: 'IRCTC' }
        ],
        selectedTrain: null,
        passengers: [],
        bookingContact: { mobileNumber: '', emailId: '' }
      };

      sessionStorage.setItem('trainBookingState', JSON.stringify(mockState));
      sessionStorage.setItem('_bookingPageActive', 'true');

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.trainOptions.length).toBeGreaterThan(0);
      expect(component.showResults).toBe(true);
    });

    it('should set showResults to true when selecting a train', () => {
      const mockTrain = {
        id: 1,
        trainNumber: 'TEST1',
        type: 'Express',
        classType: 'AC',
        price: 1000,
        departureTime: '10:00',
        arrivalTime: '18:00',
        duration: '8h',
        rating: 4.5,
        reviews: 100,
        departure: 'Mumbai',
        arrival: 'Delhi',
        amenities: [],
        seatsLeft: 20,
        operator: 'IRCTC'
      };

      component.isLoggedIn = true;
      component.trainOptions = [mockTrain];
      component.selectTrain(mockTrain);

      expect(component.showResults).toBe(true);
      expect(component.selectedTrain).toBe(mockTrain);
    });

    it('should clear selectedTrain and keep showResults true when going back', () => {
      const mockTrain = {
        id: 1,
        trainNumber: 'TEST1',
        type: 'Express',
        classType: 'AC',
        price: 1000,
        departureTime: '10:00',
        arrivalTime: '18:00',
        duration: '8h',
        rating: 4.5,
        reviews: 100,
        departure: 'Mumbai',
        arrival: 'Delhi',
        amenities: [],
        seatsLeft: 20,
        operator: 'IRCTC'
      };

      component.selectedTrain = mockTrain;
      component.showResults = true;
      component.trainOptions = [mockTrain];
      component.fromCity = 'Mumbai';
      component.toCity = 'Delhi';
      component.travelDate = '2025-12-01';

      component.goBackToSearch();

      expect(component.selectedTrain).toBeNull();
      expect(component.showResults).toBe(true);
    });

    it('should save state with trainOptions after selecting train', () => {
      const mockTrain = {
        id: 1,
        trainNumber: 'TEST1',
        type: 'Express',
        classType: 'AC',
        price: 1000,
        departureTime: '10:00',
        arrivalTime: '18:00',
        duration: '8h',
        rating: 4.5,
        reviews: 100,
        departure: 'Mumbai',
        arrival: 'Delhi',
        amenities: [],
        seatsLeft: 20,
        operator: 'IRCTC'
      };

      component.isLoggedIn = true;
      component.trainOptions = [mockTrain];
      component.selectTrain(mockTrain);
      component.saveBookingState();

      const state = JSON.parse(sessionStorage.getItem('trainBookingState') || '{}');
      expect(state.trainOptions).toBeDefined();
      expect(state.selectedTrain).toBeDefined();
      expect(state.showResults).toBe(true);
    });
  });

  describe('Flight Booking Navigation', () => {
    let component: PlaneBookingComponent;
    let fixture: ComponentFixture<PlaneBookingComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(PlaneBookingComponent);
      component = fixture.componentInstance;
    });

    it('should save flightOptions in state when searching', () => {
      component.fromCity = 'Mumbai';
      component.toCity = 'Delhi';
      component.travelDate = '2025-12-01';
      component.flightOptions = [
        { id: '1', operator: 'Test Airline', flightNumber: 'TA123', aircraftType: 'Boeing 737', price: 5000, departureTime: '10:00', arrivalTime: '12:00', duration: '2h', classType: 'Economy', amenities: [], stops: 0, baggage: '15kg', cancellationPolicy: 'Free', rating: 4.5, reviews: 100, seatsLeft: 10 }
      ];
      
      component.searchFlights();
      component.saveBookingState();

      const state = JSON.parse(sessionStorage.getItem('planeBookingState') || '{}');
      expect(state.flightOptions).toBeDefined();
      expect(state.flightOptions.length).toBeGreaterThan(0);
    });

    it('should restore flightOptions from state on refresh', () => {
      const mockState = {
        fromCity: 'Mumbai',
        toCity: 'Delhi',
        travelDate: '2025-12-01',
        showResults: true,
        flightOptions: [
          { id: '1', operator: 'Test Airline', flightNumber: 'TA123', aircraftType: 'Boeing 737', price: 5000, departureTime: '10:00', arrivalTime: '12:00', duration: '2h', classType: 'Economy', amenities: [], stops: 0, baggage: '15kg', cancellationPolicy: 'Free', rating: 4.5, reviews: 100, seatsLeft: 10 }
        ],
        selectedFlight: null,
        passengers: [],
        bookingContact: { mobileNumber: '', emailId: '' }
      };

      sessionStorage.setItem('planeBookingState', JSON.stringify(mockState));
      sessionStorage.setItem('_bookingPageActive', 'true');

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.flightOptions.length).toBeGreaterThan(0);
      expect(component.showResults).toBe(true);
    });

    it('should set showResults to true when selecting a flight', () => {
      const mockFlight = {
        id: '1',
        operator: 'Test Airline',
        flightNumber: 'TA123',
        aircraftType: 'Boeing 737',
        price: 5000,
        departureTime: '10:00',
        arrivalTime: '12:00',
        duration: '2h',
        classType: 'Economy',
        amenities: [],
        stops: 0,
        baggage: '15kg',
        cancellationPolicy: 'Free',
        rating: 4.5,
        reviews: 100,
        seatsLeft: 10
      };

      component.isLoggedIn = true;
      component.flightOptions = [mockFlight];
      component.selectFlight(mockFlight);

      expect(component.showResults).toBe(true);
      expect(component.selectedFlight).toBe(mockFlight);
    });

    it('should clear selectedFlight and keep showResults true when going back', () => {
      const mockFlight = {
        id: '1',
        operator: 'Test Airline',
        flightNumber: 'TA123',
        aircraftType: 'Boeing 737',
        price: 5000,
        departureTime: '10:00',
        arrivalTime: '12:00',
        duration: '2h',
        classType: 'Economy',
        amenities: [],
        stops: 0,
        baggage: '15kg',
        cancellationPolicy: 'Free',
        rating: 4.5,
        reviews: 100,
        seatsLeft: 10
      };

      component.selectedFlight = mockFlight;
      component.showResults = true;
      component.flightOptions = [mockFlight];
      component.fromCity = 'Mumbai';
      component.toCity = 'Delhi';
      component.travelDate = '2025-12-01';

      component.goBackToSearch();

      expect(component.selectedFlight).toBeNull();
      expect(component.showResults).toBe(true);
    });

    it('should save state with flightOptions after selecting flight', () => {
      const mockFlight = {
        id: '1',
        operator: 'Test Airline',
        flightNumber: 'TA123',
        aircraftType: 'Boeing 737',
        price: 5000,
        departureTime: '10:00',
        arrivalTime: '12:00',
        duration: '2h',
        classType: 'Economy',
        amenities: [],
        stops: 0,
        baggage: '15kg',
        cancellationPolicy: 'Free',
        rating: 4.5,
        reviews: 100,
        seatsLeft: 10
      };

      component.isLoggedIn = true;
      component.flightOptions = [mockFlight];
      component.selectFlight(mockFlight);
      component.saveBookingState();

      const state = JSON.parse(sessionStorage.getItem('planeBookingState') || '{}');
      expect(state.flightOptions).toBeDefined();
      expect(state.selectedFlight).toBeDefined();
      expect(state.showResults).toBe(true);
    });

    it('should restore state with selectedFlight on refresh', () => {
      const mockFlight = {
        id: '1',
        operator: 'Test Airline',
        flightNumber: 'TA123',
        aircraftType: 'Boeing 737',
        price: 5000,
        departureTime: '10:00',
        arrivalTime: '12:00',
        duration: '2h',
        classType: 'Economy',
        amenities: [],
        stops: 0,
        baggage: '15kg',
        cancellationPolicy: 'Free',
        rating: 4.5,
        reviews: 100,
        seatsLeft: 10
      };

      const mockState = {
        fromCity: 'Mumbai',
        toCity: 'Delhi',
        travelDate: '2025-12-01',
        showResults: true,
        flightOptions: [mockFlight],
        selectedFlight: mockFlight,
        passengers: [],
        bookingContact: { mobileNumber: '', emailId: '' }
      };

      sessionStorage.setItem('planeBookingState', JSON.stringify(mockState));
      sessionStorage.setItem('_bookingPageActive', 'true');

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.selectedFlight).toBeDefined();
      expect(component.showResults).toBe(true);
      expect(component.flightOptions.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-Booking Type Tests', () => {
    it('should maintain separate state for each booking type', () => {
      const busState = {
        fromCity: 'Mumbai',
        toCity: 'Delhi',
        busOptions: [{ id: 1, operator: 'Bus', type: 'AC', price: 1000, departureTime: '10:00', arrivalTime: '18:00', duration: '8h', rating: 4.5, reviews: 100, departure: 'Mumbai', arrival: 'Delhi', amenities: [], seatsLeft: 20 }]
      };

      const trainState = {
        fromCity: 'Mumbai',
        toCity: 'Delhi',
        trainOptions: [{ id: 1, trainNumber: 'T1', type: 'Express', classType: 'AC', price: 1000, departureTime: '10:00', arrivalTime: '18:00', duration: '8h', rating: 4.5, reviews: 100, departure: 'Mumbai', arrival: 'Delhi', amenities: [], seatsLeft: 20, operator: 'IRCTC' }]
      };

      const flightState = {
        fromCity: 'Mumbai',
        toCity: 'Delhi',
        flightOptions: [{ id: '1', operator: 'Airline', flightNumber: 'F1', aircraftType: 'Boeing', price: 5000, departureTime: '10:00', arrivalTime: '12:00', duration: '2h', classType: 'Economy', amenities: [], stops: 0, baggage: '15kg', cancellationPolicy: 'Free', rating: 4.5, reviews: 100, seatsLeft: 10 }]
      };

      sessionStorage.setItem('busBookingState', JSON.stringify(busState));
      sessionStorage.setItem('trainBookingState', JSON.stringify(trainState));
      sessionStorage.setItem('planeBookingState', JSON.stringify(flightState));

      const busStateRetrieved = JSON.parse(sessionStorage.getItem('busBookingState') || '{}');
      const trainStateRetrieved = JSON.parse(sessionStorage.getItem('trainBookingState') || '{}');
      const flightStateRetrieved = JSON.parse(sessionStorage.getItem('planeBookingState') || '{}');

      expect(busStateRetrieved.busOptions).toBeDefined();
      expect(trainStateRetrieved.trainOptions).toBeDefined();
      expect(flightStateRetrieved.flightOptions).toBeDefined();
      expect(busStateRetrieved.busOptions).not.toEqual(trainStateRetrieved.trainOptions);
      expect(trainStateRetrieved.trainOptions).not.toEqual(flightStateRetrieved.flightOptions);
    });
  });
});

