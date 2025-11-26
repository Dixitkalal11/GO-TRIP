import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { ValidationService } from '../../services/validation.service';
import { FormErrorComponent } from '../../components/form-error/form-error.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FormErrorComponent],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class ContactComponent {
  submitting: boolean = false;
  form = { name: '', email: '', phone: '', subject: '', message: '' };

  contactInfo = {
    address: '123 Travel Street, Ahmedabad, Gujarat 380001, India',
    phone: '+91 1800-123-4567',
    email: 'support@gotrip.com',
    hours: 'Monday - Sunday: 24/7 Support'
  };

  socialLinks = [
    { name: 'Facebook', icon: 'bi-facebook', url: 'https://facebook.com/gotrip', color: '#1877f2' },
    { name: 'Twitter', icon: 'bi-twitter', url: 'https://twitter.com/gotrip', color: '#1da1f2' },
    { name: 'Instagram', icon: 'bi-instagram', url: 'https://instagram.com/gotrip', color: '#e4405f' },
    { name: 'LinkedIn', icon: 'bi-linkedin', url: 'https://linkedin.com/company/gotrip', color: '#0077b5' },
    { name: 'YouTube', icon: 'bi-youtube', url: 'https://youtube.com/gotrip', color: '#ff0000' }
  ];

  quickActions = [
    { label: 'Call Us', icon: 'bi-telephone-fill', action: () => window.open(`tel:${this.contactInfo.phone}`), color: '#10b981' },
    { label: 'Email Us', icon: 'bi-envelope-fill', action: () => window.open(`mailto:${this.contactInfo.email}`), color: '#3b82f6' },
    { label: 'Live Chat', icon: 'bi-chat-dots-fill', action: () => this.openChat(), color: '#8b5cf6' },
    { label: 'Send Enquiry', icon: 'bi-question-circle-fill', action: () => this.router.navigate(['/enquiry']), color: '#f59e0b' }
  ];

  faqs = [
    {
      question: 'How can I track my booking?',
      answer: 'You can track your booking by logging into your account and visiting the "My Bookings" section. You\'ll receive email updates about your booking status.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets. All payments are secure and encrypted.'
    },
    {
      question: 'Can I cancel or modify my booking?',
      answer: 'Yes, you can cancel or modify your booking from the "My Bookings" section. Cancellation policies vary by transport type. Please check our Cancellation Policy for details.'
    },
    {
      question: 'How do I earn GoTrip Coins?',
      answer: 'You earn 2% of your booking amount as coins (max 50 coins per booking). You can also earn bonus coins on your first few bookings. Check our Coins Policy for more details.'
    },
    {
      question: 'Is my personal information safe?',
      answer: 'Absolutely! We use bank-level encryption to protect your data. We never store your card details. Your information is only used for booking purposes. See our Privacy Policy for details.'
    }
  ];

  @ViewChild('contactForm') contactForm!: NgForm;

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private toast: ToastService,
    public validationService: ValidationService
  ) {}

  submit() {
    if (this.submitting) return;
    
    // Validate form
    if (this.contactForm && this.contactForm.invalid) {
      this.toast.warning('Please fill all required fields correctly');
      if (this.contactForm) {
        const formElement = document.querySelector('.contact-form');
        if (formElement) {
          this.validationService.focusFirstInvalid(this.contactForm, formElement as HTMLElement);
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
    this.http.post('http://localhost:5000/api/contact', this.form, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }).subscribe({
      next: (res: any) => {
        this.toast.success(res?.message || 'Message sent successfully! We will get back to you soon.');
        this.form = { name: '', email: '', phone: '', subject: '', message: '' };
      },
      error: (e) => {
        this.toast.error(e?.error?.error || 'Failed to send message. Please try again.');
      }
    }).add(() => this.submitting = false);
  }

  openPhone() {
    window.open(`tel:${this.contactInfo.phone}`, '_self');
  }

  openEmail() {
    window.open(`mailto:${this.contactInfo.email}`, '_self');
  }

  openChat() {
    // Trigger chatbot if available
    const chatbotToggle = document.querySelector('.chatbot-toggle') as HTMLElement;
    if (chatbotToggle) {
      chatbotToggle.click();
    } else {
      this.toast.info('Chat support is available. Look for the chat icon in the bottom right corner.');
    }
  }
}

