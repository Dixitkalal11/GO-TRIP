import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface DailyDeal {
  fromCity: string;
  toCity: string;
  price: number;
  originalPrice: number;
  type: 'bus' | 'train' | 'flight';
  expiresAt: Date;
}

@Component({
  selector: 'app-daily-deals-countdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daily-deals-countdown.html',
  styleUrls: ['./daily-deals-countdown.css']
})
export class DailyDealsCountdownComponent implements OnInit, OnDestroy {
  deal: DailyDeal = {
    fromCity: 'Ahmedabad',
    toCity: 'Udaipur',
    price: 299,
    originalPrice: 450,
    type: 'bus',
    expiresAt: new Date()
  };

  timeRemaining = {
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  private intervalId: any;

  constructor(private router: Router) {}

  ngOnInit() {
    // Set expiration time to end of day (23:59:59)
    const now = new Date();
    this.deal.expiresAt = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );

    // Update countdown immediately
    this.updateCountdown();

    // Update countdown every second
    this.intervalId = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  updateCountdown() {
    const now = new Date();
    const diff = this.deal.expiresAt.getTime() - now.getTime();

    if (diff <= 0) {
      // Deal expired, reset for next day
      this.deal.expiresAt = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        23,
        59,
        59
      );
      this.timeRemaining = { hours: 23, minutes: 59, seconds: 59 };
      return;
    }

    this.timeRemaining = {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  }

  formatTime(value: number): string {
    return value.toString().padStart(2, '0');
  }

  getDiscountPercentage(): number {
    return Math.round(((this.deal.originalPrice - this.deal.price) / this.deal.originalPrice) * 100);
  }

  scrollToPackages() {
    // Scroll to packages section or navigate to packages page
    const packagesSection = document.querySelector('.packages-page');
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/packages']);
    }
  }
}

