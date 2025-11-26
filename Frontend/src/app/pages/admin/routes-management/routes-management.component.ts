import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../services/toast.service';

interface Route {
  id: number;
  fromCity: string;
  toCity: string;
  travelMode: string;
  operator: string;
  price: number;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-routes-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './routes-management.component.html',
  styleUrls: ['./routes-management.component.css']
})
export class RoutesManagementComponent implements OnInit {
  routes: Route[] = [];
  loading: boolean = true;
  
  // Route form properties
  showRouteForm: boolean = false;
  editingRoute: Route | null = null;
  routeForm = {
    fromCity: '',
    toCity: '',
    travelMode: 'bus',
    operator: '',
    price: 0,
    duration: '',
    departureTime: '',
    arrivalTime: '',
    isActive: true
  };

  constructor(private http: HttpClient, private toast: ToastService) {}

  ngOnInit() {
    this.loadRoutes();
  }

  loadRoutes() {
    console.log('🛣️ Loading routes...');
    this.loading = true;
    
    this.http.get<any>('http://localhost:5000/api/admin/routes').subscribe({
      next: (response: any) => {
        console.log('✅ Routes loaded:', response);
        this.routes = response.routes || [];
        console.log('📋 Routes count:', this.routes.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading routes:', error);
        this.routes = [];
        this.loading = false;
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  getRoutesByMode(mode: string): Route[] {
    return this.routes.filter(route => route.travelMode === mode);
  }

  // Route CRUD operations
  showAddRouteForm() {
    this.editingRoute = null;
    this.routeForm = {
      fromCity: '',
      toCity: '',
      travelMode: 'bus',
      operator: '',
      price: 0,
      duration: '',
      departureTime: '',
      arrivalTime: '',
      isActive: true
    };
    this.showRouteForm = true;
  }

  editRoute(route: Route) {
    this.editingRoute = route;
    this.routeForm = {
      fromCity: route.fromCity,
      toCity: route.toCity,
      travelMode: route.travelMode,
      operator: route.operator,
      price: route.price,
      duration: route.duration,
      departureTime: route.departureTime,
      arrivalTime: route.arrivalTime,
      isActive: route.isActive
    };
    this.showRouteForm = true;
  }

  saveRoute() {
    if (this.editingRoute) {
      this.updateRoute();
    } else {
      this.createRoute();
    }
  }

  createRoute() {
    this.http.post('http://localhost:5000/api/admin/routes', this.routeForm).subscribe({
      next: (response: any) => {
        console.log('Route created successfully');
        this.toast.success('Route created successfully');
        this.showRouteForm = false;
        this.loadRoutes();
      },
      error: (error) => {
        console.error('Error creating route:', error);
        this.toast.error('Error creating route. Please try again.');
      }
    });
  }

  updateRoute() {
    if (!this.editingRoute) return;
    
    this.http.put(`http://localhost:5000/api/admin/routes/${this.editingRoute.id}`, this.routeForm).subscribe({
      next: (response: any) => {
        console.log('Route updated successfully');
        this.toast.success('Route updated successfully');
        this.showRouteForm = false;
        this.loadRoutes();
      },
      error: (error) => {
        console.error('Error updating route:', error);
        this.toast.error('Error updating route. Please try again.');
      }
    });
  }

  deleteRoute(route: Route) {
    if (confirm(`Are you sure you want to delete the route ${route.fromCity} → ${route.toCity}?`)) {
      this.http.delete(`http://localhost:5000/api/admin/routes/${route.id}`).subscribe({
        next: (response: any) => {
          console.log('Route deleted successfully');
          this.toast.success('Route deleted successfully');
          this.loadRoutes();
        },
        error: (error) => {
          console.error('Error deleting route:', error);
          this.toast.error('Error deleting route. Please try again.');
        }
      });
    }
  }

  cancelRouteForm() {
    this.showRouteForm = false;
    this.editingRoute = null;
  }
}
