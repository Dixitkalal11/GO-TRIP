import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
	id: number;
	type: ToastType;
	title?: string;
	message: string;
	durationMs: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
	private messages: ToastMessage[] = [];
	private subject = new BehaviorSubject<ToastMessage[]>([]);
	public readonly toasts$ = this.subject.asObservable();
	private idSeq = 1;

	show(message: string, type: ToastType = 'info', title?: string, durationMs = 3000) {
		const toast: ToastMessage = { id: this.idSeq++, type, title, message, durationMs };
		this.messages = [...this.messages, toast];
		this.subject.next(this.messages);
		setTimeout(() => this.dismiss(toast.id), durationMs);
	}

	success(message: string, title = 'Success', durationMs = 3000) { this.show(message, 'success', title, durationMs); }
	error(message: string, title = 'Error', durationMs = 4000) { this.show(message, 'error', title, durationMs); }
	info(message: string, title = 'Info', durationMs = 3000) { this.show(message, 'info', title, durationMs); }
	warning(message: string, title = 'Warning', durationMs = 3500) { this.show(message, 'warning', title, durationMs); }

	dismiss(id: number) {
		this.messages = this.messages.filter(t => t.id !== id);
		this.subject.next(this.messages);
	}
}


