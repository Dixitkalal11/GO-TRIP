import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

interface TransportOption {
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
  flightNumber?: string;
  trainNumber?: string;
}

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-results.html',
  styleUrls: ['./search-results.css']
})
export class SearchResultsComponent implements OnInit {
  searchData: any = {};
  transportType: string = 'bus';
  from: string = '';
  to: string = '';
  date: string = '';
  isLoggedIn: boolean = false;

  busOptions: TransportOption[] = [
    {
      id: 1,
      operator: 'VRL Travels',
      type: 'Sleeper',
      rating: 4.5,
      reviews: 1250,
      departure: '06:00 AM',
      arrival: '02:00 PM',
      duration: '8h 0m',
      amenities: ['AC', 'WiFi', 'Charging'],
      seatsLeft: 15,
      price: 450
    },
    {
      id: 2,
      operator: 'Neeta Volvo',
      type: 'Sleeper',
      rating: 4.3,
      reviews: 890,
      departure: '09:30 AM',
      arrival: '06:00 PM',
      duration: '8h 30m',
      amenities: ['AC', 'WiFi', 'Charging'],
      seatsLeft: 8,
      price: 550
    },
    {
      id: 3,
      operator: 'Orange Travels',
      type: 'Semi-Sleeper',
      rating: 4.7,
      reviews: 2100,
      departure: '02:00 PM',
      arrival: '10:30 PM',
      duration: '8h 30m',
      amenities: ['AC', 'Charging'],
      seatsLeft: 20,
      price: 380
    },
    {
      id: 4,
      operator: 'KPN Travels',
      type: 'Sleeper',
      rating: 4.2,
      reviews: 1650,
      departure: '11:00 PM',
      arrival: '07:30 AM',
      duration: '8h 30m',
      amenities: ['AC', 'WiFi', 'Charging', 'Blanket'],
      seatsLeft: 12,
      price: 520
    },
    {
      id: 5,
      operator: 'SRS Travels',
      type: 'Semi-Sleeper',
      rating: 4.1,
      reviews: 980,
      departure: '07:15 AM',
      arrival: '03:45 PM',
      duration: '8h 30m',
      amenities: ['AC', 'Charging'],
      seatsLeft: 25,
      price: 420
    },
    {
      id: 6,
      operator: 'Kallada Travels',
      type: 'Sleeper',
      rating: 4.4,
      reviews: 2200,
      departure: '10:30 PM',
      arrival: '07:00 AM',
      duration: '8h 30m',
      amenities: ['AC', 'WiFi', 'Charging', 'Blanket', 'Pillow'],
      seatsLeft: 6,
      price: 580
    },
    {
      id: 7,
      operator: 'Parveen Travels',
      type: 'Semi-Sleeper',
      rating: 3.9,
      reviews: 750,
      departure: '01:30 PM',
      arrival: '10:00 PM',
      duration: '8h 30m',
      amenities: ['AC'],
      seatsLeft: 30,
      price: 350
    },
    {
      id: 8,
      operator: 'Diwakar Travels',
      type: 'Sleeper',
      rating: 4.6,
      reviews: 1800,
      departure: '08:45 PM',
      arrival: '05:15 AM',
      duration: '8h 30m',
      amenities: ['AC', 'WiFi', 'Charging', 'Blanket'],
      seatsLeft: 4,
      price: 650
    },
    {
      id: 9,
      operator: 'Sharma Travels',
      type: 'Semi-Sleeper',
      rating: 4.0,
      reviews: 1200,
      departure: '05:30 AM',
      arrival: '02:00 PM',
      duration: '8h 30m',
      amenities: ['AC', 'Charging'],
      seatsLeft: 18,
      price: 400
    },
    {
      id: 10,
      operator: 'Raj Ratan Travels',
      type: 'Sleeper',
      rating: 4.3,
      reviews: 1450,
      departure: '12:15 AM',
      arrival: '08:45 AM',
      duration: '8h 30m',
      amenities: ['AC', 'WiFi', 'Charging'],
      seatsLeft: 10,
      price: 480
    },
    {
      id: 11,
      operator: 'Morning Star Travels',
      type: 'Semi-Sleeper',
      rating: 3.8,
      reviews: 650,
      departure: '03:45 PM',
      arrival: '12:15 AM',
      duration: '8h 30m',
      amenities: ['AC'],
      seatsLeft: 35,
      price: 320
    },
    {
      id: 12,
      operator: 'Royal Travels',
      type: 'Sleeper',
      rating: 4.7,
      reviews: 2500,
      departure: '09:00 PM',
      arrival: '05:30 AM',
      duration: '8h 30m',
      amenities: ['AC', 'WiFi', 'Charging', 'Blanket', 'Pillow', 'Meals'],
      seatsLeft: 2,
      price: 750
    },
    {
      id: 13,
      operator: 'Green Line Travels',
      type: 'Semi-Sleeper',
      rating: 4.1,
      reviews: 1100,
      departure: '06:30 AM',
      arrival: '03:00 PM',
      duration: '8h 30m',
      amenities: ['AC', 'Charging'],
      seatsLeft: 22,
      price: 410
    },
    {
      id: 14,
      operator: 'Blue Star Travels',
      type: 'Sleeper',
      rating: 4.4,
      reviews: 1900,
      departure: '11:30 PM',
      arrival: '08:00 AM',
      duration: '8h 30m',
      amenities: ['AC', 'WiFi', 'Charging', 'Blanket'],
      seatsLeft: 7,
      price: 540
    },
    {
      id: 15,
      operator: 'City Link Travels',
      type: 'Semi-Sleeper',
      rating: 3.7,
      reviews: 580,
      departure: '02:15 PM',
      arrival: '10:45 PM',
      duration: '8h 30m',
      amenities: ['AC'],
      seatsLeft: 28,
      price: 340
    },
    {
      id: 16,
      operator: 'Express Travels',
      type: 'Sleeper',
      rating: 4.5,
      reviews: 2100,
      departure: '07:45 PM',
      arrival: '04:15 AM',
      duration: '8h 30m',
      amenities: ['AC', 'WiFi', 'Charging', 'Blanket'],
      seatsLeft: 5,
      price: 620
    },
    {
      id: 17,
      operator: 'Comfort Travels',
      type: 'Semi-Sleeper',
      rating: 4.0,
      reviews: 1350,
      departure: '04:00 AM',
      arrival: '12:30 PM',
      duration: '8h 30m',
      amenities: ['AC', 'Charging'],
      seatsLeft: 16,
      price: 390
    },
    {
      id: 18,
      operator: 'Luxury Travels',
      type: 'Sleeper',
      rating: 4.8,
      reviews: 3200,
      departure: '10:00 PM',
      arrival: '06:30 AM',
      duration: '8h 30m',
      amenities: ['AC', 'WiFi', 'Charging', 'Blanket', 'Pillow', 'Meals', 'Entertainment'],
      seatsLeft: 1,
      price: 850
    }
  ];

  trainOptions: TransportOption[] = [
    {
      id: 1,
      operator: 'Indian Railways',
      type: 'AC 2 Tier',
      trainNumber: '12951',
      rating: 4.2,
      reviews: 1850,
      departure: '08:15 AM',
      arrival: '06:30 PM',
      duration: '10h 15m',
      amenities: ['AC', 'WiFi', 'Charging', 'Meals'],
      seatsLeft: 12,
      price: 1200
    },
    {
      id: 2,
      operator: 'Indian Railways',
      type: 'AC 3 Tier',
      trainNumber: '12952',
      rating: 4.0,
      reviews: 2100,
      departure: '11:45 PM',
      arrival: '09:20 AM',
      duration: '9h 35m',
      amenities: ['AC', 'WiFi', 'Charging'],
      seatsLeft: 25,
      price: 850
    },
    {
      id: 3,
      operator: 'Indian Railways',
      type: 'Sleeper',
      trainNumber: '12953',
      rating: 3.8,
      reviews: 3200,
      departure: '02:30 PM',
      arrival: '11:45 AM',
      duration: '21h 15m',
      amenities: ['Charging'],
      seatsLeft: 40,
      price: 450
    },
    {
      id: 4,
      operator: 'Indian Railways',
      type: 'AC 1 Tier',
      trainNumber: '12954',
      rating: 4.6,
      reviews: 1200,
      departure: '06:30 PM',
      arrival: '04:45 AM',
      duration: '10h 15m',
      amenities: ['AC', 'WiFi', 'Charging', 'Meals', 'Bedding'],
      seatsLeft: 4,
      price: 2500
    },
    {
      id: 5,
      operator: 'Indian Railways',
      type: 'AC 3 Tier',
      trainNumber: '12955',
      rating: 4.1,
      reviews: 1650,
      departure: '10:20 AM',
      arrival: '08:35 PM',
      duration: '10h 15m',
      amenities: ['AC', 'WiFi', 'Charging'],
      seatsLeft: 18,
      price: 920
    },
    {
      id: 6,
      operator: 'Indian Railways',
      type: 'AC 2 Tier',
      trainNumber: '12956',
      rating: 4.3,
      reviews: 2200,
      departure: '12:45 AM',
      arrival: '11:00 AM',
      duration: '10h 15m',
      amenities: ['AC', 'WiFi', 'Charging', 'Meals'],
      seatsLeft: 8,
      price: 1350
    },
    {
      id: 7,
      operator: 'Indian Railways',
      type: 'Sleeper',
      trainNumber: '12957',
      rating: 3.9,
      reviews: 2800,
      departure: '03:15 PM',
      arrival: '01:30 AM',
      duration: '10h 15m',
      amenities: ['Charging'],
      seatsLeft: 35,
      price: 480
    },
    {
      id: 8,
      operator: 'Indian Railways',
      type: 'AC 3 Tier',
      trainNumber: '12958',
      rating: 4.0,
      reviews: 1950,
      departure: '07:00 AM',
      arrival: '05:15 PM',
      duration: '10h 15m',
      amenities: ['AC', 'WiFi', 'Charging'],
      seatsLeft: 22,
      price: 880
    },
    {
      id: 9,
      operator: 'Indian Railways',
      type: 'AC 2 Tier',
      trainNumber: '12959',
      rating: 4.4,
      reviews: 2400,
      departure: '09:30 PM',
      arrival: '07:45 AM',
      duration: '10h 15m',
      amenities: ['AC', 'WiFi', 'Charging', 'Meals'],
      seatsLeft: 6,
      price: 1450
    },
    {
      id: 10,
      operator: 'Indian Railways',
      type: 'Sleeper',
      trainNumber: '12960',
      rating: 3.7,
      reviews: 2100,
      departure: '01:45 PM',
      arrival: '12:00 AM',
      duration: '10h 15m',
      amenities: ['Charging'],
      seatsLeft: 42,
      price: 420
    },
    {
      id: 11,
      operator: 'Indian Railways',
      type: 'AC 3 Tier',
      trainNumber: '12961',
      rating: 4.2,
      reviews: 1800,
      departure: '05:15 AM',
      arrival: '03:30 PM',
      duration: '10h 15m',
      amenities: ['AC', 'WiFi', 'Charging'],
      seatsLeft: 15,
      price: 950
    },
    {
      id: 12,
      operator: 'Indian Railways',
      type: 'AC 1 Tier',
      trainNumber: '12962',
      rating: 4.7,
      reviews: 800,
      departure: '11:00 PM',
      arrival: '09:15 AM',
      duration: '10h 15m',
      amenities: ['AC', 'WiFi', 'Charging', 'Meals', 'Bedding', 'Entertainment'],
      seatsLeft: 2,
      price: 2800
    },
    {
      id: 13,
      operator: 'Indian Railways',
      type: 'AC 2 Tier',
      trainNumber: '12963',
      rating: 4.1,
      reviews: 1750,
      departure: '04:30 PM',
      arrival: '02:45 AM',
      duration: '10h 15m',
      amenities: ['AC', 'WiFi', 'Charging', 'Meals'],
      seatsLeft: 10,
      price: 1280
    },
    {
      id: 14,
      operator: 'Indian Railways',
      type: 'Sleeper',
      trainNumber: '12964',
      rating: 3.8,
      reviews: 2500,
      departure: '08:45 AM',
      arrival: '07:00 PM',
      duration: '10h 15m',
      amenities: ['Charging'],
      seatsLeft: 38,
      price: 460
    },
    {
      id: 15,
      operator: 'Indian Railways',
      type: 'AC 3 Tier',
      trainNumber: '12965',
      rating: 4.0,
      reviews: 2000,
      departure: '02:20 PM',
      arrival: '12:35 AM',
      duration: '10h 15m',
      amenities: ['AC', 'WiFi', 'Charging'],
      seatsLeft: 20,
      price: 900
    },
    {
      id: 16,
      operator: 'Indian Railways',
      type: 'AC 2 Tier',
      trainNumber: '12966',
      rating: 4.3,
      reviews: 2100,
      departure: '06:00 AM',
      arrival: '04:15 PM',
      duration: '10h 15m',
      amenities: ['AC', 'WiFi', 'Charging', 'Meals'],
      seatsLeft: 7,
      price: 1400
    },
    {
      id: 17,
      operator: 'Indian Railways',
      type: 'Sleeper',
      trainNumber: '12967',
      rating: 3.9,
      reviews: 1900,
      departure: '10:30 PM',
      arrival: '08:45 AM',
      duration: '10h 15m',
      amenities: ['Charging'],
      seatsLeft: 33,
      price: 440
    },
    {
      id: 18,
      operator: 'Indian Railways',
      type: 'AC 3 Tier',
      trainNumber: '12968',
      rating: 4.1,
      reviews: 1600,
      departure: '12:15 PM',
      arrival: '10:30 PM',
      duration: '10h 15m',
      amenities: ['AC', 'WiFi', 'Charging'],
      seatsLeft: 16,
      price: 870
    }
  ];

  flightOptions: TransportOption[] = [
    {
      id: 1,
      operator: 'IndiGo',
      type: 'Economy',
      flightNumber: '6E-123',
      rating: 4.3,
      reviews: 2500,
      departure: '07:30 AM',
      arrival: '09:45 AM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals', 'Entertainment'],
      seatsLeft: 8,
      price: 4500
    },
    {
      id: 2,
      operator: 'Air India',
      type: 'Economy',
      flightNumber: 'AI-456',
      rating: 4.1,
      reviews: 1800,
      departure: '12:15 PM',
      arrival: '02:30 PM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals', 'Entertainment'],
      seatsLeft: 15,
      price: 5200
    },
    {
      id: 3,
      operator: 'SpiceJet',
      type: 'Economy',
      flightNumber: 'SG-789',
      rating: 4.0,
      reviews: 2200,
      departure: '06:45 PM',
      arrival: '09:00 PM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals'],
      seatsLeft: 22,
      price: 3800
    },
    {
      id: 4,
      operator: 'Vistara',
      type: 'Economy',
      flightNumber: 'UK-234',
      rating: 4.5,
      reviews: 2100,
      departure: '09:15 AM',
      arrival: '11:30 AM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals', 'Entertainment', 'Priority Boarding'],
      seatsLeft: 5,
      price: 5800
    },
    {
      id: 5,
      operator: 'GoAir',
      type: 'Economy',
      flightNumber: 'G8-567',
      rating: 3.9,
      reviews: 1650,
      departure: '11:45 AM',
      arrival: '02:00 PM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals'],
      seatsLeft: 18,
      price: 4200
    },
    {
      id: 6,
      operator: 'Air India',
      type: 'Business',
      flightNumber: 'AI-890',
      rating: 4.7,
      reviews: 800,
      departure: '02:30 PM',
      arrival: '04:45 PM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals', 'Entertainment', 'Lounge Access', 'Priority Check-in'],
      seatsLeft: 3,
      price: 12000
    },
    {
      id: 7,
      operator: 'IndiGo',
      type: 'Economy',
      flightNumber: '6E-456',
      rating: 4.2,
      reviews: 2800,
      departure: '05:20 PM',
      arrival: '07:35 PM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals', 'Entertainment'],
      seatsLeft: 12,
      price: 4800
    },
    {
      id: 8,
      operator: 'SpiceJet',
      type: 'Economy',
      flightNumber: 'SG-123',
      rating: 3.8,
      reviews: 1900,
      departure: '08:00 AM',
      arrival: '10:15 AM',
      duration: '2h 15m',
      amenities: ['WiFi'],
      seatsLeft: 25,
      price: 3600
    },
    {
      id: 9,
      operator: 'Vistara',
      type: 'Premium Economy',
      flightNumber: 'UK-567',
      rating: 4.6,
      reviews: 1200,
      departure: '01:15 PM',
      arrival: '03:30 PM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals', 'Entertainment', 'Extra Legroom'],
      seatsLeft: 7,
      price: 7200
    },
    {
      id: 10,
      operator: 'Air India',
      type: 'Economy',
      flightNumber: 'AI-234',
      rating: 4.0,
      reviews: 2400,
      departure: '10:30 AM',
      arrival: '12:45 PM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals', 'Entertainment'],
      seatsLeft: 20,
      price: 5100
    },
    {
      id: 11,
      operator: 'IndiGo',
      type: 'Economy',
      flightNumber: '6E-789',
      rating: 4.1,
      reviews: 2200,
      departure: '03:45 PM',
      arrival: '06:00 PM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals', 'Entertainment'],
      seatsLeft: 14,
      price: 4600
    },
    {
      id: 12,
      operator: 'GoAir',
      type: 'Economy',
      flightNumber: 'G8-345',
      rating: 3.9,
      reviews: 1750,
      departure: '07:00 PM',
      arrival: '09:15 PM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals'],
      seatsLeft: 16,
      price: 4100
    },
    {
      id: 13,
      operator: 'Vistara',
      type: 'Business',
      flightNumber: 'UK-890',
      rating: 4.8,
      reviews: 600,
      departure: '11:30 AM',
      arrival: '01:45 PM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals', 'Entertainment', 'Lounge Access', 'Priority Check-in', 'Flat Bed'],
      seatsLeft: 2,
      price: 15000
    },
    {
      id: 14,
      operator: 'SpiceJet',
      type: 'Economy',
      flightNumber: 'SG-456',
      rating: 3.7,
      reviews: 2100,
      departure: '04:15 PM',
      arrival: '06:30 PM',
      duration: '2h 15m',
      amenities: ['WiFi'],
      seatsLeft: 28,
      price: 3400
    },
    {
      id: 15,
      operator: 'IndiGo',
      type: 'Economy',
      flightNumber: '6E-012',
      rating: 4.4,
      reviews: 2600,
      departure: '08:45 AM',
      arrival: '11:00 AM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals', 'Entertainment'],
      seatsLeft: 6,
      price: 4900
    },
    {
      id: 16,
      operator: 'Air India',
      type: 'Economy',
      flightNumber: 'AI-678',
      rating: 4.2,
      reviews: 1950,
      departure: '12:30 PM',
      arrival: '02:45 PM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals', 'Entertainment'],
      seatsLeft: 11,
      price: 5300
    },
    {
      id: 17,
      operator: 'Vistara',
      type: 'Economy',
      flightNumber: 'UK-123',
      rating: 4.5,
      reviews: 1800,
      departure: '06:30 PM',
      arrival: '08:45 PM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals', 'Entertainment', 'Priority Boarding'],
      seatsLeft: 9,
      price: 6000
    },
    {
      id: 18,
      operator: 'GoAir',
      type: 'Economy',
      flightNumber: 'G8-789',
      rating: 3.8,
      reviews: 1600,
      departure: '09:30 PM',
      arrival: '11:45 PM',
      duration: '2h 15m',
      amenities: ['WiFi', 'Meals'],
      seatsLeft: 19,
      price: 3900
    }
  ];

  get currentOptions(): TransportOption[] {
    switch (this.transportType) {
      case 'train':
        return this.trainOptions;
      case 'flight':
        return this.flightOptions;
      default:
        return this.busOptions;
    }
  }

  get transportIcon(): string {
    switch (this.transportType) {
      case 'train':
        return 'bi-train-front';
      case 'flight':
        return 'bi-airplane';
      default:
        return 'bi-bus-front';
    }
  }

  get resultsText(): string {
    const count = this.currentOptions.length;
    switch (this.transportType) {
      case 'train':
        return `${count} trains available`;
      case 'flight':
        return `${count} flights available`;
      default:
        return `${count} buses available`;
    }
  }

  constructor(private router: Router, private authService: AuthService, private toast: ToastService) {
    // Get search data from navigation state or query params
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.searchData = navigation.extras.state;
      this.transportType = this.searchData.transportType || 'bus';
      this.from = this.searchData.from || '';
      this.to = this.searchData.to || '';
      this.date = this.searchData.date || '';
    }
  }

  ngOnInit() {
    // Check if user is logged in
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  modifySearch() {
    this.router.navigate(['/']);
  }

  selectTransport(option: TransportOption) {
    if (!this.isLoggedIn) {
      // If not logged in, redirect to login page
      this.toast.info('Please login to continue with booking');
      this.router.navigate(['/login'], {
        state: { 
          returnUrl: '/search-results',
          selectedTransport: option,
          searchData: this.searchData 
        }
      });
    } else {
      // If logged in, go to booking page
      this.router.navigate(['/booking'], { 
        state: { 
          selectedTransport: option,
          searchData: this.searchData 
        } 
      });
    }
  }
}
