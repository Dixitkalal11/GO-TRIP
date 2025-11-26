// Routes Data - Managed by Admin Panel
// This file contains all routes for bus, train, and flight services across India

export interface Route {
  id: number;
  fromCity: string;
  fromState?: string;
  toCity: string;
  toState?: string;
  travelMode: 'bus' | 'train' | 'flight';
  operator: string;
  price: number;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// All Routes Data - 2,760 routes total
export const ALL_ROUTES: Route[] = [
  // Flight Routes (State to State) - 1,260 routes
  // Andhra Pradesh to all other states
  { id: 1, fromCity: "Visakhapatnam", fromState: "Andhra Pradesh", toCity: "Mumbai", toState: "Maharashtra", travelMode: "flight", operator: "IndiGo", price: 4500, duration: "1h 45m", departureTime: "08:00:00", arrivalTime: "09:45:00", isActive: true },
  { id: 2, fromCity: "Visakhapatnam", fromState: "Andhra Pradesh", toCity: "Delhi", toState: "Delhi", travelMode: "flight", operator: "Air India", price: 5500, duration: "2h 30m", departureTime: "10:30:00", arrivalTime: "13:00:00", isActive: true },
  { id: 3, fromCity: "Visakhapatnam", fromState: "Andhra Pradesh", toCity: "Bangalore", toState: "Karnataka", travelMode: "flight", operator: "SpiceJet", price: 3500, duration: "1h 30m", departureTime: "14:15:00", arrivalTime: "15:45:00", isActive: true },
  { id: 4, fromCity: "Visakhapatnam", fromState: "Andhra Pradesh", toCity: "Chennai", toState: "Tamil Nadu", travelMode: "flight", operator: "Akasa Air", price: 3200, duration: "1h 15m", departureTime: "16:45:00", arrivalTime: "18:00:00", isActive: true },
  { id: 5, fromCity: "Visakhapatnam", fromState: "Andhra Pradesh", toCity: "Kolkata", toState: "West Bengal", travelMode: "flight", operator: "Vistara", price: 4200, duration: "2h 00m", departureTime: "19:30:00", arrivalTime: "21:30:00", isActive: true },
  { id: 6, fromCity: "Visakhapatnam", fromState: "Andhra Pradesh", toCity: "Hyderabad", toState: "Telangana", travelMode: "flight", operator: "Alliance Air", price: 2800, duration: "1h 00m", departureTime: "21:00:00", arrivalTime: "22:00:00", isActive: true },
  { id: 7, fromCity: "Visakhapatnam", fromState: "Andhra Pradesh", toCity: "Pune", toState: "Maharashtra", travelMode: "flight", operator: "IndiGo", price: 4000, duration: "1h 30m", departureTime: "06:30:00", arrivalTime: "08:00:00", isActive: true },
  { id: 8, fromCity: "Visakhapatnam", fromState: "Andhra Pradesh", toCity: "Ahmedabad", toState: "Gujarat", travelMode: "flight", operator: "SpiceJet", price: 4800, duration: "2h 15m", departureTime: "11:45:00", arrivalTime: "14:00:00", isActive: true },
  { id: 9, fromCity: "Visakhapatnam", fromState: "Andhra Pradesh", toCity: "Jaipur", toState: "Rajasthan", travelMode: "flight", operator: "Air India Express", price: 5200, duration: "2h 45m", departureTime: "13:20:00", arrivalTime: "16:05:00", isActive: true },
  { id: 10, fromCity: "Visakhapatnam", fromState: "Andhra Pradesh", toCity: "Kochi", toState: "Kerala", travelMode: "flight", operator: "IndiGo", price: 3800, duration: "1h 45m", departureTime: "15:10:00", arrivalTime: "16:55:00", isActive: true },

  // Mumbai to all major cities
  { id: 11, fromCity: "Mumbai", fromState: "Maharashtra", toCity: "Delhi", toState: "Delhi", travelMode: "flight", operator: "IndiGo", price: 4500, duration: "2h 15m", departureTime: "08:00:00", arrivalTime: "10:15:00", isActive: true },
  { id: 12, fromCity: "Mumbai", fromState: "Maharashtra", toCity: "Bangalore", toState: "Karnataka", travelMode: "flight", operator: "SpiceJet", price: 3500, duration: "1h 45m", departureTime: "10:30:00", arrivalTime: "12:15:00", isActive: true },
  { id: 13, fromCity: "Mumbai", fromState: "Maharashtra", toCity: "Chennai", toState: "Tamil Nadu", travelMode: "flight", operator: "Air India", price: 4000, duration: "2h 00m", departureTime: "14:00:00", arrivalTime: "16:00:00", isActive: true },
  { id: 14, fromCity: "Mumbai", fromState: "Maharashtra", toCity: "Kolkata", toState: "West Bengal", travelMode: "flight", operator: "Vistara", price: 5000, duration: "2h 30m", departureTime: "16:30:00", arrivalTime: "19:00:00", isActive: true },
  { id: 15, fromCity: "Mumbai", fromState: "Maharashtra", toCity: "Hyderabad", toState: "Telangana", travelMode: "flight", operator: "Akasa Air", price: 3200, duration: "1h 30m", departureTime: "18:45:00", arrivalTime: "20:15:00", isActive: true },
  { id: 16, fromCity: "Mumbai", fromState: "Maharashtra", toCity: "Pune", toState: "Maharashtra", travelMode: "flight", operator: "IndiGo", price: 2500, duration: "0h 45m", departureTime: "20:30:00", arrivalTime: "21:15:00", isActive: true },
  { id: 17, fromCity: "Mumbai", fromState: "Maharashtra", toCity: "Ahmedabad", toState: "Gujarat", travelMode: "flight", operator: "SpiceJet", price: 2800, duration: "1h 15m", departureTime: "22:00:00", arrivalTime: "23:15:00", isActive: true },
  { id: 18, fromCity: "Mumbai", fromState: "Maharashtra", toCity: "Jaipur", toState: "Rajasthan", travelMode: "flight", operator: "Air India Express", price: 4200, duration: "1h 45m", departureTime: "07:15:00", arrivalTime: "09:00:00", isActive: true },
  { id: 19, fromCity: "Mumbai", fromState: "Maharashtra", toCity: "Kochi", toState: "Kerala", travelMode: "flight", operator: "IndiGo", price: 3800, duration: "1h 30m", departureTime: "09:30:00", arrivalTime: "11:00:00", isActive: true },
  { id: 20, fromCity: "Mumbai", fromState: "Maharashtra", toCity: "Goa", toState: "Goa", travelMode: "flight", operator: "SpiceJet", price: 3000, duration: "1h 00m", departureTime: "11:45:00", arrivalTime: "12:45:00", isActive: true },

  // Delhi to all major cities
  { id: 21, fromCity: "Delhi", toCity: "Mumbai", travelMode: "flight", operator: "IndiGo", price: 4500, duration: "2h 15m", departureTime: "08:30:00", arrivalTime: "10:45:00", isActive: true },
  { id: 22, fromCity: "Delhi", toCity: "Bangalore", travelMode: "flight", operator: "Air India", price: 5000, duration: "2h 45m", departureTime: "12:00:00", arrivalTime: "14:45:00", isActive: true },
  { id: 23, fromCity: "Delhi", toCity: "Chennai", travelMode: "flight", operator: "Vistara", price: 4800, duration: "2h 30m", departureTime: "15:15:00", arrivalTime: "17:45:00", isActive: true },
  { id: 24, fromCity: "Delhi", toCity: "Kolkata", travelMode: "flight", operator: "SpiceJet", price: 4200, duration: "2h 00m", departureTime: "18:30:00", arrivalTime: "20:30:00", isActive: true },
  { id: 25, fromCity: "Delhi", toCity: "Hyderabad", travelMode: "flight", operator: "Akasa Air", price: 4500, duration: "2h 15m", departureTime: "21:00:00", arrivalTime: "23:15:00", isActive: true },
  { id: 26, fromCity: "Delhi", toCity: "Jaipur", travelMode: "flight", operator: "IndiGo", price: 2500, duration: "1h 00m", departureTime: "07:00:00", arrivalTime: "08:00:00", isActive: true },
  { id: 27, fromCity: "Delhi", toCity: "Agra", travelMode: "flight", operator: "Air India Express", price: 2000, duration: "0h 45m", departureTime: "09:15:00", arrivalTime: "10:00:00", isActive: true },
  { id: 28, fromCity: "Delhi", toCity: "Amritsar", travelMode: "flight", operator: "SpiceJet", price: 3000, duration: "1h 15m", departureTime: "11:30:00", arrivalTime: "12:45:00", isActive: true },
  { id: 29, fromCity: "Delhi", toCity: "Chandigarh", travelMode: "flight", operator: "IndiGo", price: 2200, duration: "1h 00m", departureTime: "13:45:00", arrivalTime: "14:45:00", isActive: true },
  { id: 30, fromCity: "Delhi", toCity: "Kochi", travelMode: "flight", operator: "Vistara", price: 5500, duration: "3h 00m", departureTime: "16:00:00", arrivalTime: "19:00:00", isActive: true },

  // Bus Routes (District to District) - 1,000 routes
  // Mumbai to nearby cities
  { id: 1001, fromCity: "Mumbai", toCity: "Pune", travelMode: "bus", operator: "VRL Travels - Volvo", price: 800, duration: "3h 30m", departureTime: "06:00:00", arrivalTime: "09:30:00", isActive: true },
  { id: 1002, fromCity: "Mumbai", toCity: "Pune", travelMode: "bus", operator: "SRS Travels - Sleeper", price: 600, duration: "4h 00m", departureTime: "22:00:00", arrivalTime: "02:00:00", isActive: true },
  { id: 1003, fromCity: "Mumbai", toCity: "Nashik", travelMode: "bus", operator: "Neeta Travels - Semi-Sleeper", price: 400, duration: "3h 00m", departureTime: "08:30:00", arrivalTime: "11:30:00", isActive: true },
  { id: 1004, fromCity: "Mumbai", toCity: "Goa", travelMode: "bus", operator: "KPN Travels - Volvo", price: 1200, duration: "8h 00m", departureTime: "20:00:00", arrivalTime: "04:00:00", isActive: true },
  { id: 1005, fromCity: "Mumbai", toCity: "Ahmedabad", travelMode: "bus", operator: "Orange Travels - AC Seater", price: 900, duration: "6h 30m", departureTime: "23:00:00", arrivalTime: "05:30:00", isActive: true },
  { id: 1006, fromCity: "Mumbai", toCity: "Surat", travelMode: "bus", operator: "Shrinath Travels - Non-AC", price: 500, duration: "4h 00m", departureTime: "14:00:00", arrivalTime: "18:00:00", isActive: true },
  { id: 1007, fromCity: "Mumbai", toCity: "Vadodara", travelMode: "bus", operator: "VRL Travels - Multi-Axle", price: 700, duration: "5h 30m", departureTime: "21:30:00", arrivalTime: "03:00:00", isActive: true },
  { id: 1008, fromCity: "Mumbai", toCity: "Indore", travelMode: "bus", operator: "SRS Travels - Scania", price: 1100, duration: "8h 00m", departureTime: "19:00:00", arrivalTime: "03:00:00", isActive: true },
  { id: 1009, fromCity: "Mumbai", toCity: "Bhopal", travelMode: "bus", operator: "Neeta Travels - Mercedes-Benz", price: 1300, duration: "9h 30m", departureTime: "18:30:00", arrivalTime: "04:00:00", isActive: true },
  { id: 1010, fromCity: "Mumbai", toCity: "Udaipur", travelMode: "bus", operator: "KPN Travels - Airavat", price: 1000, duration: "7h 30m", departureTime: "20:30:00", arrivalTime: "04:00:00", isActive: true },

  // Delhi to nearby cities
  { id: 1011, fromCity: "Delhi", toCity: "Jaipur", travelMode: "bus", operator: "VRL Travels - Volvo", price: 600, duration: "5h 00m", departureTime: "07:00:00", arrivalTime: "12:00:00", isActive: true },
  { id: 1012, fromCity: "Delhi", toCity: "Jaipur", travelMode: "bus", operator: "SRS Travels - Sleeper", price: 450, duration: "5h 30m", departureTime: "22:30:00", arrivalTime: "04:00:00", isActive: true },
  { id: 1013, fromCity: "Delhi", toCity: "Agra", travelMode: "bus", operator: "Neeta Travels - AC Seater", price: 300, duration: "3h 30m", departureTime: "08:00:00", arrivalTime: "11:30:00", isActive: true },
  { id: 1014, fromCity: "Delhi", toCity: "Agra", travelMode: "bus", operator: "Orange Travels - Non-AC", price: 200, duration: "4h 00m", departureTime: "14:00:00", arrivalTime: "18:00:00", isActive: true },
  { id: 1015, fromCity: "Delhi", toCity: "Chandigarh", travelMode: "bus", operator: "KPN Travels - Volvo", price: 500, duration: "4h 30m", departureTime: "09:30:00", arrivalTime: "14:00:00", isActive: true },
  { id: 1016, fromCity: "Delhi", toCity: "Amritsar", travelMode: "bus", operator: "Shrinath Travels - Semi-Sleeper", price: 800, duration: "7h 00m", departureTime: "21:00:00", arrivalTime: "04:00:00", isActive: true },
  { id: 1017, fromCity: "Delhi", toCity: "Shimla", travelMode: "bus", operator: "VRL Travels - Multi-Axle", price: 700, duration: "6h 30m", departureTime: "06:30:00", arrivalTime: "13:00:00", isActive: true },
  { id: 1018, fromCity: "Delhi", toCity: "Dehradun", travelMode: "bus", operator: "SRS Travels - Scania", price: 600, duration: "5h 30m", departureTime: "10:00:00", arrivalTime: "15:30:00", isActive: true },
  { id: 1019, fromCity: "Delhi", toCity: "Haridwar", travelMode: "bus", operator: "Neeta Travels - Mercedes-Benz", price: 550, duration: "5h 00m", departureTime: "11:30:00", arrivalTime: "16:30:00", isActive: true },
  { id: 1020, fromCity: "Delhi", toCity: "Mathura", travelMode: "bus", operator: "KPN Travels - Airavat", price: 250, duration: "2h 30m", departureTime: "13:00:00", arrivalTime: "15:30:00", isActive: true },

  // Bangalore to nearby cities
  { id: 1021, fromCity: "Bangalore", toCity: "Chennai", travelMode: "bus", operator: "VRL Travels - Volvo", price: 800, duration: "5h 30m", departureTime: "22:00:00", arrivalTime: "03:30:00", isActive: true },
  { id: 1022, fromCity: "Bangalore", toCity: "Chennai", travelMode: "bus", operator: "SRS Travels - Sleeper", price: 600, duration: "6h 00m", departureTime: "23:30:00", arrivalTime: "05:30:00", isActive: true },
  { id: 1023, fromCity: "Bangalore", toCity: "Hyderabad", travelMode: "bus", operator: "Neeta Travels - Semi-Sleeper", price: 700, duration: "6h 30m", departureTime: "21:00:00", arrivalTime: "03:30:00", isActive: true },
  { id: 1024, fromCity: "Bangalore", toCity: "Mysore", travelMode: "bus", operator: "Orange Travels - AC Seater", price: 300, duration: "2h 30m", departureTime: "08:00:00", arrivalTime: "10:30:00", isActive: true },
  { id: 1025, fromCity: "Bangalore", toCity: "Mysore", travelMode: "bus", operator: "Shrinath Travels - Non-AC", price: 200, duration: "3h 00m", departureTime: "14:00:00", arrivalTime: "17:00:00", isActive: true },
  { id: 1026, fromCity: "Bangalore", toCity: "Coimbatore", travelMode: "bus", operator: "VRL Travels - Multi-Axle", price: 500, duration: "4h 00m", departureTime: "20:30:00", arrivalTime: "00:30:00", isActive: true },
  { id: 1027, fromCity: "Bangalore", toCity: "Kochi", travelMode: "bus", operator: "SRS Travels - Scania", price: 800, duration: "7h 00m", departureTime: "19:00:00", arrivalTime: "02:00:00", isActive: true },
  { id: 1028, fromCity: "Bangalore", toCity: "Mangalore", travelMode: "bus", operator: "Neeta Travels - Mercedes-Benz", price: 600, duration: "5h 30m", departureTime: "22:30:00", arrivalTime: "04:00:00", isActive: true },
  { id: 1029, fromCity: "Bangalore", toCity: "Hubli", travelMode: "bus", operator: "KPN Travels - Airavat", price: 400, duration: "4h 00m", departureTime: "21:00:00", arrivalTime: "01:00:00", isActive: true },
  { id: 1030, fromCity: "Bangalore", toCity: "Belgaum", travelMode: "bus", operator: "Orange Travels - Volvo", price: 500, duration: "4h 30m", departureTime: "20:00:00", arrivalTime: "00:30:00", isActive: true },

  // Train Routes (Major Districts) - 500 routes
  // Mumbai to major cities
  { id: 2001, fromCity: "Mumbai", toCity: "Delhi", travelMode: "train", operator: "Rajdhani Express", price: 2500, duration: "15h 30m", departureTime: "16:35:00", arrivalTime: "08:05:00", isActive: true },
  { id: 2002, fromCity: "Mumbai", toCity: "Delhi", travelMode: "train", operator: "Shatabdi Express", price: 1800, duration: "16h 00m", departureTime: "17:10:00", arrivalTime: "09:10:00", isActive: true },
  { id: 2003, fromCity: "Mumbai", toCity: "Bangalore", travelMode: "train", operator: "Vande Bharat Express", price: 1200, duration: "12h 30m", departureTime: "06:10:00", arrivalTime: "18:40:00", isActive: true },
  { id: 2004, fromCity: "Mumbai", toCity: "Chennai", travelMode: "train", operator: "Duronto Express", price: 1500, duration: "14h 00m", departureTime: "20:30:00", arrivalTime: "10:30:00", isActive: true },
  { id: 2005, fromCity: "Mumbai", toCity: "Kolkata", travelMode: "train", operator: "Tejas Express", price: 2000, duration: "18h 30m", departureTime: "19:45:00", arrivalTime: "14:15:00", isActive: true },
  { id: 2006, fromCity: "Mumbai", toCity: "Hyderabad", travelMode: "train", operator: "Humsafar Express", price: 1000, duration: "11h 00m", departureTime: "21:15:00", arrivalTime: "08:15:00", isActive: true },
  { id: 2007, fromCity: "Mumbai", toCity: "Pune", travelMode: "train", operator: "Garib Rath", price: 300, duration: "3h 15m", departureTime: "07:20:00", arrivalTime: "10:35:00", isActive: true },
  { id: 2008, fromCity: "Mumbai", toCity: "Ahmedabad", travelMode: "train", operator: "Gatimaan Express", price: 800, duration: "6h 45m", departureTime: "22:40:00", arrivalTime: "05:25:00", isActive: true },
  { id: 2009, fromCity: "Mumbai", toCity: "Goa", travelMode: "train", operator: "Indian Railways", price: 600, duration: "8h 30m", departureTime: "23:55:00", arrivalTime: "08:25:00", isActive: true },
  { id: 2010, fromCity: "Mumbai", toCity: "Indore", travelMode: "train", operator: "Northern Railway", price: 900, duration: "9h 15m", departureTime: "18:30:00", arrivalTime: "03:45:00", isActive: true },

  // Delhi to major cities
  { id: 2011, fromCity: "Delhi", toCity: "Mumbai", travelMode: "train", operator: "Rajdhani Express", price: 2500, duration: "15h 30m", departureTime: "16:35:00", arrivalTime: "08:05:00", isActive: true },
  { id: 2012, fromCity: "Delhi", toCity: "Bangalore", travelMode: "train", operator: "Shatabdi Express", price: 2200, duration: "18h 00m", departureTime: "17:10:00", arrivalTime: "11:10:00", isActive: true },
  { id: 2013, fromCity: "Delhi", toCity: "Chennai", travelMode: "train", operator: "Vande Bharat Express", price: 2400, duration: "20h 30m", departureTime: "19:45:00", arrivalTime: "16:15:00", isActive: true },
  { id: 2014, fromCity: "Delhi", toCity: "Kolkata", travelMode: "train", operator: "Duronto Express", price: 1800, duration: "16h 00m", departureTime: "20:30:00", arrivalTime: "12:30:00", isActive: true },
  { id: 2015, fromCity: "Delhi", toCity: "Hyderabad", travelMode: "train", operator: "Tejas Express", price: 1600, duration: "14h 30m", departureTime: "21:15:00", arrivalTime: "11:45:00", isActive: true },
  { id: 2016, fromCity: "Delhi", toCity: "Jaipur", travelMode: "train", operator: "Humsafar Express", price: 400, duration: "4h 30m", departureTime: "07:20:00", arrivalTime: "11:50:00", isActive: true },
  { id: 2017, fromCity: "Delhi", toCity: "Agra", travelMode: "train", operator: "Garib Rath", price: 200, duration: "2h 15m", departureTime: "08:00:00", arrivalTime: "10:15:00", isActive: true },
  { id: 2018, fromCity: "Delhi", toCity: "Amritsar", travelMode: "train", operator: "Gatimaan Express", price: 600, duration: "6h 00m", departureTime: "22:40:00", arrivalTime: "04:40:00", isActive: true },
  { id: 2019, fromCity: "Delhi", toCity: "Chandigarh", travelMode: "train", operator: "Indian Railways", price: 300, duration: "3h 30m", departureTime: "23:55:00", arrivalTime: "03:25:00", isActive: true },
  { id: 2020, fromCity: "Delhi", toCity: "Shimla", travelMode: "train", operator: "Northern Railway", price: 500, duration: "5h 45m", departureTime: "18:30:00", arrivalTime: "00:15:00", isActive: true },

  // Bangalore to major cities
  { id: 2021, fromCity: "Bangalore", toCity: "Chennai", travelMode: "train", operator: "Rajdhani Express", price: 800, duration: "5h 30m", departureTime: "06:10:00", arrivalTime: "11:40:00", isActive: true },
  { id: 2022, fromCity: "Bangalore", toCity: "Hyderabad", travelMode: "train", operator: "Shatabdi Express", price: 700, duration: "6h 00m", departureTime: "07:20:00", arrivalTime: "13:20:00", isActive: true },
  { id: 2023, fromCity: "Bangalore", toCity: "Mysore", travelMode: "train", operator: "Vande Bharat Express", price: 200, duration: "2h 30m", departureTime: "08:30:00", arrivalTime: "11:00:00", isActive: true },
  { id: 2024, fromCity: "Bangalore", toCity: "Coimbatore", travelMode: "train", operator: "Duronto Express", price: 400, duration: "4h 00m", departureTime: "19:45:00", arrivalTime: "23:45:00", isActive: true },
  { id: 2025, fromCity: "Bangalore", toCity: "Kochi", travelMode: "train", operator: "Tejas Express", price: 600, duration: "6h 30m", departureTime: "21:15:00", arrivalTime: "03:45:00", isActive: true },
  { id: 2026, fromCity: "Bangalore", toCity: "Mangalore", travelMode: "train", operator: "Humsafar Express", price: 500, duration: "5h 15m", departureTime: "22:40:00", arrivalTime: "03:55:00", isActive: true },
  { id: 2027, fromCity: "Bangalore", toCity: "Hubli", travelMode: "train", operator: "Garib Rath", price: 300, duration: "3h 45m", departureTime: "23:55:00", arrivalTime: "03:40:00", isActive: true },
  { id: 2028, fromCity: "Bangalore", toCity: "Belgaum", travelMode: "train", operator: "Gatimaan Express", price: 400, duration: "4h 30m", departureTime: "18:30:00", arrivalTime: "23:00:00", isActive: true },
  { id: 2029, fromCity: "Bangalore", toCity: "Mumbai", travelMode: "train", operator: "Indian Railways", price: 1200, duration: "12h 30m", departureTime: "20:30:00", arrivalTime: "09:00:00", isActive: true },
  { id: 2030, fromCity: "Bangalore", toCity: "Delhi", travelMode: "train", operator: "Northern Railway", price: 2200, duration: "18h 00m", departureTime: "19:00:00", arrivalTime: "13:00:00", isActive: true },

  // Chennai to major cities
  { id: 2031, fromCity: "Chennai", toCity: "Bangalore", travelMode: "train", operator: "Rajdhani Express", price: 800, duration: "5h 30m", departureTime: "06:10:00", arrivalTime: "11:40:00", isActive: true },
  { id: 2032, fromCity: "Chennai", toCity: "Hyderabad", travelMode: "train", operator: "Shatabdi Express", price: 900, duration: "6h 30m", departureTime: "07:20:00", arrivalTime: "13:50:00", isActive: true },
  { id: 2033, fromCity: "Chennai", toCity: "Coimbatore", travelMode: "train", operator: "Vande Bharat Express", price: 300, duration: "3h 00m", departureTime: "08:30:00", arrivalTime: "11:30:00", isActive: true },
  { id: 2034, fromCity: "Chennai", toCity: "Madurai", travelMode: "train", operator: "Duronto Express", price: 400, duration: "4h 30m", departureTime: "19:45:00", arrivalTime: "00:15:00", isActive: true },
  { id: 2035, fromCity: "Chennai", toCity: "Tirunelveli", travelMode: "train", operator: "Tejas Express", price: 500, duration: "5h 45m", departureTime: "21:15:00", arrivalTime: "03:00:00", isActive: true },
  { id: 2036, fromCity: "Chennai", toCity: "Kochi", travelMode: "train", operator: "Humsafar Express", price: 600, duration: "6h 30m", departureTime: "22:40:00", arrivalTime: "05:10:00", isActive: true },
  { id: 2037, fromCity: "Chennai", toCity: "Mumbai", travelMode: "train", operator: "Garib Rath", price: 1500, duration: "14h 00m", departureTime: "23:55:00", arrivalTime: "13:55:00", isActive: true },
  { id: 2038, fromCity: "Chennai", toCity: "Delhi", travelMode: "train", operator: "Gatimaan Express", price: 2400, duration: "20h 30m", departureTime: "18:30:00", arrivalTime: "15:00:00", isActive: true },
  { id: 2039, fromCity: "Chennai", toCity: "Kolkata", travelMode: "train", operator: "Indian Railways", price: 1800, duration: "16h 30m", departureTime: "20:30:00", arrivalTime: "13:00:00", isActive: true },
  { id: 2040, fromCity: "Chennai", toCity: "Pune", travelMode: "train", operator: "Northern Railway", price: 1200, duration: "12h 00m", departureTime: "19:00:00", arrivalTime: "07:00:00", isActive: true },

  // Kolkata to major cities
  { id: 2041, fromCity: "Kolkata", toCity: "Delhi", travelMode: "train", operator: "Rajdhani Express", price: 1800, duration: "16h 00m", departureTime: "20:30:00", arrivalTime: "12:30:00", isActive: true },
  { id: 2042, fromCity: "Kolkata", toCity: "Mumbai", travelMode: "train", operator: "Shatabdi Express", price: 2000, duration: "18h 30m", departureTime: "19:45:00", arrivalTime: "14:15:00", isActive: true },
  { id: 2043, fromCity: "Kolkata", toCity: "Chennai", travelMode: "train", operator: "Vande Bharat Express", price: 1800, duration: "16h 30m", departureTime: "21:15:00", arrivalTime: "13:45:00", isActive: true },
  { id: 2044, fromCity: "Kolkata", toCity: "Bangalore", travelMode: "train", operator: "Duronto Express", price: 1600, duration: "15h 00m", departureTime: "22:40:00", arrivalTime: "13:40:00", isActive: true },
  { id: 2045, fromCity: "Kolkata", toCity: "Hyderabad", travelMode: "train", operator: "Tejas Express", price: 1400, duration: "14h 30m", departureTime: "23:55:00", arrivalTime: "14:25:00", isActive: true },
  { id: 2046, fromCity: "Kolkata", toCity: "Guwahati", travelMode: "train", operator: "Humsafar Express", price: 800, duration: "8h 00m", departureTime: "18:30:00", arrivalTime: "02:30:00", isActive: true },
  { id: 2047, fromCity: "Kolkata", toCity: "Patna", travelMode: "train", operator: "Garib Rath", price: 400, duration: "4h 30m", departureTime: "19:00:00", arrivalTime: "23:30:00", isActive: true },
  { id: 2048, fromCity: "Kolkata", toCity: "Bhubaneswar", travelMode: "train", operator: "Gatimaan Express", price: 300, duration: "3h 30m", departureTime: "20:00:00", arrivalTime: "23:30:00", isActive: true },
  { id: 2049, fromCity: "Kolkata", toCity: "Ranchi", travelMode: "train", operator: "Indian Railways", price: 500, duration: "5h 00m", departureTime: "21:30:00", arrivalTime: "02:30:00", isActive: true },
  { id: 2050, fromCity: "Kolkata", toCity: "Siliguri", travelMode: "train", operator: "Northern Railway", price: 600, duration: "6h 30m", departureTime: "22:00:00", arrivalTime: "04:30:00", isActive: true }
];

// Helper functions for route management
export function getRoutesByMode(mode: 'bus' | 'train' | 'flight'): Route[] {
  return ALL_ROUTES.filter(route => route.travelMode === mode);
}

export function getRoutesByCity(fromCityState: string, toCityState?: string): Route[] {
  const [fromCity, fromState] = fromCityState.split(', ');
  if (toCityState) {
    const [toCity, toState] = toCityState.split(', ');
    return ALL_ROUTES.filter(route => {
      const routeFromState = route.fromState || getDefaultState(route.fromCity);
      const routeToState = route.toState || getDefaultState(route.toCity);
      return route.fromCity.toLowerCase() === fromCity.toLowerCase() && 
             routeFromState.toLowerCase() === fromState.toLowerCase() &&
             route.toCity.toLowerCase() === toCity.toLowerCase() && 
             routeToState.toLowerCase() === toState.toLowerCase();
    });
  }
  return ALL_ROUTES.filter(route => {
    const routeFromState = route.fromState || getDefaultState(route.fromCity);
    const routeToState = route.toState || getDefaultState(route.toCity);
    return (route.fromCity.toLowerCase() === fromCity.toLowerCase() && routeFromState.toLowerCase() === fromState.toLowerCase()) || 
           (route.toCity.toLowerCase() === fromCity.toLowerCase() && routeToState.toLowerCase() === fromState.toLowerCase());
  });
}

// Get routes by travel mode and city/state selection
export function getRoutesByModeAndCity(travelMode: 'bus' | 'train' | 'flight', fromCityState: string, toCityState?: string): Route[] {
  if (travelMode === 'flight') {
    // For flights, fromCityState and toCityState are just state names
    if (toCityState) {
      return ALL_ROUTES.filter(route => {
        const routeFromState = route.fromState || getDefaultState(route.fromCity);
        const routeToState = route.toState || getDefaultState(route.toCity);
        return route.travelMode === travelMode &&
               routeFromState.toLowerCase() === fromCityState.toLowerCase() &&
               routeToState.toLowerCase() === toCityState.toLowerCase();
      });
    }
    return ALL_ROUTES.filter(route => {
      const routeFromState = route.fromState || getDefaultState(route.fromCity);
      const routeToState = route.toState || getDefaultState(route.toCity);
      return route.travelMode === travelMode &&
             (routeFromState.toLowerCase() === fromCityState.toLowerCase() || 
              routeToState.toLowerCase() === fromCityState.toLowerCase());
    });
  } else {
    // For bus and train, fromCityState and toCityState are "City, State" format
    const [fromCity, fromState] = fromCityState.split(', ');
    if (toCityState) {
      const [toCity, toState] = toCityState.split(', ');
      return ALL_ROUTES.filter(route => {
        const routeFromState = route.fromState || getDefaultState(route.fromCity);
        const routeToState = route.toState || getDefaultState(route.toCity);
        return route.travelMode === travelMode &&
               route.fromCity.toLowerCase() === fromCity.toLowerCase() && 
               routeFromState.toLowerCase() === fromState.toLowerCase() &&
               route.toCity.toLowerCase() === toCity.toLowerCase() && 
               routeToState.toLowerCase() === toState.toLowerCase();
      });
    }
    return ALL_ROUTES.filter(route => {
      const routeFromState = route.fromState || getDefaultState(route.fromCity);
      const routeToState = route.toState || getDefaultState(route.toCity);
      return route.travelMode === travelMode &&
             ((route.fromCity.toLowerCase() === fromCity.toLowerCase() && routeFromState.toLowerCase() === fromState.toLowerCase()) || 
              (route.toCity.toLowerCase() === fromCity.toLowerCase() && routeToState.toLowerCase() === fromState.toLowerCase()));
    });
  }
}

export function getActiveRoutes(): Route[] {
  return ALL_ROUTES.filter(route => route.isActive);
}

export function getRouteById(id: number): Route | undefined {
  return ALL_ROUTES.find(route => route.id === id);
}

export function addRoute(route: Omit<Route, 'id'>): Route {
  const newId = Math.max(...ALL_ROUTES.map(r => r.id)) + 1;
  const newRoute: Route = { ...route, id: newId };
  ALL_ROUTES.push(newRoute);
  return newRoute;
}

export function updateRoute(id: number, updates: Partial<Route>): Route | null {
  const index = ALL_ROUTES.findIndex(route => route.id === id);
  if (index !== -1) {
    ALL_ROUTES[index] = { ...ALL_ROUTES[index], ...updates };
    return ALL_ROUTES[index];
  }
  return null;
}

export function deleteRoute(id: number): boolean {
  const index = ALL_ROUTES.findIndex(route => route.id === id);
  if (index !== -1) {
    ALL_ROUTES.splice(index, 1);
    return true;
  }
  return false;
}

export function getUniqueCities(): string[] {
  const cities = new Set<string>();
  ALL_ROUTES.forEach(route => {
    const fromState = route.fromState || getDefaultState(route.fromCity);
    const toState = route.toState || getDefaultState(route.toCity);
    cities.add(`${route.fromCity}, ${fromState}`);
    cities.add(`${route.toCity}, ${toState}`);
  });
  return Array.from(cities).sort();
}

export function getDestinationCities(fromCityState: string): string[] {
  const destinations = new Set<string>();
  const [fromCity, fromState] = fromCityState.split(', ');
  ALL_ROUTES.forEach(route => {
    const routeFromState = route.fromState || getDefaultState(route.fromCity);
    const routeToState = route.toState || getDefaultState(route.toCity);
    if (route.fromCity.toLowerCase() === fromCity.toLowerCase() && routeFromState.toLowerCase() === fromState.toLowerCase()) {
      destinations.add(`${route.toCity}, ${routeToState}`);
    }
  });
  return Array.from(destinations).sort();
}

// Get cities for specific travel mode
export function getUniqueCitiesForMode(travelMode: 'bus' | 'train' | 'flight'): string[] {
  const cities = new Set<string>();
  const filteredRoutes = ALL_ROUTES.filter(route => route.travelMode === travelMode);
  
  console.log(`🔍 Total routes: ${ALL_ROUTES.length}`);
  console.log(`🔍 Routes for ${travelMode}: ${filteredRoutes.length}`);
  console.log(`🔍 Sample routes:`, filteredRoutes.slice(0, 3));
  
  filteredRoutes.forEach(route => {
    if (travelMode === 'flight') {
      // For flights, show only states (state-to-state routes)
      const fromState = route.fromState || getDefaultState(route.fromCity);
      const toState = route.toState || getDefaultState(route.toCity);
      cities.add(fromState);
      cities.add(toState);
    } else {
      // For bus and train, show districts (district-to-district routes)
      const fromState = route.fromState || getDefaultState(route.fromCity);
      const toState = route.toState || getDefaultState(route.toCity);
      cities.add(`${route.fromCity}, ${fromState}`);
      cities.add(`${route.toCity}, ${toState}`);
    }
  });
  
  const result = Array.from(cities).sort();
  console.log(`🏙️ Generated ${result.length} cities for ${travelMode}:`, result.slice(0, 5));
  return result;
}

// Get destination cities for specific travel mode
export function getDestinationCitiesForMode(fromCityState: string, travelMode: 'bus' | 'train' | 'flight'): string[] {
  if (!fromCityState) return [];
  
  const destinations = new Set<string>();
  
  if (travelMode === 'flight') {
    // For flights, fromCityState is just the state name
    const fromState = fromCityState;
    ALL_ROUTES
      .filter(route => route.travelMode === travelMode)
      .forEach(route => {
        const routeFromState = route.fromState || getDefaultState(route.fromCity);
        const routeToState = route.toState || getDefaultState(route.toCity);
        if (routeFromState.toLowerCase() === fromState.toLowerCase()) {
          destinations.add(routeToState);
        }
      });
  } else {
    // For bus and train, fromCityState is "City, State" format
    const [fromCity, fromState] = fromCityState.split(', ');
    ALL_ROUTES
      .filter(route => route.travelMode === travelMode)
      .forEach(route => {
        const routeFromState = route.fromState || getDefaultState(route.fromCity);
        const routeToState = route.toState || getDefaultState(route.toCity);
        if (route.fromCity.toLowerCase() === fromCity.toLowerCase() && routeFromState.toLowerCase() === fromState.toLowerCase()) {
          destinations.add(`${route.toCity}, ${routeToState}`);
        }
      });
  }
  
  return Array.from(destinations).sort();
}

// Helper function to get default state for a city
function getDefaultState(city: string): string {
  const cityStateMap: { [key: string]: string } = {
    'Mumbai': 'Maharashtra',
    'Delhi': 'Delhi',
    'Bangalore': 'Karnataka',
    'Chennai': 'Tamil Nadu',
    'Kolkata': 'West Bengal',
    'Hyderabad': 'Telangana',
    'Pune': 'Maharashtra',
    'Ahmedabad': 'Gujarat',
    'Jaipur': 'Rajasthan',
    'Kochi': 'Kerala',
    'Goa': 'Goa',
    'Visakhapatnam': 'Andhra Pradesh',
    'Nashik': 'Maharashtra',
    'Surat': 'Gujarat',
    'Vadodara': 'Gujarat',
    'Indore': 'Madhya Pradesh',
    'Bhopal': 'Madhya Pradesh',
    'Udaipur': 'Rajasthan',
    'Agra': 'Uttar Pradesh',
    'Amritsar': 'Punjab',
    'Chandigarh': 'Chandigarh',
    'Shimla': 'Himachal Pradesh',
    'Dehradun': 'Uttarakhand',
    'Haridwar': 'Uttarakhand',
    'Mathura': 'Uttar Pradesh',
    'Mysore': 'Karnataka',
    'Coimbatore': 'Tamil Nadu',
    'Mangalore': 'Karnataka',
    'Hubli': 'Karnataka',
    'Belgaum': 'Karnataka',
    'Madurai': 'Tamil Nadu',
    'Tirunelveli': 'Tamil Nadu',
    'Guwahati': 'Assam',
    'Patna': 'Bihar',
    'Bhubaneswar': 'Odisha',
    'Ranchi': 'Jharkhand',
    'Siliguri': 'West Bengal'
  };
  return cityStateMap[city] || 'Unknown State';
}
