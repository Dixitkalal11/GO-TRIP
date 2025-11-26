import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AdminUser {
  username: string;
  name: string;
  role: 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private adminPasswords = ['frankstein', 'mahek', 'hiren', 'dixit', 'hitendra'];

  private adminSubject = new BehaviorSubject<AdminUser | null>(null);
  public admin$ = this.adminSubject.asObservable();

  constructor() {
    // Check if admin is already logged in
    this.restoreAdmin();
  }

  login(username: string, password: string): boolean {
    // Check if username is 'admin' and password is one of the 5 valid passwords
    if (username.toLowerCase() === 'admin' && 
        this.adminPasswords.includes(password.toLowerCase())) {
      
      const adminUser: AdminUser = {
        username: 'admin',
        name: 'Administrator',
        role: 'admin'
      };
      
      this.adminSubject.next(adminUser);
      localStorage.setItem('admin', JSON.stringify(adminUser));
      return true;
    }
    
    return false;
  }

  logout(): void {
    this.adminSubject.next(null);
    localStorage.removeItem('admin');
  }

  isLoggedIn(): boolean {
    return this.adminSubject.value !== null;
  }

  getCurrentAdmin(): AdminUser | null {
    return this.adminSubject.value;
  }

  private restoreAdmin(): void {
    const savedAdmin = localStorage.getItem('admin');
    if (savedAdmin) {
      try {
        const admin = JSON.parse(savedAdmin);
        this.adminSubject.next(admin);
      } catch (error) {
        localStorage.removeItem('admin');
      }
    }
  }
}
