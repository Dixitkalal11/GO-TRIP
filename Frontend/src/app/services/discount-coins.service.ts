import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DiscountInfo {
  type: 'regular' | 'student' | 'senior';
  name: string;
  description: string;
  discountPercentage: number;
  baseCoinsEarned: number;
  coinsRequired: number;
  isActive: boolean;
}

export interface UserBookingStats {
  totalBookings: number;
  lastBookingDate: Date | null;
  coinsEarned: number;
}

@Injectable({
  providedIn: 'root'
})
export class DiscountCoinsService {
  private selectedDiscountType = new BehaviorSubject<'regular' | 'student' | 'senior'>('regular');
  private userCoins = new BehaviorSubject<number>(531); // Starting with 531 coins as shown in UI
  private discountHistory = new BehaviorSubject<any[]>([]);
  private userBookingStats = new BehaviorSubject<UserBookingStats>({
    totalBookings: 0,
    lastBookingDate: null,
    coinsEarned: 0
  });

  // Discount configurations
  private discountConfigs: DiscountInfo[] = [
    {
      type: 'regular',
      name: 'Regular',
      description: 'Standard pricing',
      discountPercentage: 0,
      baseCoinsEarned: 10,
      coinsRequired: 0,
      isActive: true
    },
    {
      type: 'student',
      name: 'Student',
      description: 'Extra discounts',
      discountPercentage: 15,
      baseCoinsEarned: 25,
      coinsRequired: 50,
      isActive: true
    },
    {
      type: 'senior',
      name: 'Senior Citizen',
      description: 'Up to ₹ 600 off',
      discountPercentage: 20,
      baseCoinsEarned: 30,
      coinsRequired: 100,
      isActive: true
    }
  ];

  constructor() { }

  // Get current selected discount type
  getSelectedDiscountType() {
    return this.selectedDiscountType.asObservable();
  }

  // Get current user coins
  getUserCoins() {
    return this.userCoins.asObservable();
  }

  // Get discount configurations
  getDiscountConfigs(): DiscountInfo[] {
    return this.discountConfigs;
  }

  // Select discount type
  selectDiscountType(type: 'regular' | 'student' | 'senior') {
    this.selectedDiscountType.next(type);
  }

  // Get current discount info
  getCurrentDiscountInfo(): DiscountInfo {
    const currentType = this.selectedDiscountType.value;
    return this.discountConfigs.find(config => config.type === currentType) || this.discountConfigs[0];
  }

  // Calculate discount amount
  calculateDiscount(basePrice: number): { discountedPrice: number; discountAmount: number; baseCoinsEarned: number } {
    const discountInfo = this.getCurrentDiscountInfo();
    const discountAmount = (basePrice * discountInfo.discountPercentage) / 100;
    const discountedPrice = basePrice - discountAmount;
    
    return {
      discountedPrice: Math.max(0, discountedPrice),
      discountAmount: Math.min(discountAmount, 600), // Cap at ₹600 for senior citizen
      baseCoinsEarned: discountInfo.baseCoinsEarned
    };
  }

  // Add coins to user account
  addCoins(amount: number) {
    const currentCoins = this.userCoins.value;
    this.userCoins.next(currentCoins + amount);
  }

  // Deduct coins from user account
  deductCoins(amount: number): boolean {
    const currentCoins = this.userCoins.value;
    if (currentCoins >= amount) {
      this.userCoins.next(currentCoins - amount);
      return true;
    }
    return false;
  }

  // Check if user can use discount type
  canUseDiscountType(type: 'regular' | 'student' | 'senior'): boolean {
    if (type === 'regular') return true;
    
    const config = this.discountConfigs.find(c => c.type === type);
    if (!config) return false;
    
    return this.userCoins.value >= config.coinsRequired;
  }

  // Apply discount and earn coins
  applyDiscountAndEarnCoins(basePrice: number): { 
    finalPrice: number; 
    discountAmount: number; 
    coinsEarned: number; 
    success: boolean;
    message: string;
  } {
    const discountInfo = this.getCurrentDiscountInfo();
    
    // Check if user can use this discount type
    if (!this.canUseDiscountType(discountInfo.type)) {
      return {
        finalPrice: basePrice,
        discountAmount: 0,
        coinsEarned: 0,
        success: false,
        message: `You need ${discountInfo.coinsRequired} coins to use ${discountInfo.name} discount`
      };
    }

    // Deduct required coins if not regular
    if (discountInfo.type !== 'regular') {
      const coinsDeducted = this.deductCoins(discountInfo.coinsRequired);
      if (!coinsDeducted) {
        return {
          finalPrice: basePrice,
          discountAmount: 0,
          coinsEarned: 0,
          success: false,
          message: 'Insufficient coins'
        };
      }
    }

    // Calculate discount
    const discount = this.calculateDiscount(basePrice);
    
    // Calculate progressive coins
    const currentStats = this.userBookingStats.value;
    const progressiveCoins = this.calculateProgressiveCoins(discount.baseCoinsEarned, currentStats.totalBookings);
    
    // Update booking stats
    const newStats: UserBookingStats = {
      totalBookings: currentStats.totalBookings + 1,
      lastBookingDate: new Date(),
      coinsEarned: currentStats.coinsEarned + progressiveCoins
    };
    this.userBookingStats.next(newStats);
    
    // Add earned coins
    this.addCoins(progressiveCoins);

    // Add to history
    const historyEntry = {
      type: discountInfo.type,
      basePrice,
      discountAmount: discount.discountAmount,
      finalPrice: discount.discountedPrice,
      coinsEarned: progressiveCoins,
      coinsUsed: discountInfo.coinsRequired,
      totalBookings: newStats.totalBookings,
      timestamp: new Date()
    };
    
    const currentHistory = this.discountHistory.value;
    this.discountHistory.next([historyEntry, ...currentHistory.slice(0, 9)]); // Keep last 10 entries

    return {
      finalPrice: discount.discountedPrice,
      discountAmount: discount.discountAmount,
      coinsEarned: progressiveCoins,
      success: true,
      message: `Applied ${discountInfo.name} discount! Earned ${progressiveCoins} coins (${newStats.totalBookings}${newStats.totalBookings === 1 ? 'st' : newStats.totalBookings === 2 ? 'nd' : newStats.totalBookings === 3 ? 'rd' : 'th'} booking).`
    };
  }

  // Get discount history
  getDiscountHistory() {
    return this.discountHistory.asObservable();
  }

  // Get user booking stats
  getUserBookingStats() {
    return this.userBookingStats.asObservable();
  }

  // Calculate progressive coins based on booking count
  private calculateProgressiveCoins(baseCoins: number, totalBookings: number): number {
    if (totalBookings < 3) {
      // First 3 bookings: base coins + 5
      return baseCoins + 5;
    } else {
      // After 3 bookings: base coins + 3
      return baseCoins + 3;
    }
  }

  // Get current coins earned for a discount type
  getCurrentCoinsEarned(discountType: 'regular' | 'student' | 'senior'): number {
    const stats = this.userBookingStats.value;
    const config = this.discountConfigs.find(c => c.type === discountType);
    if (!config) return 0;
    
    return this.calculateProgressiveCoins(config.baseCoinsEarned, stats.totalBookings);
  }

  // Reset to regular discount
  resetToRegular() {
    this.selectedDiscountType.next('regular');
  }
}
