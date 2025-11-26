import { Injectable } from '@angular/core';

export interface UserProfileData {
	fullName: string;
	email: string;
	phone?: string;
	dateOfBirth?: string;
	gender?: string;
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	state?: string;
	pincode?: string;
	preferredMode?: 'bus' | 'train' | 'plane' | '';
	defaultFrom?: string;
	defaultTo?: string;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
	private static readonly PROFILE_KEY = 'user_profile';
	private static readonly PHOTO_KEY = 'user_profile_photo';

	getProfile(): UserProfileData | null {
		try {
			const raw = localStorage.getItem(UserProfileService.PROFILE_KEY);
			return raw ? JSON.parse(raw) as UserProfileData : null;
		} catch {
			return null;
		}
	}

	saveProfile(profile: UserProfileData): void {
		localStorage.setItem(UserProfileService.PROFILE_KEY, JSON.stringify(profile));
	}

	clearProfile(): void {
		localStorage.removeItem(UserProfileService.PROFILE_KEY);
	}

	getPhoto(): string | null {
		return localStorage.getItem(UserProfileService.PHOTO_KEY);
	}

	savePhoto(dataUrl: string): void {
		localStorage.setItem(UserProfileService.PHOTO_KEY, dataUrl);
	}

	removePhoto(): void {
		localStorage.removeItem(UserProfileService.PHOTO_KEY);
	}
}


