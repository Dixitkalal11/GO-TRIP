# Firebase Setup Guide

## 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file

## 2. Backend Configuration

### Option A: Using Service Account Key File (Development)

1. Place the downloaded JSON file in the backend root directory
2. Rename it to `firebase-service-account.json`
3. Update `firebase-config.js`:

```javascript
const serviceAccount = require('./firebase-service-account.json');
firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

### Option B: Using Environment Variables (Production)

1. Add these environment variables to your `.env` file:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

2. Update `firebase-config.js` to use environment variables (already configured)

## 3. Frontend Firebase Configuration

Make sure your frontend has Firebase configured in `src/app/config/database.js` or similar file.

## 4. Testing

1. Start your backend server: `npm run dev`
2. Test regular login/register endpoints
3. Test Google login with Firebase token verification

## 5. Database Migration

Run this SQL to add new columns to your users table:

```sql
ALTER TABLE Users ADD COLUMN firebaseUid VARCHAR(255) UNIQUE;
ALTER TABLE Users ADD COLUMN profilePicture VARCHAR(500);
ALTER TABLE Users MODIFY COLUMN password VARCHAR(255) NULL;
```

Or use Sequelize migration:

```bash
npx sequelize-cli migration:generate --name add-firebase-fields
```

Then update the migration file and run:

```bash
npx sequelize-cli db:migrate
```














