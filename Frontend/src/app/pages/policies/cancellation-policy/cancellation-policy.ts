import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cancellation-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cancellation-policy.html',
  styleUrls: ['./cancellation-policy.css']
})
export class CancellationPolicyComponent {
  lastUpdated = 'November 21, 2025';
}

