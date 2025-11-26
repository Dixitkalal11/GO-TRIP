import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface TravelMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPopular?: boolean;
  image?: string;
  priceRange?: string;
  durationRange?: string;
  amenities?: string[];
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking.html',
  styleUrls: ['./booking.css']
})
export class BookingComponent implements OnInit {
  selectedMode: string = '';
  isAnimating: boolean = false;

  travelModes: TravelMode[] = [
    {
      id: 'bus',
      name: 'Bus',
      description: 'Comfortable & affordable rides',
      icon: 'bi-bus-front',
      image: 'assets/images/bus.png',
      isPopular: true,
      priceRange: '₹200 – ₹800',
      durationRange: '2–8 hours',
      amenities: ['WiFi', 'AC', 'Charging']
    },
    {
      id: 'train',
      name: 'Train',
      description: 'Fast & reliable journeys',
      icon: 'bi-train-front',
      image: 'assets/images/train.png',
      priceRange: '₹300 – ₹1200',
      durationRange: '3–12 hours',
      amenities: ['Meals', 'Berth', 'Scenic']
    },
    {
      id: 'flight',
      name: 'Flight',
      description: 'Quick & convenient travel',
      icon: 'bi-airplane',
      image: 'assets/images/flight.png',
      priceRange: '₹1500 – ₹5000',
      durationRange: '1–3 hours',
      amenities: ['Meals', 'Priority', 'Lounge']
    }
  ];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // Clear all booking states, search data, and flag when user comes to booking selection page
    sessionStorage.removeItem('busBookingState');
    sessionStorage.removeItem('trainBookingState');
    sessionStorage.removeItem('planeBookingState');
    sessionStorage.removeItem('searchData');
    sessionStorage.removeItem('_bookingPageActive');
  }

  handleButtonClick(mode: string) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    
    // Clear all booking states, search data, and flag before navigating to a specific booking page
    sessionStorage.removeItem('busBookingState');
    sessionStorage.removeItem('trainBookingState');
    sessionStorage.removeItem('planeBookingState');
    sessionStorage.removeItem('searchData');
    sessionStorage.removeItem('_bookingPageActive');
    
    // Navigate directly to the specific transport booking component
    switch (mode) {
      case 'bus':
        this.router.navigate(['/booking/bus']);
        break;
      case 'train':
        this.router.navigate(['/booking/train']);
        break;
      case 'flight':
        this.router.navigate(['/booking/plane']);
        break;
    }
    
    // After a short delay, stop animation
    setTimeout(() => {
      this.isAnimating = false;
    }, 300);
  }

  getSelectedModeName(): string {
    const mode = this.travelModes.find(m => m.id === this.selectedMode);
    return mode ? mode.name : 'Travel';
  }
}