import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-error-message" *ngIf="shouldShowError">
      <i class="bi bi-exclamation-circle-fill"></i>
      {{ errorMessage }}
    </div>
  `,
  styles: [`
    .form-error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }

    .form-error-message i {
      font-size: 1rem;
    }
  `]
})
export class FormErrorComponent {
  @Input() control!: AbstractControl | null;
  @Input() fieldName: string = 'This field';

  get shouldShowError(): boolean {
    return !!this.control && this.control.invalid && (this.control.dirty || this.control.touched);
  }

  get errorMessage(): string {
    if (!this.control || !this.control.errors) {
      return '';
    }

    if (this.control.errors['required']) {
      return `${this.fieldName} is required.`;
    }
    if (this.control.errors['email']) {
      return `Enter a valid email address.`;
    }
    if (this.control.errors['mobileNumber']) {
      return `Enter a valid 10-digit mobile number.`;
    }
    if (this.control.errors['minlength']) {
      return `${this.fieldName} must be at least ${this.control.errors['minlength'].requiredLength} characters.`;
    }
    if (this.control.errors['maxlength']) {
      return `${this.fieldName} cannot exceed ${this.control.errors['maxlength'].requiredLength} characters.`;
    }
    if (this.control.errors['pattern']) {
      return `${this.fieldName} format is invalid.`;
    }
    if (this.control.errors['positiveNumber']) {
      return `${this.fieldName} must be a positive number.`;
    }
    if (this.control.errors['min']) {
      return `${this.fieldName} must be at least ${this.control.errors['min'].min}.`;
    }
    if (this.control.errors['max']) {
      return `${this.fieldName} cannot exceed ${this.control.errors['max'].max}.`;
    }
    if (this.control.errors['noDoubleSpaces']) {
      return `${this.fieldName} cannot contain double spaces.`;
    }
    if (this.control.errors['noWhitespaceOnly']) {
      return `This field cannot be empty.`;
    }
    if (this.control.errors['dropdownRequired']) {
      return `Please select a valid ${this.fieldName}.`;
    }
    if (this.control.errors['pastDate']) {
      return `Date cannot be in the past.`;
    }
    if (this.control.errors['returnDateBeforeDeparture']) {
      return `Return date must be after departure date.`;
    }

    return `${this.fieldName} is invalid.`;
  }
}

