# Production Payment Setup Guide

## Overview
This guide explains how to deploy the GoTrip application with production Razorpay payment integration, removing all test payment functionality.

## Changes Made

### 1. Frontend Changes
- ✅ Removed test payment button from payment page
- ✅ Removed `testPayment()` method from PaymentComponent
- ✅ Updated Razorpay key to use production key (needs to be configured)

### 2. Backend Changes
- ✅ Removed `createTestBooking` endpoint from booking controller
- ✅ Removed test booking route from booking routes
- ✅ Updated payment controller to use production Razorpay credentials
- ✅ Removed hardcoded test credentials

## Environment Variables Setup

### Backend (.env file)
Create a `.env` file in `backend/go-trip-backend/` with the following variables:

```env
# Razorpay Production Credentials
RAZORPAY_KEY_ID=rzp_live_YOUR_PRODUCTION_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_PRODUCTION_KEY_SECRET

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Database
DB_PATH=./database.sqlite

# Server
PORT=5000
NODE_ENV=production
```

### Frontend Configuration
Update the Razorpay key in `frontend/go-trip-frontend/src/app/pages/payment/payment.ts`:

```typescript
const options: any = {
  key: 'rzp_live_YOUR_PRODUCTION_KEY_ID', // Replace with your production key
  // ... rest of the options
};
```

## Razorpay Production Setup

### 1. Get Production Credentials
1. Log in to your Razorpay Dashboard
2. Go to Settings > API Keys
3. Generate Live API Keys
4. Copy the Key ID and Key Secret

### 2. Update Configuration
1. Replace `rzp_live_YOUR_PRODUCTION_KEY_ID` with your actual production key ID
2. Replace `YOUR_PRODUCTION_KEY_SECRET` with your actual production key secret
3. Update the frontend payment component with the production key ID

## Deployment Steps

### 1. Backend Deployment
```bash
cd backend/go-trip-backend
npm install
# Create .env file with production credentials
npm start
```

### 2. Frontend Deployment
```bash
cd frontend/go-trip-frontend
npm install
ng build --prod
# Deploy the dist folder to your hosting service
```

## Testing Production Payment

### 1. Test with Real Payment
- Use real credit/debit cards for testing
- Test with small amounts first
- Verify payment confirmation emails
- Check booking creation in database

### 2. Monitor Logs
- Check backend logs for payment processing
- Monitor Razorpay dashboard for transactions
- Verify webhook deliveries (if configured)

## Security Considerations

1. **Never commit .env files** to version control
2. **Use strong JWT secrets** in production
3. **Enable HTTPS** for all payment pages
4. **Configure webhooks** for payment status updates
5. **Monitor failed payments** and implement retry logic

## Rollback Plan

If issues occur with production payments:
1. Revert to test mode by updating environment variables
2. Use test Razorpay credentials temporarily
3. Re-enable test payment button if needed for debugging

## Support

For Razorpay integration issues:
- Check Razorpay documentation
- Contact Razorpay support
- Review payment logs in Razorpay dashboard

## Verification Checklist

- [ ] Test payment button removed from frontend
- [ ] Test booking endpoint removed from backend
- [ ] Production Razorpay credentials configured
- [ ] Environment variables set correctly
- [ ] HTTPS enabled for payment pages
- [ ] Payment flow tested
- [ ] Booking creation verified after successful payment
- [ ] Coins awarded correctly after payment









