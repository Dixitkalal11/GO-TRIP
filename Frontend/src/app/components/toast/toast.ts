import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
	selector: 'app-toast-container',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './toast.html',
	styleUrls: ['./toast.css']
})
export class ToastContainerComponent {
	toasts: ToastMessage[] = [];

	constructor(private toast: ToastService) {
		this.toast.toasts$.subscribe(list => this.toasts = list);
	}

	dismiss(id: number) {
		this.toast.dismiss(id);
	}
}


