import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './terms-conditions.html',
  styleUrls: ['./terms-conditions.css']
})
export class TermsConditionsComponent {
  lastUpdated = 'November 21, 2025';
}

