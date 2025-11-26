import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Package {
  id: number;
  type: 'bus' | 'train' | 'flight' | 'tour';
  title: string;
  fromCity: string;
  toCity: string;
  price: number;
  originalPrice?: number;
  duration: string;
  operator: string;
  departureTime: string;
  arrivalTime: string;
  amenities: string[];
  description: string;
  image?: string;
  discount?: number;
  rating?: number;
  reviews?: number;
  seatsLeft?: number;
  class?: string; // For train/flight
  isPopular?: boolean;
  isSpecial?: boolean;
}

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './packages.html',
  styleUrls: ['./packages.css']
})
export class PackagesComponent implements OnInit {
  selectedType: 'all' | 'bus' | 'train' | 'flight' | 'tour' = 'all';
  searchQuery: string = '';
  sortBy: 'price-low' | 'price-high' | 'duration' | 'rating' = 'rating';

  constructor(private router: Router, private route: ActivatedRoute) {}

  packages: Package[] = [
    // Bus Packages
    {
      id: 1,
      type: 'bus',
      title: 'Deluxe Bus Package',
      fromCity: 'Ahmedabad',
      toCity: 'Udaipur',
      price: 299,
      originalPrice: 450,
      duration: '6h 30m',
      operator: 'Gujarat State Road Transport',
      departureTime: '08:00 AM',
      arrivalTime: '02:30 PM',
      amenities: ['AC', 'WiFi', 'Charging Point', 'Reclining Seats', 'Water Bottle'],
      description: 'Comfortable AC bus with modern amenities for a pleasant journey',
      discount: 33,
      rating: 4.5,
      reviews: 234,
      seatsLeft: 12,
      isPopular: true,
      isSpecial: true,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop'
    },
    {
      id: 2,
      type: 'bus',
      title: 'Sleeper Bus Package',
      fromCity: 'Mumbai',
      toCity: 'Goa',
      price: 899,
      originalPrice: 1200,
      duration: '12h 00m',
      operator: 'Neeta Travels',
      departureTime: '08:00 PM',
      arrivalTime: '08:00 AM',
      amenities: ['AC', 'Sleeper Berth', 'WiFi', 'Blanket', 'Pillow', 'Charging Point'],
      description: 'Overnight sleeper bus with comfortable berths for long journeys',
      discount: 25,
      rating: 4.3,
      reviews: 189,
      seatsLeft: 8,
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=400&fit=crop'
    },
    {
      id: 3,
      type: 'bus',
      title: 'Luxury Bus Package',
      fromCity: 'Delhi',
      toCity: 'Manali',
      price: 1499,
      originalPrice: 2000,
      duration: '14h 00m',
      operator: 'Volvo Multi-Axle',
      departureTime: '06:00 PM',
      arrivalTime: '08:00 AM',
      amenities: ['AC', 'WiFi', 'Entertainment', 'Meals', 'Reclining Seats', 'USB Charging'],
      description: 'Premium luxury bus with entertainment and meal services',
      discount: 25,
      rating: 4.7,
      reviews: 456,
      seatsLeft: 5,
      isPopular: true
    },
    {
      id: 4,
      type: 'bus',
      title: 'Express Bus Package',
      fromCity: 'Bangalore',
      toCity: 'Chennai',
      price: 599,
      originalPrice: 750,
      duration: '5h 30m',
      operator: 'KSRTC',
      departureTime: '07:00 AM',
      arrivalTime: '12:30 PM',
      amenities: ['AC', 'WiFi', 'Charging Point', 'Reclining Seats'],
      description: 'Fast and comfortable express bus service',
      discount: 20,
      rating: 4.2,
      reviews: 312,
      seatsLeft: 20
    },
    {
      id: 5,
      type: 'bus',
      title: 'Economy Bus Package',
      fromCity: 'Pune',
      toCity: 'Nashik',
      price: 399,
      originalPrice: 500,
      duration: '4h 00m',
      operator: 'MSRTC',
      departureTime: '09:00 AM',
      arrivalTime: '01:00 PM',
      amenities: ['AC', 'Reclining Seats', 'Water Bottle'],
      description: 'Affordable bus service with basic amenities',
      discount: 20,
      rating: 3.9,
      reviews: 178,
      seatsLeft: 25
    },
    {
      id: 6,
      type: 'bus',
      title: 'Premium Bus Package',
      fromCity: 'Kolkata',
      toCity: 'Digha',
      price: 699,
      originalPrice: 900,
      duration: '3h 30m',
      operator: 'WBSTC',
      departureTime: '06:00 AM',
      arrivalTime: '09:30 AM',
      amenities: ['AC', 'WiFi', 'Charging Point', 'Reclining Seats', 'Snacks'],
      description: 'Premium bus service for coastal destinations',
      discount: 22,
      rating: 4.4,
      reviews: 267,
      seatsLeft: 15
    },

    // Train Packages
    {
      id: 7,
      type: 'train',
      title: 'AC First Class Package',
      fromCity: 'Mumbai',
      toCity: 'Delhi',
      price: 2499,
      originalPrice: 3200,
      duration: '16h 00m',
      operator: 'Rajdhani Express',
      departureTime: '04:15 PM',
      arrivalTime: '08:15 AM',
      amenities: ['AC', 'Meals', 'Bedding', 'WiFi', 'Power Socket', 'Reading Light'],
      description: 'Premium AC first class with complimentary meals',
      discount: 22,
      rating: 4.6,
      reviews: 523,
      seatsLeft: 10,
      class: 'AC First',
      isPopular: true
    },
    {
      id: 8,
      type: 'train',
      title: 'AC 2-Tier Package',
      fromCity: 'Bangalore',
      toCity: 'Chennai',
      price: 899,
      originalPrice: 1100,
      duration: '5h 15m',
      operator: 'Shatabdi Express',
      departureTime: '06:00 AM',
      arrivalTime: '11:15 AM',
      amenities: ['AC', 'Meals', 'WiFi', 'Power Socket', 'Reading Light'],
      description: 'Comfortable AC 2-tier with meal service',
      discount: 18,
      rating: 4.4,
      reviews: 389,
      seatsLeft: 18,
      class: 'AC 2-Tier'
    },
    {
      id: 9,
      type: 'train',
      title: 'AC 3-Tier Package',
      fromCity: 'Ahmedabad',
      toCity: 'Mumbai',
      price: 599,
      originalPrice: 750,
      duration: '7h 30m',
      operator: 'Gujarat Express',
      departureTime: '10:30 PM',
      arrivalTime: '06:00 AM',
      amenities: ['AC', 'Bedding', 'Power Socket', 'Reading Light'],
      description: 'Affordable AC 3-tier for overnight journeys',
      discount: 20,
      rating: 4.1,
      reviews: 445,
      seatsLeft: 22,
      class: 'AC 3-Tier'
    },
    {
      id: 10,
      type: 'train',
      title: 'Sleeper Class Package',
      fromCity: 'Delhi',
      toCity: 'Jaipur',
      price: 299,
      originalPrice: 400,
      duration: '5h 00m',
      operator: 'Shatabdi Express',
      departureTime: '06:15 AM',
      arrivalTime: '11:15 AM',
      amenities: ['Non-AC', 'Power Socket', 'Reading Light'],
      description: 'Budget-friendly sleeper class option',
      discount: 25,
      rating: 3.8,
      reviews: 567,
      seatsLeft: 35,
      class: 'Sleeper'
    },
    {
      id: 11,
      type: 'train',
      title: 'AC Chair Car Package',
      fromCity: 'Pune',
      toCity: 'Mumbai',
      price: 449,
      originalPrice: 550,
      duration: '3h 15m',
      operator: 'Deccan Express',
      departureTime: '08:00 AM',
      arrivalTime: '11:15 AM',
      amenities: ['AC', 'Meals', 'Power Socket', 'Reading Light'],
      description: 'Quick and comfortable AC chair car',
      discount: 18,
      rating: 4.3,
      reviews: 298,
      seatsLeft: 28,
      class: 'AC Chair Car'
    },
    {
      id: 12,
      type: 'train',
      title: 'Executive Class Package',
      fromCity: 'Kolkata',
      toCity: 'Howrah',
      price: 1299,
      originalPrice: 1600,
      duration: '2h 30m',
      operator: 'Duronto Express',
      departureTime: '09:00 AM',
      arrivalTime: '11:30 AM',
      amenities: ['AC', 'Meals', 'WiFi', 'Power Socket', 'Entertainment'],
      description: 'Premium executive class with all amenities',
      discount: 19,
      rating: 4.5,
      reviews: 234,
      seatsLeft: 12,
      class: 'Executive',
      isPopular: true
    },

    // Flight Packages
    {
      id: 13,
      type: 'flight',
      title: 'Economy Class Package',
      fromCity: 'Mumbai',
      toCity: 'Delhi',
      price: 3499,
      originalPrice: 4500,
      duration: '2h 15m',
      operator: 'IndiGo',
      departureTime: '08:00 AM',
      arrivalTime: '10:15 AM',
      amenities: ['In-flight Entertainment', 'Meals', 'WiFi', 'USB Charging', 'Legroom'],
      description: 'Comfortable economy class with meal service',
      discount: 22,
      rating: 4.3,
      reviews: 678,
      seatsLeft: 8,
      class: 'Economy',
      isPopular: true
    },
    {
      id: 14,
      type: 'flight',
      title: 'Business Class Package',
      fromCity: 'Bangalore',
      toCity: 'Goa',
      price: 8999,
      originalPrice: 12000,
      duration: '1h 30m',
      operator: 'Air India',
      departureTime: '10:00 AM',
      arrivalTime: '11:30 AM',
      amenities: ['Lounge Access', 'Priority Boarding', 'Meals', 'WiFi', 'Extra Legroom', 'Entertainment'],
      description: 'Luxury business class with premium services',
      discount: 25,
      rating: 4.8,
      reviews: 234,
      seatsLeft: 3,
      class: 'Business',
      isPopular: true
    },
    {
      id: 15,
      type: 'flight',
      title: 'Premium Economy Package',
      fromCity: 'Delhi',
      toCity: 'Kolkata',
      price: 5499,
      originalPrice: 7000,
      duration: '2h 30m',
      operator: 'Vistara',
      departureTime: '02:00 PM',
      arrivalTime: '04:30 PM',
      amenities: ['Extra Legroom', 'Meals', 'WiFi', 'Entertainment', 'Priority Check-in'],
      description: 'Enhanced economy with extra comfort',
      discount: 21,
      rating: 4.5,
      reviews: 456,
      seatsLeft: 12,
      class: 'Premium Economy'
    },
    {
      id: 16,
      type: 'flight',
      title: 'Budget Flight Package',
      fromCity: 'Pune',
      toCity: 'Hyderabad',
      price: 2499,
      originalPrice: 3200,
      duration: '1h 15m',
      operator: 'SpiceJet',
      departureTime: '06:00 AM',
      arrivalTime: '07:15 AM',
      amenities: ['WiFi', 'USB Charging', 'Snacks'],
      description: 'Affordable flight option with basic amenities',
      discount: 22,
      rating: 4.1,
      reviews: 789,
      seatsLeft: 15,
      class: 'Economy'
    },
    {
      id: 17,
      type: 'flight',
      title: 'First Class Package',
      fromCity: 'Mumbai',
      toCity: 'Dubai',
      price: 24999,
      originalPrice: 32000,
      duration: '3h 00m',
      operator: 'Emirates',
      departureTime: '10:00 PM',
      arrivalTime: '01:00 AM',
      amenities: ['Private Suite', 'Lounge Access', 'Gourmet Meals', 'WiFi', 'Entertainment', 'Spa'],
      description: 'Ultra-luxury first class experience',
      discount: 22,
      rating: 4.9,
      reviews: 123,
      seatsLeft: 2,
      class: 'First',
      isPopular: true
    },
    {
      id: 18,
      type: 'flight',
      title: 'Domestic Economy Package',
      fromCity: 'Chennai',
      toCity: 'Kochi',
      price: 2999,
      originalPrice: 3800,
      duration: '1h 30m',
      operator: 'AirAsia',
      departureTime: '12:00 PM',
      arrivalTime: '01:30 PM',
      amenities: ['WiFi', 'USB Charging', 'Snacks', 'Entertainment'],
      description: 'Value-for-money domestic flight',
      discount: 21,
      rating: 4.2,
      reviews: 567,
      seatsLeft: 20,
      class: 'Economy'
    },

    // Tour Packages
    {
      id: 19,
      type: 'tour',
      title: '1 Day Udaipur City Tour',
      fromCity: 'Udaipur',
      toCity: 'Udaipur',
      price: 1999,
      originalPrice: 2500,
      duration: '1 Day',
      operator: 'GoTrip Tours',
      departureTime: '08:00 AM',
      arrivalTime: '08:00 PM',
      amenities: ['Guide', 'Meals', 'Transport', 'Entry Tickets', 'Hotel Pickup'],
      description: 'Complete 1 day tour covering City Palace, Lake Pichola, Jagdish Temple and more',
      discount: 20,
      rating: 4.6,
      reviews: 423,
      seatsLeft: 15,
      isPopular: true
    },
    {
      id: 20,
      type: 'tour',
      title: '1 Day Jaipur Heritage Tour',
      fromCity: 'Jaipur',
      toCity: 'Jaipur',
      price: 1799,
      originalPrice: 2200,
      duration: '1 Day',
      operator: 'GoTrip Tours',
      departureTime: '09:00 AM',
      arrivalTime: '07:00 PM',
      amenities: ['Guide', 'Lunch', 'Transport', 'Entry Tickets', 'Hotel Pickup'],
      description: 'Explore Amer Fort, Hawa Mahal, City Palace, and Jantar Mantar in one day',
      discount: 18,
      rating: 4.5,
      reviews: 389,
      seatsLeft: 20
    },
    {
      id: 21,
      type: 'tour',
      title: '1 Day Goa Beach Tour',
      fromCity: 'Goa',
      toCity: 'Goa',
      price: 1499,
      originalPrice: 1900,
      duration: '1 Day',
      operator: 'GoTrip Tours',
      departureTime: '08:00 AM',
      arrivalTime: '06:00 PM',
      amenities: ['Guide', 'Lunch', 'Transport', 'Beach Activities', 'Hotel Pickup'],
      description: 'Visit Calangute, Baga, Anjuna beaches with water sports and local sightseeing',
      discount: 21,
      rating: 4.7,
      reviews: 512,
      seatsLeft: 25,
      isPopular: true
    },
    {
      id: 22,
      type: 'tour',
      title: '2 Days Manali Hill Station Tour',
      fromCity: 'Manali',
      toCity: 'Manali',
      price: 4999,
      originalPrice: 6500,
      duration: '2 Days',
      operator: 'GoTrip Tours',
      departureTime: '09:00 AM',
      arrivalTime: '06:00 PM',
      amenities: ['Guide', 'Meals', 'Hotel Stay', 'Transport', 'Entry Tickets'],
      description: '2 days tour covering Rohtang Pass, Solang Valley, Hadimba Temple and more',
      discount: 23,
      rating: 4.8,
      reviews: 678,
      seatsLeft: 12,
      isPopular: true
    },
    {
      id: 23,
      type: 'tour',
      title: '1 Day Mumbai City Tour',
      fromCity: 'Mumbai',
      toCity: 'Mumbai',
      price: 2199,
      originalPrice: 2800,
      duration: '1 Day',
      operator: 'GoTrip Tours',
      departureTime: '08:30 AM',
      arrivalTime: '08:00 PM',
      amenities: ['Guide', 'Lunch', 'Transport', 'Entry Tickets', 'Hotel Pickup'],
      description: 'Visit Gateway of India, Marine Drive, Elephanta Caves, and Colaba Causeway',
      discount: 21,
      rating: 4.4,
      reviews: 456,
      seatsLeft: 18
    },
    {
      id: 24,
      type: 'tour',
      title: '3 Days Kerala Backwaters Tour',
      fromCity: 'Kochi',
      toCity: 'Alleppey',
      price: 8999,
      originalPrice: 12000,
      duration: '3 Days',
      operator: 'GoTrip Tours',
      departureTime: '09:00 AM',
      arrivalTime: '05:00 PM',
      amenities: ['Guide', 'All Meals', 'Houseboat Stay', 'Transport', 'Entry Tickets'],
      description: '3 days tour with houseboat experience, tea gardens, and Kerala cuisine',
      discount: 25,
      rating: 4.9,
      reviews: 789,
      seatsLeft: 8,
      isPopular: true
    },
    {
      id: 25,
      type: 'tour',
      title: '1 Day Delhi Heritage Tour',
      fromCity: 'Delhi',
      toCity: 'Delhi',
      price: 1899,
      originalPrice: 2400,
      duration: '1 Day',
      operator: 'GoTrip Tours',
      departureTime: '08:00 AM',
      arrivalTime: '07:00 PM',
      amenities: ['Guide', 'Lunch', 'Transport', 'Entry Tickets', 'Hotel Pickup'],
      description: 'Visit Red Fort, India Gate, Qutub Minar, Lotus Temple, and Jama Masjid',
      discount: 21,
      rating: 4.5,
      reviews: 567,
      seatsLeft: 22
    },
    {
      id: 26,
      type: 'tour',
      title: '1 Day Agra Taj Mahal Tour',
      fromCity: 'Agra',
      toCity: 'Agra',
      price: 2499,
      originalPrice: 3200,
      duration: '1 Day',
      operator: 'GoTrip Tours',
      departureTime: '07:00 AM',
      arrivalTime: '06:00 PM',
      amenities: ['Guide', 'Lunch', 'Transport', 'Entry Tickets', 'Hotel Pickup'],
      description: 'Visit Taj Mahal, Agra Fort, and Fatehpur Sikri with expert guide',
      discount: 22,
      rating: 4.8,
      reviews: 892,
      seatsLeft: 10,
      isPopular: true
    }
  ];

  filteredPackages: Package[] = [];

  ngOnInit() {
    // Assign images to ALL packages based on their type
    // For train packages, always use train-specific images
    this.packages.forEach(pkg => {
      if (pkg.type === 'train') {
        pkg.image = this.getDefaultImage('train');
      } else {
        pkg.image = pkg.image || this.getDefaultImage(pkg.type);
      }
    });
    this.filteredPackages = [...this.packages];

    // Check for search query in URL params
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
        this.applyFilters();
      }
    });

    this.applyFilters(); // Apply initial sorting
  }

  getDefaultImage(type: string): string {
    // Using reliable scenic image URLs with train-specific photos
    const imageMap: { [key: string]: string } = {
      'bus': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop',
      'train': 'https://images.pexels.com/photos/163236/luxury-train-steam-locomotive-163236.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      'flight': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=400&fit=crop',
      'tour': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop'
    };
    return imageMap[type] || imageMap['bus'];
  }

  filterByType(type: 'all' | 'bus' | 'train' | 'flight' | 'tour') {
    this.selectedType = type;
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.packages];

    // Filter by type
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(pkg => pkg.type === this.selectedType);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(pkg =>
        pkg.fromCity.toLowerCase().includes(query) ||
        pkg.toCity.toLowerCase().includes(query) ||
        pkg.title.toLowerCase().includes(query) ||
        pkg.operator.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'duration':
          return this.parseDuration(a.duration) - this.parseDuration(b.duration);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    this.filteredPackages = filtered;
  }

  parseDuration(duration: string): number {
    const match = duration.match(/(\d+)h\s*(\d+)m?/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2] || '0');
      return hours * 60 + minutes;
    }
    return 0;
  }

  getDiscountPercentage(pkg: Package): number {
    if (pkg.originalPrice && pkg.price) {
      return Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);
    }
    return pkg.discount || 0;
  }

  bookPackage(pkg: Package) {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;

    // Set default travel date to today
    const today = new Date();
    const travelDate = today.toISOString().split('T')[0];

    // Map package type to transport type for booking components
    const transportTypeMap: { [key: string]: string } = {
      'bus': 'bus',
      'train': 'train',
      'flight': 'plane',
      'tour': 'tour'
    };

    const transportType = transportTypeMap[pkg.type];

    if (!transportType) {
      return;
    }

    // Store search data in the format expected by booking components
    const searchData = {
      transportType: transportType,
      from: pkg.fromCity,
      to: pkg.toCity,
      date: travelDate
    };

    // Create option object based on package type to directly show passenger selection
    let selectedOption: any;

    if (pkg.type === 'bus') {
      selectedOption = {
        id: pkg.id,
        operator: pkg.operator,
        type: pkg.title.includes('Deluxe') ? 'Deluxe AC' :
              pkg.title.includes('Sleeper') ? 'AC Sleeper' :
              pkg.title.includes('Luxury') ? 'Luxury AC' :
              pkg.title.includes('Express') ? 'Express AC' :
              pkg.title.includes('Economy') ? 'AC' : 'AC',
        rating: pkg.rating || 4.0,
        reviews: pkg.reviews || 100,
        departure: pkg.fromCity,
        arrival: pkg.toCity,
        duration: pkg.duration,
        amenities: pkg.amenities,
        seatsLeft: pkg.seatsLeft || 20,
        price: pkg.price,
        departureTime: pkg.departureTime,
        arrivalTime: pkg.arrivalTime
      };
    } else if (pkg.type === 'train') {
      selectedOption = {
        id: pkg.id,
        operator: pkg.operator,
        type: pkg.title.includes('Rajdhani') ? 'Rajdhani Express' :
              pkg.title.includes('Shatabdi') ? 'Shatabdi Express' :
              pkg.title.includes('Gujarat') ? 'Gujarat Express' :
              pkg.title.includes('Duronto') ? 'Duronto Express' : 'Express',
        rating: pkg.rating || 4.0,
        reviews: pkg.reviews || 100,
        departure: pkg.fromCity,
        arrival: pkg.toCity,
        duration: pkg.duration,
        amenities: pkg.amenities,
        seatsLeft: pkg.seatsLeft || 20,
        price: pkg.price,
        trainNumber: `${Math.floor(Math.random() * 9000) + 1000}`,
        departureTime: pkg.departureTime,
        arrivalTime: pkg.arrivalTime,
        classType: pkg.class || 'AC 3-Tier'
      };
    } else if (pkg.type === 'flight') {
      selectedOption = {
        id: pkg.id.toString(),
        operator: pkg.operator,
        flightNumber: `${pkg.operator.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
        aircraftType: 'A320',
        departureTime: pkg.departureTime,
        arrivalTime: pkg.arrivalTime,
        duration: pkg.duration,
        price: pkg.price,
        classType: pkg.class || 'Economy',
        amenities: pkg.amenities,
        stops: 0,
        baggage: '15kg',
        cancellationPolicy: 'Free cancellation up to 24 hours',
        rating: pkg.rating || 4.0,
        reviews: pkg.reviews || 100,
        seatsLeft: pkg.seatsLeft || 20
      };
    } else if (pkg.type === 'tour') {
      selectedOption = {
        id: pkg.id,
        title: pkg.title,
        operator: pkg.operator,
        fromCity: pkg.fromCity,
        toCity: pkg.toCity,
        duration: pkg.duration,
        price: pkg.price,
        originalPrice: pkg.originalPrice,
        rating: pkg.rating || 4.0,
        reviews: pkg.reviews || 100,
        amenities: pkg.amenities,
        description: pkg.description,
        departureTime: pkg.departureTime,
        arrivalTime: pkg.arrivalTime,
        seatsLeft: pkg.seatsLeft || 20
      };
    }

    // Store data for booking components
    sessionStorage.setItem('searchData', JSON.stringify(searchData));
    sessionStorage.setItem('selectedPackageOption', JSON.stringify(selectedOption));
    sessionStorage.setItem('fromPackage', 'true'); // Flag to skip search

    if (!isLoggedIn) {
      // Redirect to login page with return URL
      const returnUrl = pkg.type === 'bus' ? '/booking/bus' :
                       pkg.type === 'train' ? '/booking/train' :
                       pkg.type === 'flight' ? '/booking/plane' :
                       '/booking/tour';
      
      this.router.navigate(['/login'], {
        state: {
          returnUrl: returnUrl,
          fromPackage: true
        }
      });
      return;
    }

    // User is logged in, proceed with booking
    // Navigate to appropriate booking page using Angular Router
    if (pkg.type === 'bus') {
      this.router.navigate(['/booking/bus']);
    } else if (pkg.type === 'train') {
      this.router.navigate(['/booking/train']);
    } else if (pkg.type === 'flight') {
      this.router.navigate(['/booking/plane']);
    } else if (pkg.type === 'tour') {
      this.router.navigate(['/booking/tour']);
    }
  }
}

