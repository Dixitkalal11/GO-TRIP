import { Injectable } from '@angular/core';

export interface BookingState {
  mode: string;
  from: string;
  to: string;
  departure: string;
  return?: string;
  tripType: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingStateService {
  private readonly STATE_KEY = 'pendingBookingState';

  /**
   * Save booking state before redirecting to login
   */
  saveState(state: BookingState): void {
    localStorage.setItem(this.STATE_KEY, JSON.stringify(state));
    console.log('💾 Booking state saved:', state);
  }

  /**
   * Get and clear booking state (use once after login)
   */
  restoreAndClearState(): BookingState | null {
    const stateStr = localStorage.getItem(this.STATE_KEY);
    if (!stateStr) {
      return null;
    }

    try {
      const state = JSON.parse(stateStr);
      this.clearState();
      console.log('🔄 Booking state restored and cleared:', state);
      return state;
    } catch (error) {
      console.error('Error parsing booking state:', error);
      this.clearState();
      return null;
    }
  }

  /**
   * Clear booking state
   */
  clearState(): void {
    localStorage.removeItem(this.STATE_KEY);
    console.log('🗑️ Booking state cleared');
  }

  /**
   * Check if there's a pending booking state
   */
  hasPendingState(): boolean {
    return !!localStorage.getItem(this.STATE_KEY);
  }
}

