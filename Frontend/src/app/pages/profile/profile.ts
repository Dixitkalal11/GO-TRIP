import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { UserProfileData, UserProfileService } from '../../services/user-profile.service';
import { ToastService } from '../../services/toast.service';
import { ValidationService } from '../../services/validation.service';
import { FormErrorComponent } from '../../components/form-error/form-error.component';

@Component({
	selector: 'app-user-profile',
	standalone: true,
	imports: [CommonModule, FormsModule, FormErrorComponent],
	templateUrl: 'profile.html',
	styleUrls: ['profile.css']
})
export class UserProfileComponent {
	profile: UserProfileData = {
		fullName: '',
		email: '',
		phone: '',
		dateOfBirth: '',
		gender: '',
		addressLine1: '',
		addressLine2: '',
		city: '',
		state: '',
		pincode: '',
		preferredMode: '',
		defaultFrom: '',
		defaultTo: ''
	};

	photoDataUrl: string | null = null;
	previewUrl: string | null = null;

	@ViewChild('profileForm') profileForm!: NgForm;

	constructor(
		private userProfile: UserProfileService, 
		private router: Router, 
		private toast: ToastService,
		public validationService: ValidationService
	) {
		const existing = userProfile.getProfile();
		if (existing) this.profile = { ...this.profile, ...existing };
		this.photoDataUrl = userProfile.getPhoto();
		this.previewUrl = this.photoDataUrl;
	}

	onPhoneBlur() {
		if (this.profile.phone) {
			this.profile.phone = this.validationService.trim(this.profile.phone);
			this.profile.phone = this.profile.phone.replace(/\D/g, '');
		}
	}

	saveProfile() {
		this.userProfile.saveProfile(this.profile);
		this.toast.success('Profile saved');
		this.router.navigate(['/']);
	}

	clearProfile() {
		this.userProfile.clearProfile();
		this.toast.info('Profile cleared');
	}

	onFileSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;
		const file = input.files[0];
		const reader = new FileReader();
		reader.onload = () => {
			this.previewUrl = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

applyPhoto() {
		if (this.previewUrl) {
			this.userProfile.savePhoto(this.previewUrl);
			this.photoDataUrl = this.previewUrl;
			this.toast.success('Photo updated');
		}
	}

removePhoto() {
		this.userProfile.removePhoto();
		this.photoDataUrl = null;
		this.previewUrl = null;
		this.toast.info('Photo removed');
	}

	usePhotoUrl(url: string) {
		if (!url) return;
		this.previewUrl = url;
	}
}


