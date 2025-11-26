import { INDIAN_DISTRICTS } from './indian-districts'; // Reusing districts data

export { INDIAN_DISTRICTS };

// Major Indian airports with their districts and states
export const INDIAN_AIRPORTS = [
  // Major Metro Cities
  { name: "Mumbai", district: "Mumbai City", state: "Maharashtra", code: "BOM", type: "International" },
  { name: "Mumbai", district: "Mumbai Suburban", state: "Maharashtra", code: "BOM", type: "International" },
  { name: "Delhi", district: "New Delhi", state: "Delhi", code: "DEL", type: "International" },
  { name: "Delhi", district: "Central Delhi", state: "Delhi", code: "DEL", type: "International" },
  { name: "Delhi", district: "South Delhi", state: "Delhi", code: "DEL", type: "International" },
  { name: "Bangalore", district: "Bengaluru Urban", state: "Karnataka", code: "BLR", type: "International" },
  { name: "Chennai", district: "Chennai", state: "Tamil Nadu", code: "MAA", type: "International" },
  { name: "Hyderabad", district: "Hyderabad", state: "Telangana", code: "HYD", type: "International" },
  { name: "Kolkata", district: "Kolkata", state: "West Bengal", code: "CCU", type: "International" },
  { name: "Pune", district: "Pune", state: "Maharashtra", code: "PNQ", type: "Domestic" },
  { name: "Ahmedabad", district: "Ahmedabad", state: "Gujarat", code: "AMD", type: "International" },
  { name: "Jaipur", district: "Jaipur", state: "Rajasthan", code: "JAI", type: "International" },
  { name: "Kochi", district: "Ernakulam", state: "Kerala", code: "COK", type: "International" },
  { name: "Goa", district: "North Goa", state: "Goa", code: "GOI", type: "International" },
  { name: "Goa", district: "South Goa", state: "Goa", code: "GOI", type: "International" },
  
  // Tier 2 Cities with Airports
  { name: "Indore", district: "Indore", state: "Madhya Pradesh", code: "IDR", type: "Domestic" },
  { name: "Bhopal", district: "Bhopal", state: "Madhya Pradesh", code: "BHO", type: "Domestic" },
  { name: "Nagpur", district: "Nagpur", state: "Maharashtra", code: "NAG", type: "Domestic" },
  { name: "Aurangabad", district: "Aurangabad", state: "Maharashtra", code: "IXU", type: "Domestic" },
  { name: "Surat", district: "Surat", state: "Gujarat", code: "STV", type: "Domestic" },
  { name: "Vadodara", district: "Vadodara", state: "Gujarat", code: "BDQ", type: "Domestic" },
  { name: "Rajkot", district: "Rajkot", state: "Gujarat", code: "RAJ", type: "Domestic" },
  { name: "Bhubaneswar", district: "Khordha", state: "Odisha", code: "BBI", type: "International" },
  { name: "Visakhapatnam", district: "Visakhapatnam", state: "Andhra Pradesh", code: "VTZ", type: "Domestic" },
  { name: "Vijayawada", district: "NTR", state: "Andhra Pradesh", code: "VGA", type: "Domestic" },
  { name: "Tirupati", district: "Tirupati", state: "Andhra Pradesh", code: "TIR", type: "Domestic" },
  { name: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", code: "CJB", type: "Domestic" },
  { name: "Madurai", district: "Madurai", state: "Tamil Nadu", code: "IXM", type: "Domestic" },
  { name: "Tiruchirappalli", district: "Tiruchirappalli", state: "Tamil Nadu", code: "TRZ", type: "Domestic" },
  { name: "Salem", district: "Salem", state: "Tamil Nadu", code: "SXV", type: "Domestic" },
  { name: "Mysore", district: "Mysuru", state: "Karnataka", code: "MYQ", type: "Domestic" },
  { name: "Mangalore", district: "Dakshina Kannada", state: "Karnataka", code: "IXE", type: "Domestic" },
  { name: "Hubli", district: "Dharwad", state: "Karnataka", code: "HBX", type: "Domestic" },
  { name: "Belgaum", district: "Belagavi", state: "Karnataka", code: "IXG", type: "Domestic" },
  { name: "Kozhikode", district: "Kozhikode", state: "Kerala", code: "CCJ", type: "Domestic" },
  { name: "Thiruvananthapuram", district: "Thiruvananthapuram", state: "Kerala", code: "TRV", type: "International" },
  { name: "Kannur", district: "Kannur", state: "Kerala", code: "CNN", type: "Domestic" },
  { name: "Lucknow", district: "Lucknow", state: "Uttar Pradesh", code: "LKO", type: "International" },
  { name: "Varanasi", district: "Varanasi", state: "Uttar Pradesh", code: "VNS", type: "International" },
  { name: "Allahabad", district: "Prayagraj", state: "Uttar Pradesh", code: "IXD", type: "Domestic" },
  { name: "Agra", district: "Agra", state: "Uttar Pradesh", code: "AGR", type: "Domestic" },
  { name: "Kanpur", district: "Kanpur Nagar", state: "Uttar Pradesh", code: "KNU", type: "Domestic" },
  { name: "Gorakhpur", district: "Gorakhpur", state: "Uttar Pradesh", code: "GOP", type: "Domestic" },
  { name: "Bareilly", district: "Bareilly", state: "Uttar Pradesh", code: "BEK", type: "Domestic" },
  { name: "Jodhpur", district: "Jodhpur", state: "Rajasthan", code: "JDH", type: "Domestic" },
  { name: "Udaipur", district: "Udaipur", state: "Rajasthan", code: "UDR", type: "Domestic" },
  { name: "Bikaner", district: "Bikaner", state: "Rajasthan", code: "BKB", type: "Domestic" },
  { name: "Kota", district: "Kota", state: "Rajasthan", code: "KTU", type: "Domestic" },
  { name: "Jaisalmer", district: "Jaisalmer", state: "Rajasthan", code: "JSA", type: "Domestic" },
  { name: "Chandigarh", district: "Chandigarh", state: "Chandigarh", code: "IXC", type: "International" },
  { name: "Amritsar", district: "Amritsar", state: "Punjab", code: "ATQ", type: "International" },
  { name: "Ludhiana", district: "Ludhiana", state: "Punjab", code: "LUH", type: "Domestic" },
  { name: "Bathinda", district: "Bathinda", state: "Punjab", code: "BUP", type: "Domestic" },
  { name: "Dehradun", district: "Dehradun", state: "Uttarakhand", code: "DED", type: "Domestic" },
  { name: "Pantnagar", district: "Udham Singh Nagar", state: "Uttarakhand", code: "PGH", type: "Domestic" },
  { name: "Patna", district: "Patna", state: "Bihar", code: "PAT", type: "Domestic" },
  { name: "Gaya", district: "Gaya", state: "Bihar", code: "GAY", type: "Domestic" },
  { name: "Ranchi", district: "Ranchi", state: "Jharkhand", code: "IXR", type: "Domestic" },
  { name: "Jamshedpur", district: "East Singhbhum", state: "Jharkhand", code: "IXW", type: "Domestic" },
  { name: "Dhanbad", district: "Dhanbad", state: "Jharkhand", code: "DBD", type: "Domestic" },
  { name: "Guwahati", district: "Kamrup Metropolitan", state: "Assam", code: "GAU", type: "International" },
  { name: "Dibrugarh", district: "Dibrugarh", state: "Assam", code: "DIB", type: "Domestic" },
  { name: "Jorhat", district: "Jorhat", state: "Assam", code: "JRH", type: "Domestic" },
  { name: "Silchar", district: "Cachar", state: "Assam", code: "IXS", type: "Domestic" },
  { name: "Tezpur", district: "Sonitpur", state: "Assam", code: "TEZ", type: "Domestic" },
  { name: "Imphal", district: "Imphal East", state: "Manipur", code: "IMF", type: "Domestic" },
  { name: "Agartala", district: "West Tripura", state: "Tripura", code: "IXA", type: "Domestic" },
  { name: "Aizawl", district: "Aizawl", state: "Mizoram", code: "AJL", type: "Domestic" },
  { name: "Dimapur", district: "Dimapur", state: "Nagaland", code: "DMU", type: "Domestic" },
  { name: "Shillong", district: "East Khasi Hills", state: "Meghalaya", code: "SHL", type: "Domestic" },
  { name: "Srinagar", district: "Srinagar", state: "Jammu & Kashmir", code: "SXR", type: "International" },
  { name: "Jammu", district: "Jammu", state: "Jammu & Kashmir", code: "IXJ", type: "Domestic" },
  { name: "Leh", district: "Leh", state: "Ladakh", code: "IXL", type: "Domestic" },
  { name: "Port Blair", district: "South Andaman", state: "Andaman and Nicobar Islands", code: "IXZ", type: "Domestic" },
  { name: "Puducherry", district: "Puducherry", state: "Puducherry", code: "PNY", type: "Domestic" }
];

export const FLIGHT_OPERATORS = [
  "IndiGo", "Air India", "Air India Express", "SpiceJet", "Akasa Air", 
  "Alliance Air", "Vistara", "Go First", "TruJet", "Star Air"
];

export const FLIGHT_TYPES = [
  { name: "Economy", class: "Economy", features: "Standard seating, meal service, entertainment" },
  { name: "Premium Economy", class: "Premium Economy", features: "Extra legroom, priority boarding, enhanced meals" },
  { name: "Business", class: "Business", features: "Flat-bed seats, premium meals, lounge access" },
  { name: "First Class", class: "First Class", features: "Private suites, gourmet dining, personal service" }
];

// Sample flight routes with realistic distances and durations
export const FLIGHT_ROUTES = [
  { from: "Mumbai", to: "Delhi", distance: "1150 km", duration: "2h 15m" },
  { from: "Delhi", to: "Mumbai", distance: "1150 km", duration: "2h 15m" },
  { from: "Mumbai", to: "Bangalore", distance: "850 km", duration: "1h 45m" },
  { from: "Bangalore", to: "Mumbai", distance: "850 km", duration: "1h 45m" },
  { from: "Delhi", to: "Bangalore", distance: "1750 km", duration: "2h 45m" },
  { from: "Bangalore", to: "Delhi", distance: "1750 km", duration: "2h 45m" },
  { from: "Mumbai", to: "Chennai", distance: "1050 km", duration: "2h 00m" },
  { from: "Chennai", to: "Mumbai", distance: "1050 km", duration: "2h 00m" },
  { from: "Delhi", to: "Chennai", distance: "1750 km", duration: "2h 45m" },
  { from: "Chennai", to: "Delhi", distance: "1750 km", duration: "2h 45m" },
  { from: "Mumbai", to: "Hyderabad", distance: "600 km", duration: "1h 30m" },
  { from: "Hyderabad", to: "Mumbai", distance: "600 km", duration: "1h 30m" },
  { from: "Delhi", to: "Hyderabad", distance: "1200 km", duration: "2h 15m" },
  { from: "Hyderabad", to: "Delhi", distance: "1200 km", duration: "2h 15m" },
  { from: "Bangalore", to: "Chennai", distance: "350 km", duration: "1h 15m" },
  { from: "Chennai", to: "Bangalore", distance: "350 km", duration: "1h 15m" },
  { from: "Mumbai", to: "Kolkata", distance: "1650 km", duration: "2h 30m" },
  { from: "Kolkata", to: "Mumbai", distance: "1650 km", duration: "2h 30m" },
  { from: "Delhi", to: "Kolkata", distance: "1300 km", duration: "2h 15m" },
  { from: "Kolkata", to: "Delhi", distance: "1300 km", duration: "2h 15m" },
  { from: "Mumbai", to: "Pune", distance: "150 km", duration: "0h 45m" },
  { from: "Pune", to: "Mumbai", distance: "150 km", duration: "0h 45m" },
  { from: "Mumbai", to: "Goa", distance: "450 km", duration: "1h 15m" },
  { from: "Goa", to: "Mumbai", distance: "450 km", duration: "1h 15m" },
  { from: "Delhi", to: "Jaipur", distance: "250 km", duration: "1h 00m" },
  { from: "Jaipur", to: "Delhi", distance: "250 km", duration: "1h 00m" },
  { from: "Mumbai", to: "Ahmedabad", distance: "500 km", duration: "1h 20m" },
  { from: "Ahmedabad", to: "Mumbai", distance: "500 km", duration: "1h 20m" },
  { from: "Delhi", to: "Lucknow", distance: "500 km", duration: "1h 20m" },
  { from: "Lucknow", to: "Delhi", distance: "500 km", duration: "1h 20m" },
  { from: "Bangalore", to: "Kochi", distance: "350 km", duration: "1h 15m" },
  { from: "Kochi", to: "Bangalore", distance: "350 km", duration: "1h 15m" },
  { from: "Chennai", to: "Kochi", distance: "650 km", duration: "1h 30m" },
  { from: "Kochi", to: "Chennai", distance: "650 km", duration: "1h 30m" },
  { from: "Mumbai", to: "Kochi", distance: "950 km", duration: "2h 00m" },
  { from: "Kochi", to: "Mumbai", distance: "950 km", duration: "2h 00m" },
  { from: "Delhi", to: "Amritsar", distance: "450 km", duration: "1h 15m" },
  { from: "Amritsar", to: "Delhi", distance: "450 km", duration: "1h 15m" },
  { from: "Mumbai", to: "Indore", distance: "550 km", duration: "1h 25m" },
  { from: "Indore", to: "Mumbai", distance: "550 km", duration: "1h 25m" },
  { from: "Delhi", to: "Bhopal", distance: "600 km", duration: "1h 30m" },
  { from: "Bhopal", to: "Delhi", distance: "600 km", duration: "1h 30m" },
  { name: "Mumbai", to: "Nagpur", distance: "750 km", duration: "1h 45m" },
  { from: "Nagpur", to: "Mumbai", distance: "750 km", duration: "1h 45m" },
  { from: "Bangalore", to: "Mysore", distance: "150 km", duration: "0h 45m" },
  { from: "Mysore", to: "Bangalore", distance: "150 km", duration: "0h 45m" },
  { from: "Chennai", to: "Coimbatore", distance: "450 km", duration: "1h 15m" },
  { from: "Coimbatore", to: "Chennai", distance: "450 km", duration: "1h 15m" },
  { from: "Mumbai", to: "Surat", distance: "300 km", duration: "1h 00m" },
  { from: "Surat", to: "Mumbai", distance: "300 km", duration: "1h 00m" },
  { from: "Delhi", to: "Chandigarh", distance: "250 km", duration: "1h 00m" },
  { from: "Chandigarh", to: "Delhi", distance: "250 km", duration: "1h 00m" },
  { from: "Mumbai", to: "Vadodara", distance: "400 km", duration: "1h 10m" },
  { from: "Vadodara", to: "Mumbai", distance: "400 km", duration: "1h 10m" },
  { from: "Delhi", to: "Varanasi", distance: "700 km", duration: "1h 45m" },
  { from: "Varanasi", to: "Delhi", distance: "700 km", duration: "1h 45m" },
  { from: "Bangalore", to: "Mangalore", distance: "350 km", duration: "1h 15m" },
  { from: "Mangalore", to: "Bangalore", distance: "350 km", duration: "1h 15m" },
  { from: "Chennai", to: "Madurai", distance: "450 km", duration: "1h 15m" },
  { from: "Madurai", to: "Chennai", distance: "450 km", duration: "1h 15m" },
  { from: "Mumbai", to: "Aurangabad", distance: "350 km", duration: "1h 10m" },
  { from: "Aurangabad", to: "Mumbai", distance: "350 km", duration: "1h 10m" },
  { from: "Delhi", to: "Jodhpur", distance: "500 km", duration: "1h 20m" },
  { from: "Jodhpur", to: "Delhi", distance: "500 km", duration: "1h 20m" },
  { from: "Mumbai", to: "Rajkot", distance: "450 km", duration: "1h 15m" },
  { from: "Rajkot", to: "Mumbai", distance: "450 km", duration: "1h 15m" },
  { from: "Delhi", to: "Udaipur", distance: "600 km", duration: "1h 30m" },
  { from: "Udaipur", to: "Delhi", distance: "600 km", duration: "1h 30m" },
  { from: "Bangalore", to: "Hubli", distance: "400 km", duration: "1h 20m" },
  { from: "Hubli", to: "Bangalore", distance: "400 km", duration: "1h 20m" },
  { from: "Chennai", to: "Tiruchirappalli", distance: "350 km", duration: "1h 10m" },
  { from: "Tiruchirappalli", to: "Chennai", distance: "350 km", duration: "1h 10m" },
  { from: "Mumbai", to: "Bhubaneswar", distance: "1200 km", duration: "2h 15m" },
  { from: "Bhubaneswar", to: "Mumbai", distance: "1200 km", duration: "2h 15m" },
  { from: "Delhi", to: "Bhubaneswar", distance: "1300 km", duration: "2h 15m" },
  { from: "Bhubaneswar", to: "Delhi", distance: "1300 km", duration: "2h 15m" },
  { from: "Bangalore", to: "Visakhapatnam", distance: "800 km", duration: "1h 45m" },
  { from: "Visakhapatnam", to: "Bangalore", distance: "800 km", duration: "1h 45m" },
  { from: "Chennai", to: "Visakhapatnam", distance: "750 km", duration: "1h 40m" },
  { from: "Visakhapatnam", to: "Chennai", distance: "750 km", duration: "1h 40m" },
  { from: "Mumbai", to: "Guwahati", distance: "2000 km", duration: "3h 15m" },
  { from: "Guwahati", to: "Mumbai", distance: "2000 km", duration: "3h 15m" },
  { from: "Delhi", to: "Guwahati", distance: "1500 km", duration: "2h 45m" },
  { from: "Guwahati", to: "Delhi", distance: "1500 km", duration: "2h 45m" },
  { from: "Kolkata", to: "Guwahati", distance: "500 km", duration: "1h 20m" },
  { from: "Guwahati", to: "Kolkata", distance: "500 km", duration: "1h 20m" },
  { from: "Mumbai", to: "Srinagar", distance: "1800 km", duration: "3h 00m" },
  { from: "Srinagar", to: "Mumbai", distance: "1800 km", duration: "3h 00m" },
  { from: "Delhi", to: "Srinagar", distance: "700 km", duration: "1h 45m" },
  { from: "Srinagar", to: "Delhi", distance: "700 km", duration: "1h 45m" },
  { from: "Mumbai", to: "Leh", distance: "2000 km", duration: "3h 30m" },
  { from: "Leh", to: "Mumbai", distance: "2000 km", duration: "3h 30m" },
  { from: "Delhi", to: "Leh", distance: "1000 km", duration: "2h 00m" },
  { from: "Leh", to: "Delhi", distance: "1000 km", duration: "2h 00m" }
];

export function getRoutesByCities(from: string, to: string) {
  return FLIGHT_ROUTES.filter(route => route.from === from && route.to === to);
}

export function getAmenitiesForFlightType(flightType: string): string[] {
  switch (flightType) {
    case 'Economy':
      return ['Meal', 'Entertainment', 'WiFi', 'Charging'];
    case 'Premium Economy':
      return ['Extra Legroom', 'Priority Boarding', 'Enhanced Meals', 'WiFi', 'Entertainment'];
    case 'Business':
      return ['Flat-bed Seats', 'Premium Meals', 'Lounge Access', 'WiFi', 'Entertainment', 'Priority Check-in'];
    case 'First Class':
      return ['Private Suites', 'Gourmet Dining', 'Personal Service', 'Lounge Access', 'WiFi', 'Entertainment'];
    default:
      return ['Basic Amenities'];
  }
}

export function getPriceMultiplier(flightType: string): number {
  switch (flightType) {
    case 'Economy': return 1.0;
    case 'Premium Economy': return 1.5;
    case 'Business': return 3.0;
    case 'First Class': return 5.0;
    default: return 1.0;
  }
}

export function getAirportsByDistrict(district: string) {
  return INDIAN_AIRPORTS.filter(airport => airport.district === district);
}

export function getAirportsByState(state: string) {
  return INDIAN_AIRPORTS.filter(airport => airport.state === state);
}

export function getAllAirportCities() {
  const cities = [...new Set(INDIAN_AIRPORTS.map(airport => airport.name))];
  return cities.sort();
}

export function getDistrictsWithAirports() {
  const districts = [...new Set(INDIAN_AIRPORTS.map(airport => airport.district))];
  return districts.sort();
}


