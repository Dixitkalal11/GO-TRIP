import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:5000/api'; // 🔹 Your backend

  constructor(private http: HttpClient) {}

  // Get logged in user details (for coins)
  getUserProfile(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }

  // Search buses (dummy for now)
  searchBuses(from: string, to: string, date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/booking/search`, {
      params: { type: 'bus', from, to, date }
    });
  }

  // Create booking
  createBooking(data: any, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings`, data, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }

  // Create Razorpay order
  createOrder(amount: number, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/order`, { amount }, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }

  // Verify Razorpay payment
  verifyPayment(data: any, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/verify`, data, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }
}
