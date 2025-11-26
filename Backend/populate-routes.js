// Populate Routes Database Script
require('dotenv').config();
const { sequelize, Route, Schedule } = require('./src/models');

const sampleRoutes = [
  // Bus Routes (20 routes)
  { fromCity: 'Mumbai', toCity: 'Delhi', travelMode: 'bus', operator: 'RedBus', price: 1200, duration: '12h 30m', departureTime: '20:00', arrivalTime: '08:30' },
  { fromCity: 'Delhi', toCity: 'Mumbai', travelMode: 'bus', operator: 'RedBus', price: 1200, duration: '12h 30m', departureTime: '19:00', arrivalTime: '07:30' },
  { fromCity: 'Bangalore', toCity: 'Chennai', travelMode: 'bus', operator: 'KSRTC', price: 800, duration: '6h 15m', departureTime: '22:00', arrivalTime: '04:15' },
  { fromCity: 'Chennai', toCity: 'Bangalore', travelMode: 'bus', operator: 'KSRTC', price: 800, duration: '6h 15m', departureTime: '21:30', arrivalTime: '03:45' },
  { fromCity: 'Kolkata', toCity: 'Delhi', travelMode: 'bus', operator: 'WBTC', price: 1500, duration: '18h 45m', departureTime: '16:00', arrivalTime: '10:45' },
  { fromCity: 'Delhi', toCity: 'Kolkata', travelMode: 'bus', operator: 'WBTC', price: 1500, duration: '18h 45m', departureTime: '15:30', arrivalTime: '10:15' },
  { fromCity: 'Hyderabad', toCity: 'Bangalore', travelMode: 'bus', operator: 'TSRTC', price: 900, duration: '8h 20m', departureTime: '23:00', arrivalTime: '07:20' },
  { fromCity: 'Bangalore', toCity: 'Hyderabad', travelMode: 'bus', operator: 'TSRTC', price: 900, duration: '8h 20m', departureTime: '22:30', arrivalTime: '06:50' },
  { fromCity: 'Pune', toCity: 'Mumbai', travelMode: 'bus', operator: 'MSRTC', price: 400, duration: '3h 30m', departureTime: '06:00', arrivalTime: '09:30' },
  { fromCity: 'Mumbai', toCity: 'Pune', travelMode: 'bus', operator: 'MSRTC', price: 400, duration: '3h 30m', departureTime: '05:30', arrivalTime: '09:00' },
  { fromCity: 'Ahmedabad', toCity: 'Mumbai', travelMode: 'bus', operator: 'GSRTC', price: 600, duration: '5h 45m', departureTime: '07:00', arrivalTime: '12:45' },
  { fromCity: 'Mumbai', toCity: 'Ahmedabad', travelMode: 'bus', operator: 'GSRTC', price: 600, duration: '5h 45m', departureTime: '06:30', arrivalTime: '12:15' },
  { fromCity: 'Jaipur', toCity: 'Delhi', travelMode: 'bus', operator: 'RSRTC', price: 500, duration: '4h 30m', departureTime: '08:00', arrivalTime: '12:30' },
  { fromCity: 'Delhi', toCity: 'Jaipur', travelMode: 'bus', operator: 'RSRTC', price: 500, duration: '4h 30m', departureTime: '07:30', arrivalTime: '12:00' },
  { fromCity: 'Kochi', toCity: 'Bangalore', travelMode: 'bus', operator: 'KSRTC', price: 700, duration: '7h 15m', departureTime: '21:00', arrivalTime: '04:15' },
  { fromCity: 'Bangalore', toCity: 'Kochi', travelMode: 'bus', operator: 'KSRTC', price: 700, duration: '7h 15m', departureTime: '20:30', arrivalTime: '03:45' },
  { fromCity: 'Goa', toCity: 'Mumbai', travelMode: 'bus', operator: 'KTC', price: 800, duration: '9h 30m', departureTime: '19:00', arrivalTime: '04:30' },
  { fromCity: 'Mumbai', toCity: 'Goa', travelMode: 'bus', operator: 'KTC', price: 800, duration: '9h 30m', departureTime: '18:30', arrivalTime: '04:00' },
  { fromCity: 'Indore', toCity: 'Mumbai', travelMode: 'bus', operator: 'MPSRTC', price: 900, duration: '10h 15m', departureTime: '20:00', arrivalTime: '06:15' },
  { fromCity: 'Mumbai', toCity: 'Indore', travelMode: 'bus', operator: 'MPSRTC', price: 900, duration: '10h 15m', departureTime: '19:30', arrivalTime: '05:45' },

  // Train Routes (15 routes)
  { fromCity: 'Mumbai', toCity: 'Delhi', travelMode: 'train', operator: 'Indian Railways', price: 2500, duration: '16h 30m', departureTime: '16:35', arrivalTime: '09:05' },
  { fromCity: 'Delhi', toCity: 'Mumbai', travelMode: 'train', operator: 'Indian Railways', price: 2500, duration: '16h 30m', departureTime: '16:00', arrivalTime: '08:30' },
  { fromCity: 'Bangalore', toCity: 'Chennai', travelMode: 'train', operator: 'Indian Railways', price: 1200, duration: '5h 30m', departureTime: '06:00', arrivalTime: '11:30' },
  { fromCity: 'Chennai', toCity: 'Bangalore', travelMode: 'train', operator: 'Indian Railways', price: 1200, duration: '5h 30m', departureTime: '05:30', arrivalTime: '11:00' },
  { fromCity: 'Kolkata', toCity: 'Delhi', travelMode: 'train', operator: 'Indian Railways', price: 1800, duration: '17h 45m', departureTime: '14:30', arrivalTime: '08:15' },
  { fromCity: 'Delhi', toCity: 'Kolkata', travelMode: 'train', operator: 'Indian Railways', price: 1800, duration: '17h 45m', departureTime: '14:00', arrivalTime: '07:45' },
  { fromCity: 'Hyderabad', toCity: 'Bangalore', travelMode: 'train', operator: 'Indian Railways', price: 1500, duration: '12h 20m', departureTime: '20:00', arrivalTime: '08:20' },
  { fromCity: 'Bangalore', toCity: 'Hyderabad', travelMode: 'train', operator: 'Indian Railways', price: 1500, duration: '12h 20m', departureTime: '19:30', arrivalTime: '07:50' },
  { fromCity: 'Pune', toCity: 'Mumbai', travelMode: 'train', operator: 'Indian Railways', price: 300, duration: '3h 15m', departureTime: '06:30', arrivalTime: '09:45' },
  { fromCity: 'Mumbai', toCity: 'Pune', travelMode: 'train', operator: 'Indian Railways', price: 300, duration: '3h 15m', departureTime: '06:00', arrivalTime: '09:15' },
  { fromCity: 'Ahmedabad', toCity: 'Mumbai', travelMode: 'train', operator: 'Indian Railways', price: 800, duration: '7h 30m', departureTime: '08:00', arrivalTime: '15:30' },
  { fromCity: 'Mumbai', toCity: 'Ahmedabad', travelMode: 'train', operator: 'Indian Railways', price: 800, duration: '7h 30m', departureTime: '07:30', arrivalTime: '15:00' },
  { fromCity: 'Jaipur', toCity: 'Delhi', travelMode: 'train', operator: 'Indian Railways', price: 600, duration: '5h 45m', departureTime: '09:00', arrivalTime: '14:45' },
  { fromCity: 'Delhi', toCity: 'Jaipur', travelMode: 'train', operator: 'Indian Railways', price: 600, duration: '5h 45m', departureTime: '08:30', arrivalTime: '14:15' },
  { fromCity: 'Kochi', toCity: 'Bangalore', travelMode: 'train', operator: 'Indian Railways', price: 1000, duration: '11h 30m', departureTime: '18:00', arrivalTime: '05:30' },

  // Flight Routes (15 routes)
  { fromCity: 'Mumbai', toCity: 'Delhi', travelMode: 'flight', operator: 'Air India', price: 8500, duration: '2h 15m', departureTime: '08:00', arrivalTime: '10:15' },
  { fromCity: 'Delhi', toCity: 'Mumbai', travelMode: 'flight', operator: 'Air India', price: 8500, duration: '2h 15m', departureTime: '07:30', arrivalTime: '09:45' },
  { fromCity: 'Bangalore', toCity: 'Chennai', travelMode: 'flight', operator: 'IndiGo', price: 4500, duration: '1h 15m', departureTime: '10:00', arrivalTime: '11:15' },
  { fromCity: 'Chennai', toCity: 'Bangalore', travelMode: 'flight', operator: 'IndiGo', price: 4500, duration: '1h 15m', departureTime: '09:30', arrivalTime: '10:45' },
  { fromCity: 'Kolkata', toCity: 'Delhi', travelMode: 'flight', operator: 'SpiceJet', price: 7500, duration: '2h 30m', departureTime: '14:00', arrivalTime: '16:30' },
  { fromCity: 'Delhi', toCity: 'Kolkata', travelMode: 'flight', operator: 'SpiceJet', price: 7500, duration: '2h 30m', departureTime: '13:30', arrivalTime: '16:00' },
  { fromCity: 'Hyderabad', toCity: 'Bangalore', travelMode: 'flight', operator: 'Vistara', price: 5500, duration: '1h 30m', departureTime: '12:00', arrivalTime: '13:30' },
  { fromCity: 'Bangalore', toCity: 'Hyderabad', travelMode: 'flight', operator: 'Vistara', price: 5500, duration: '1h 30m', departureTime: '11:30', arrivalTime: '13:00' },
  { fromCity: 'Pune', toCity: 'Mumbai', travelMode: 'flight', operator: 'GoAir', price: 3500, duration: '0h 45m', departureTime: '15:00', arrivalTime: '15:45' },
  { fromCity: 'Mumbai', toCity: 'Pune', travelMode: 'flight', operator: 'GoAir', price: 3500, duration: '0h 45m', departureTime: '14:30', arrivalTime: '15:15' },
  { fromCity: 'Ahmedabad', toCity: 'Mumbai', travelMode: 'flight', operator: 'AirAsia', price: 4000, duration: '1h 15m', departureTime: '16:00', arrivalTime: '17:15' },
  { fromCity: 'Mumbai', toCity: 'Ahmedabad', travelMode: 'flight', operator: 'AirAsia', price: 4000, duration: '1h 15m', departureTime: '15:30', arrivalTime: '16:45' },
  { fromCity: 'Jaipur', toCity: 'Delhi', travelMode: 'flight', operator: 'IndiGo', price: 3000, duration: '1h 00m', departureTime: '18:00', arrivalTime: '19:00' },
  { fromCity: 'Delhi', toCity: 'Jaipur', travelMode: 'flight', operator: 'IndiGo', price: 3000, duration: '1h 00m', departureTime: '17:30', arrivalTime: '18:30' },
  { fromCity: 'Kochi', toCity: 'Bangalore', travelMode: 'flight', operator: 'SpiceJet', price: 5000, duration: '1h 45m', departureTime: '19:00', arrivalTime: '20:45' }
];

const sampleSchedules = [
  // Sample schedules for first few routes
  { routeId: 1, departureTime: '20:00', arrivalTime: '08:30', availableSeats: 50, price: 1200 },
  { routeId: 1, departureTime: '22:00', arrivalTime: '10:30', availableSeats: 50, price: 1200 },
  { routeId: 2, departureTime: '19:00', arrivalTime: '07:30', availableSeats: 50, price: 1200 },
  { routeId: 2, departureTime: '21:00', arrivalTime: '09:30', availableSeats: 50, price: 1200 },
  { routeId: 3, departureTime: '22:00', arrivalTime: '04:15', availableSeats: 50, price: 800 },
  { routeId: 3, departureTime: '23:30', arrivalTime: '05:45', availableSeats: 50, price: 800 },
  { routeId: 4, departureTime: '21:30', arrivalTime: '03:45', availableSeats: 50, price: 800 },
  { routeId: 4, departureTime: '23:00', arrivalTime: '05:15', availableSeats: 50, price: 800 },
  { routeId: 5, departureTime: '16:00', arrivalTime: '10:45', availableSeats: 50, price: 1500 },
  { routeId: 5, departureTime: '18:00', arrivalTime: '12:45', availableSeats: 50, price: 1500 }
];

(async () => {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log('🔄 Syncing models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');

    console.log('🔄 Creating routes...');
    for (const routeData of sampleRoutes) {
      await Route.create(routeData);
    }
    console.log(`✅ Created ${sampleRoutes.length} routes`);

    console.log('🔄 Creating schedules...');
    for (const scheduleData of sampleSchedules) {
      await Schedule.create(scheduleData);
    }
    console.log(`✅ Created ${sampleSchedules.length} schedules`);

    console.log('🎉 Database populated successfully!');
    console.log(`📊 Total Routes: ${sampleRoutes.length}`);
    console.log(`📅 Total Schedules: ${sampleSchedules.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database population failed:', error);
    process.exit(1);
  }
})();
