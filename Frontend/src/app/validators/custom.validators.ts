import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';

export class CustomValidators {

  /**
   * Mobile number validator (10 digits, India format)
   */
  static mobileNumber(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (Validators.required(control)) {
        return null; // Let required validator handle empty
      }
      const value = control.value;
      if (value && !/^\d{10}$/.test(value.trim())) {
        return { 'mobileNumber': true };
      }
      return null;
    };
  }

  /**
   * No double spaces validator
   */
  static noDoubleSpaces(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value && typeof value === 'string' && /\s\s+/.test(value)) {
        return { 'noDoubleSpaces': true };
      }
      return null;
    };
  }

  /**
   * No whitespace only validator
   */
  static noWhitespaceOnly(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (typeof value === 'string' && value.trim().length === 0 && value.length > 0) {
        return { 'noWhitespaceOnly': true };
      }
      return null;
    };
  }

  /**
   * Positive number validator
   */
  static positiveNumber(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (Validators.required(control)) {
        return null;
      }
      const value = control.value;
      if (value !== null && value !== undefined && (isNaN(value) || Number(value) <= 0)) {
        return { 'positiveNumber': true };
      }
      return null;
    };
  }

  /**
   * Dropdown required validator (checks if placeholder is selected)
   */
  static dropdownRequired(placeholderValue: any = ''): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value === placeholderValue || control.value === null || control.value === undefined || control.value === '') {
        return { 'dropdownRequired': true };
      }
      return null;
    };
  }

  /**
   * Past date validator
   */
  static pastDate(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (Validators.required(control)) {
        return null;
      }
      const value = control.value;
      if (value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          return { 'pastDate': true };
        }
      }
      return null;
    };
  }

  /**
   * Return date after departure validator
   */
  static returnDateAfterDeparture(departureDateControlName: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.parent) {
        return null;
      }
      const departureDateControl = control.parent.get(departureDateControlName);
      const returnDate = control.value;
      const departureDate = departureDateControl?.value;

      if (!returnDate || !departureDate) {
        return null;
      }

      const returnDateObj = new Date(returnDate);
      const departureDateObj = new Date(departureDate);

      if (returnDateObj < departureDateObj) {
        return { 'returnDateBeforeDeparture': true };
      }
      return null;
    };
  }
}

