# GoTrip - Travel Booking Platform

A full-stack travel booking application built with Angular (Frontend) and Node.js/Express (Backend), supporting bus, train, and flight bookings across India.

## 🚀 Features

- **Multi-Transport Booking**: Book buses, trains, and flights
- **User Authentication**: Secure login/registration with JWT tokens
- **Payment Integration**: Razorpay and Stripe payment gateways
- **Real-time Updates**: Live booking status and notifications
- **Admin Dashboard**: Comprehensive admin panel for managing bookings and users
- **Responsive Design**: Mobile-friendly interface
- **State Management**: Persistent booking state across page refreshes
- **Discount System**: Student and Senior Citizen discounts with coin rewards

## 📁 Project Structure

```
dixit/
├── Frontend/          # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/          # Authentication components
│   │   │   ├── components/    # Reusable components
│   │   │   ├── pages/         # Page components
│   │   │   ├── services/      # Angular services
│   │   │   └── data/          # Static data (routes, cities)
│   │   └── assets/            # Images and static assets
│   └── package.json
│
└── Backend/           # Node.js/Express API
    ├── src/
    │   ├── controllers/   # Request handlers
    │   ├── models/        # Database models
    │   ├── routes/        # API routes
    │   ├── middleware/    # Auth & error handling
    │   └── utils/         # Helper functions
    └── package.json
```

## 🛠️ Technology Stack

### Frontend
- **Angular 20.3** - Frontend framework
- **TypeScript** - Type-safe JavaScript
- **Bootstrap 5** - UI styling
- **RxJS** - Reactive programming
- **Firebase** - Authentication and real-time features

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database (development)
- **MySQL** - Database (production ready)
- **JWT** - Authentication
- **Razorpay/Stripe** - Payment processing
- **Nodemailer** - Email services

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Frontend Setup

```bash
cd Frontend
npm install
npm start
```

The application will be available at `http://localhost:4200`

### Backend Setup

```bash
cd Backend
npm install
npm start
```

The API server will run on `http://localhost:3000` (or port specified in environment)

## 🔧 Configuration

### Frontend Environment
Create environment files in `Frontend/src/environments/`:
- `environment.ts` - Development
- `environment.prod.ts` - Production

### Backend Environment
Create `.env` file in `Backend/`:
```env
PORT=3000
JWT_SECRET=your-secret-key
DATABASE_URL=sqlite:./database.sqlite
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🧪 Testing

### Frontend Tests
```bash
cd Frontend
npm test
```

### Backend Tests
```bash
cd Backend
npm test
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout

### Booking Endpoints
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking

### Payment Endpoints
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment

## 🚢 Deployment

### Frontend (Angular)
```bash
cd Frontend
npm run build
# Deploy dist/go-trip-frontend/browser/ to your hosting service
```

### Backend (Node.js)
```bash
cd Backend
npm start
# Use PM2 or similar process manager for production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- GoTrip Development Team

## 🙏 Acknowledgments

- Angular team for the excellent framework
- Bootstrap for the UI components
- All open-source contributors

