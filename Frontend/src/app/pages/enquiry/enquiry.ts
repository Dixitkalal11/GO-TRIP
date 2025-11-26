import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { ValidationService } from '../../services/validation.service';
import { FormErrorComponent } from '../../components/form-error/form-error.component';

@Component({
  selector: 'app-enquiry',
  standalone: true,
  imports: [CommonModule, FormsModule, FormErrorComponent],
  templateUrl: './enquiry.html',
  styleUrls: ['./enquiry.css']
})
export class EnquiryComponent {
  submitting: boolean = false;
  form = { name: '', email: '', phone: '', subject: '', message: '', category: '', referenceId: '' };

  @ViewChild('enquiryForm') enquiryForm!: NgForm;

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private toast: ToastService,
    public validationService: ValidationService
  ) {}

  submit() {
    if (this.submitting) return;
    
    // Validate form
    if (this.enquiryForm && this.enquiryForm.invalid) {
      this.toast.warning('Please fill all required fields correctly');
      if (this.enquiryForm) {
        const formElement = document.querySelector('.enquiry-form');
        if (formElement) {
          this.validationService.focusFirstInvalid(this.enquiryForm, formElement as HTMLElement);
        }
      }
      return;
    }

    // Validate email
    if (this.form.email && !this.validationService.emailCheck(this.form.email)) {
      this.toast.warning('Please enter a valid email address');
      return;
    }

    // Validate phone if provided
    if (this.form.phone && !this.validationService.mobileCheck(this.form.phone)) {
      this.toast.warning('Please enter a valid 10-digit mobile number');
      return;
    }

    this.submitting = true;

    const token = localStorage.getItem('token');
    this.http.post('http://localhost:5000/api/enquiries', this.form, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }).subscribe({
      next: (res: any) => {
        this.toast.success(res?.message || 'Enquiry sent successfully');
        this.form = { name: '', email: '', phone: '', subject: '', message: '', category: '', referenceId: '' };
        this.router.navigate(['/']);
      },
      error: (e) => {
        this.toast.error(e?.error?.error || 'Failed to send enquiry');
      }
    }).add(() => this.submitting = false);
  }

  onPhoneBlur() {
    if (this.form.phone) {
      this.form.phone = this.validationService.trim(this.form.phone);
      this.form.phone = this.form.phone.replace(/\D/g, '');
    }
  }
}


