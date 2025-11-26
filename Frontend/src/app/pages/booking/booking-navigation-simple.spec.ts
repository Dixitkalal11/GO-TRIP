/**
 * Simple Booking Navigation Test Suite
 * Tests back button functionality and state persistence
 */

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { BusBookingComponent } from './bus-booking/bus-booking';
import { TrainBookingComponent } from './train-booking/train-booking';
import { PlaneBookingComponent } from './plane-booking/plane-booking';

import { BookingDataService } from '../../services/booking-data.service';
import { DiscountCoinsService } from '../../services/discount-coins.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { ValidationService } from '../../services/validation.service';

describe('Booking Navigation - Simple Tests', () => {
  let router: Router;
  
  beforeEach(() => {
    const bookingDataSpy = jasmine.createSpyObj('BookingDataService', ['setBookingData']);
    const discountCoinsSpy = jasmine.createSpyObj('DiscountCoinsService', [
      'getDiscountConfigs', 'getSelectedDiscountType', 'getUserCoins', 
      'getUserBookingStats', 'selectDiscountType', 'canUseDiscountType', 'getCurrentCoinsEarned'
    ]);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'warning', 'info']);
    const authSpy = jasmine.createSpyObj('AuthService', ['restoreUser']);
    const validationSpy = jasmine.createSpyObj('ValidationService', [
      'trim', 'mobileCheck', 'emailCheck', 'removeExtraSpaces', 'focusFirstInvalid'
    ]);

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
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('Bus Booking', () => {
    let component: BusBookingComponent;
    let fixture: ComponentFixture<BusBookingComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(BusBookingComponent);
      component = fixture.componentInstance;
    });

    it('should save busOptions in state', () => {
      component.busOptions = [
        { id: 1, operator: 'Test', type: 'AC', price: 1000, rating: 4.5, reviews: 100, 
          departure: 'Mumbai', arrival: 'Delhi', duration: '8h', amenities: [], seatsLeft: 20 }
      ];
      component.saveBookingState();
      const state = JSON.parse(sessionStorage.getItem('busBookingState') || '{}');
      expect(state.busOptions).toBeDefined();
      expect(state.busOptions.length).toBe(1);
    });

    it('should restore busOptions from state', () => {
      const mockState = {
        busOptions: [
          { id: 1, operator: 'Test', type: 'AC', price: 1000, rating: 4.5, reviews: 100, 
            departure: 'Mumbai', arrival: 'Delhi', duration: '8h', amenities: [], seatsLeft: 20 }
        ],
        showResults: true
      };
      sessionStorage.setItem('busBookingState', JSON.stringify(mockState));
      sessionStorage.setItem('_bookingPageActive', 'true');
      component.ngOnInit();
      expect(component.busOptions.length).toBe(1);
    });

    it('should set showResults true when selecting bus', () => {
      const mockBus = {
        id: 1, operator: 'Test', type: 'AC', price: 1000, rating: 4.5, reviews: 100, 
        departure: 'Mumbai', arrival: 'Delhi', duration: '8h', amenities: [], seatsLeft: 20
      };
      component.isLoggedIn = true;
      component.busOptions = [mockBus];
      component.selectBus(mockBus);
      expect(component.showResults).toBe(true);
    });

    it('should clear selectedBus when going back from Step 3 to Step 2', () => {
      const mockBus = {
        id: 1, operator: 'Test', type: 'AC', price: 1000, rating: 4.5, reviews: 100, 
        departure: 'Mumbai', arrival: 'Delhi', duration: '8h', amenities: [], seatsLeft: 20
      };
      component.selectedBus = mockBus;
      component.showResults = true;
      component.busOptions = [mockBus];
      component.goBackToSearch();
      expect(component.selectedBus).toBeNull();
      expect(component.showResults).toBe(true);
    });

    it('should preserve form values when going back from Step 2 to Step 1', () => {
      component.fromCity = 'Mumbai';
      component.toCity = 'Delhi';
      component.travelDate = '2025-12-01';
      component.showResults = true;
      component.busOptions = [
        { id: 1, operator: 'Test', type: 'AC', price: 1000, rating: 4.5, reviews: 100, 
          departure: 'Mumbai', arrival: 'Delhi', duration: '8h', amenities: [], seatsLeft: 20 }
      ];
      component.goBackToSearchForm();
      expect(component.showResults).toBe(false);
      expect(component.fromCity).toBe('Mumbai');
      expect(component.toCity).toBe('Delhi');
      expect(component.travelDate).toBe('2025-12-01');
    });

    it('should reset form when coming from outside booking pages', () => {
      sessionStorage.removeItem('_bookingPageActive');
      component.fromCity = 'Mumbai';
      component.toCity = 'Delhi';
      component.travelDate = '2025-12-01';
      component.ngOnInit();
      expect(component.fromCity).toBe('');
      expect(component.toCity).toBe('');
      expect(component.travelDate).toBe('');
    });
  });

  describe('Train Booking', () => {
    let component: TrainBookingComponent;
    let fixture: ComponentFixture<TrainBookingComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(TrainBookingComponent);
      component = fixture.componentInstance;
    });

    it('should save trainOptions in state', () => {
      component.trainOptions = [
        { id: 1, trainNumber: 'T1', type: 'Express', classType: 'AC', price: 1000, 
          rating: 4.5, reviews: 100, departure: 'Mumbai', arrival: 'Delhi', 
          duration: '8h', amenities: [], seatsLeft: 20, operator: 'IRCTC' }
      ];
      component.saveBookingState();
      const state = JSON.parse(sessionStorage.getItem('trainBookingState') || '{}');
      expect(state.trainOptions).toBeDefined();
      expect(state.trainOptions.length).toBe(1);
    });

    it('should restore trainOptions from state', () => {
      const mockState = {
        trainOptions: [
          { id: 1, trainNumber: 'T1', type: 'Express', classType: 'AC', price: 1000, 
            rating: 4.5, reviews: 100, departure: 'Mumbai', arrival: 'Delhi', 
            duration: '8h', amenities: [], seatsLeft: 20, operator: 'IRCTC' }
        ],
        showResults: true
      };
      sessionStorage.setItem('trainBookingState', JSON.stringify(mockState));
      sessionStorage.setItem('_bookingPageActive', 'true');
      component.ngOnInit();
      expect(component.trainOptions.length).toBe(1);
    });

    it('should set showResults true when selecting train', () => {
      const mockTrain = {
        id: 1, trainNumber: 'T1', type: 'Express', classType: 'AC', price: 1000, 
        rating: 4.5, reviews: 100, departure: 'Mumbai', arrival: 'Delhi', 
        duration: '8h', amenities: [], seatsLeft: 20, operator: 'IRCTC'
      };
      component.isLoggedIn = true;
      component.trainOptions = [mockTrain];
      component.selectTrain(mockTrain);
      expect(component.showResults).toBe(true);
    });

    it('should clear selectedTrain when going back from Step 3 to Step 2', () => {
      const mockTrain = {
        id: 1, trainNumber: 'T1', type: 'Express', classType: 'AC', price: 1000, 
        rating: 4.5, reviews: 100, departure: 'Mumbai', arrival: 'Delhi', 
        duration: '8h', amenities: [], seatsLeft: 20, operator: 'IRCTC'
      };
      component.selectedTrain = mockTrain;
      component.showResults = true;
      component.trainOptions = [mockTrain];
      component.goBackToSearch();
      expect(component.selectedTrain).toBeNull();
      expect(component.showResults).toBe(true);
    });

    it('should preserve form values when going back from Step 2 to Step 1', () => {
      component.fromCity = 'Mumbai';
      component.toCity = 'Delhi';
      component.travelDate = '2025-12-01';
      component.showResults = true;
      component.trainOptions = [
        { id: 1, trainNumber: 'T1', type: 'Express', classType: 'AC', price: 1000, 
          rating: 4.5, reviews: 100, departure: 'Mumbai', arrival: 'Delhi', 
          duration: '8h', amenities: [], seatsLeft: 20, operator: 'IRCTC' }
      ];
      component.goBackToSearchForm();
      expect(component.showResults).toBe(false);
      expect(component.fromCity).toBe('Mumbai');
      expect(component.toCity).toBe('Delhi');
      expect(component.travelDate).toBe('2025-12-01');
    });

    it('should reset form when coming from outside booking pages', () => {
      sessionStorage.removeItem('_bookingPageActive');
      component.fromCity = 'Mumbai';
      component.toCity = 'Delhi';
      component.travelDate = '2025-12-01';
      component.ngOnInit();
      expect(component.fromCity).toBe('');
      expect(component.toCity).toBe('');
      expect(component.travelDate).toBe('');
    });
  });

  describe('Flight Booking', () => {
    let component: PlaneBookingComponent;
    let fixture: ComponentFixture<PlaneBookingComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(PlaneBookingComponent);
      component = fixture.componentInstance;
    });

    it('should save flightOptions in state', () => {
      component.flightOptions = [
        { id: '1', operator: 'Test', flightNumber: 'TA123', aircraftType: 'Boeing', 
          price: 5000, departureTime: '10:00', arrivalTime: '12:00', duration: '2h', 
          classType: 'Economy', amenities: [], stops: 0, baggage: '15kg', 
          cancellationPolicy: 'Free', rating: 4.5, reviews: 100, seatsLeft: 10 }
      ];
      component.saveBookingState();
      const state = JSON.parse(sessionStorage.getItem('planeBookingState') || '{}');
      expect(state.flightOptions).toBeDefined();
      expect(state.flightOptions.length).toBe(1);
    });

    it('should restore flightOptions from state', () => {
      const mockState = {
        flightOptions: [
          { id: '1', operator: 'Test', flightNumber: 'TA123', aircraftType: 'Boeing', 
            price: 5000, departureTime: '10:00', arrivalTime: '12:00', duration: '2h', 
            classType: 'Economy', amenities: [], stops: 0, baggage: '15kg', 
            cancellationPolicy: 'Free', rating: 4.5, reviews: 100, seatsLeft: 10 }
        ],
        showResults: true
      };
      sessionStorage.setItem('planeBookingState', JSON.stringify(mockState));
      sessionStorage.setItem('_bookingPageActive', 'true');
      component.ngOnInit();
      expect(component.flightOptions.length).toBe(1);
    });

    it('should set showResults true when selecting flight', () => {
      const mockFlight = {
        id: '1', operator: 'Test', flightNumber: 'TA123', aircraftType: 'Boeing', 
        price: 5000, departureTime: '10:00', arrivalTime: '12:00', duration: '2h', 
        classType: 'Economy', amenities: [], stops: 0, baggage: '15kg', 
        cancellationPolicy: 'Free', rating: 4.5, reviews: 100, seatsLeft: 10
      };
      component.isLoggedIn = true;
      component.flightOptions = [mockFlight];
      component.selectFlight(mockFlight);
      expect(component.showResults).toBe(true);
    });

    it('should clear selectedFlight when going back from Step 3 to Step 2', () => {
      const mockFlight = {
        id: '1', operator: 'Test', flightNumber: 'TA123', aircraftType: 'Boeing', 
        price: 5000, departureTime: '10:00', arrivalTime: '12:00', duration: '2h', 
        classType: 'Economy', amenities: [], stops: 0, baggage: '15kg', 
        cancellationPolicy: 'Free', rating: 4.5, reviews: 100, seatsLeft: 10
      };
      component.selectedFlight = mockFlight;
      component.showResults = true;
      component.flightOptions = [mockFlight];
      component.goBackToSearch();
      expect(component.selectedFlight).toBeNull();
      expect(component.showResults).toBe(true);
    });

    it('should preserve form values when going back from Step 2 to Step 1', () => {
      component.fromCity = 'Mumbai';
      component.toCity = 'Delhi';
      component.travelDate = '2025-12-01';
      component.showResults = true;
      component.flightOptions = [
        { id: '1', operator: 'Test', flightNumber: 'TA123', aircraftType: 'Boeing', 
          price: 5000, departureTime: '10:00', arrivalTime: '12:00', duration: '2h', 
          classType: 'Economy', amenities: [], stops: 0, baggage: '15kg', 
          cancellationPolicy: 'Free', rating: 4.5, reviews: 100, seatsLeft: 10 }
      ];
      component.goBackToSearchForm();
      expect(component.showResults).toBe(false);
      expect(component.fromCity).toBe('Mumbai');
      expect(component.toCity).toBe('Delhi');
      expect(component.travelDate).toBe('2025-12-01');
    });

    it('should reset form when coming from outside booking pages', () => {
      sessionStorage.removeItem('_bookingPageActive');
      component.fromCity = 'Mumbai';
      component.toCity = 'Delhi';
      component.travelDate = '2025-12-01';
      component.ngOnInit();
      expect(component.fromCity).toBe('');
      expect(component.toCity).toBe('');
      expect(component.travelDate).toBe('');
    });
  });
});

