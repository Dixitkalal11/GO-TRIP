import { Injectable, ElementRef } from '@angular/core';
import { NgForm, FormGroup, AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  /**
   * Trim whitespace from string
   */
  trim(value: string): string {
    return value ? value.trim() : '';
  }

  /**
   * Remove extra spaces (double spaces, etc.)
   */
  removeExtraSpaces(value: string): string {
    return value ? value.replace(/\s\s+/g, ' ').trim() : '';
  }

  /**
   * Validate email format
   */
  emailCheck(email: string): boolean {
    if (!email) return false;
    const trimmed = this.trim(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  }

  /**
   * Validate mobile number (10 digits, India format)
   */
  mobileCheck(mobile: string): boolean {
    if (!mobile) return false;
    const trimmed = this.trim(mobile);
    return /^\d{10}$/.test(trimmed);
  }

  /**
   * Focus on first invalid field in form
   */
  focusFirstInvalid(form: NgForm | FormGroup, formElement: HTMLElement): void {
    if (!form || !formElement) return;

    const controls = form instanceof FormGroup ? form.controls : form.controls;
    
    for (const key of Object.keys(controls)) {
      const control = controls[key] as AbstractControl;
      if (control && control.invalid) {
        const invalidElement = formElement.querySelector(`[name="${key}"], [formControlName="${key}"]`) as HTMLElement;
        if (invalidElement) {
          invalidElement.focus();
          invalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }
    }
  }
}

