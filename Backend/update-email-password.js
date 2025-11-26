// Script to update email password in .env file
const fs = require('fs');
const path = require('path');

console.log('📧 Email Password Update Script');
console.log('================================');

// Read current .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ .env file found');
} catch (error) {
  console.log('❌ .env file not found');
  process.exit(1);
}

// Check if EMAIL_PASS is still the placeholder
if (envContent.includes('your-app-password-here')) {
  console.log('⚠️  EMAIL_PASS is still set to placeholder value');
  console.log('');
  console.log('📋 To fix this:');
  console.log('1. Get your Gmail app password from: https://myaccount.google.com/security');
  console.log('2. Open the .env file in your text editor');
  console.log('3. Replace "your-app-password-here" with your actual 16-character app password');
  console.log('4. Save the file');
  console.log('5. Run: node test-email.js');
} else {
  console.log('✅ EMAIL_PASS appears to be configured');
  console.log('🧪 Run: node test-email.js to test email sending');
}

console.log('');
console.log('📧 Current email configuration:');
const lines = envContent.split('\n');
lines.forEach(line => {
  if (line.includes('EMAIL_')) {
    if (line.includes('EMAIL_PASS')) {
      console.log(`   ${line.split('=')[0]}=${line.split('=')[1] ? 'Set (hidden)' : 'Not set'}`);
    } else {
      console.log(`   ${line}`);
    }
  }
});





