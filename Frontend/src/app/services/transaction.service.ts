import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Transaction {
  id: number;
  type: 'payment' | 'coin_earned' | 'coin_spent' | 'refund' | 'fee' | 'coin_refund' | 'coin_revoke';
  amount: number;
  description: string;
  date: string;
  bookingId?: number;
  status: 'success' | 'failed' | 'pending';
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getUserTransactions(): Observable<{ transactions: Transaction[] }> {
    const token = localStorage.getItem('token');
    if (!token) {
      // Return empty transactions if no token
      return of({ transactions: [] });
    }
    return this.http.get<{ transactions: Transaction[] }>(`${this.baseUrl}/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  createTransaction(transactionData: Partial<Transaction>): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.baseUrl}/transactions`, transactionData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}









