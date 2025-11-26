import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookingDataService {
  private bookingData: any = null;

  setBookingData(data: any) {
    this.bookingData = data;
    console.log('Booking data stored in service:', data);
  }

  getBookingData() {
    console.log('Retrieving booking data from service:', this.bookingData);
    return this.bookingData;
  }

  clearBookingData() {
    this.bookingData = null;
  }
}
