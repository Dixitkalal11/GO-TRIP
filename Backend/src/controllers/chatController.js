const { sequelize } = require('../models');

// AI Chat Response Handler
exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user?.id || null;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userMessage = message.toLowerCase().trim();

    // Handle special commands
    if (userMessage.includes('my bookings') || userMessage.includes('show bookings') || userMessage.includes('view bookings')) {
      return await handleBookingsQuery(req, res, userId);
    }
    
    if (userMessage.includes('coin balance') || userMessage.includes('check balance') || userMessage.includes('my coins')) {
      return await handleCoinBalanceQuery(req, res, userId);
    }

    // Get user context if logged in
    let userContext = '';
    if (userId) {
      try {
        const [userRows] = await sequelize.query(
          'SELECT name, email, coins FROM users WHERE id = ? LIMIT 1',
          { replacements: [userId], type: sequelize.QueryTypes.SELECT }
        );
        if (userRows) {
          userContext = `User: ${userRows.name}, Email: ${userRows.email}, Coins: ${userRows.coins}. `;
        }
      } catch (err) {
        console.error('Error fetching user context:', err);
      }
    }

    // Intelligent response based on keywords and context
    const replyData = generateAIResponse(userMessage, userContext, userId);
    const reply = typeof replyData === 'string' ? { reply: replyData } : replyData;

    // Log conversation for analytics
    try {
      await sequelize.query(
        `INSERT INTO chat_logs (user_id, message, response, created_at) 
         VALUES (?, ?, ?, NOW())`,
        {
          replacements: [userId, message, typeof reply === 'string' ? reply : reply.reply || JSON.stringify(reply)],
          type: sequelize.QueryTypes.INSERT
        }
      );
    } catch (err) {
      // Table might not exist, ignore for now
      console.log('Chat log table not available:', err.message);
    }

    res.json(reply);
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      reply: 'I apologize, but I encountered an error. Please try again or contact support at support@gotrip.com'
    });
  }
};

// AI Response Generator
function generateAIResponse(message, userContext, userId) {
    // Booking related queries
    if (message.includes('book') || message.includes('booking') || message.includes('ticket')) {
      if (message.includes('how') || message.includes('process')) {
        return {
          reply: `To book a ticket on GoTrip:
1. Click on "Booking" in the navigation menu
2. Select your travel mode (Bus, Train, or Plane)
3. Enter your travel details (from, to, date, passengers)
4. Choose your preferred option
5. Select seats and complete payment

You can also use coins for discounts! ${userContext ? `You currently have ${userContext.match(/Coins: (\d+)/)?.[1] || 0} coins available.` : ''}

Need help with a specific step? Just ask! 😊`,
          actions: [
            { label: 'Start Booking', action: 'book', type: 'booking', value: '/booking' }
          ],
          suggestions: [
            'What payment methods do you accept?',
            'How do coins work?',
            'Can I cancel my booking?'
          ]
        };
    }
    if (message.includes('cancel')) {
      return {
        reply: `To cancel a booking:
1. Go to "My Bookings" page
2. Find your booking
3. Click "Cancel Ticket" button
4. Provide cancellation reason (optional)

Note: Cancellation fee is 10% of ticket price (maximum ₹500). Refund will be processed within 10 days.

${userContext ? `You can view all your bookings in "My Bookings" section.` : ''}`,
        actions: userId ? [
          { label: 'View My Bookings', action: 'view', type: 'booking', value: '/my-bookings' }
        ] : [
          { label: 'Login', action: 'link', type: 'link', value: '/login' }
        ]
      };
    }
    return {
      reply: `I can help you with bookings! You can:
• Book tickets for Bus, Train, or Plane
• View your bookings in "My Bookings"
• Cancel bookings (10% fee applies)
• Download ticket PDFs
• Get tickets via email

Would you like help with any specific booking?`,
      actions: [
        { label: 'Book Ticket', action: 'book', type: 'booking', value: '/booking' },
        ...(userId ? [{ label: 'My Bookings', action: 'view', type: 'booking', value: '/my-bookings' }] : [])
      ]
    };
  }

  // Payment related
  if (message.includes('payment') || message.includes('pay') || message.includes('money')) {
    return {
      reply: `Payment options on GoTrip:
• Credit/Debit Cards
• UPI (Google Pay, PhonePe, Paytm, etc.)
• Wallets

All payments are secure and processed instantly. After successful payment, you'll receive:
• Booking confirmation
• Ticket PDF via email
• Coins as reward (2% of booking amount)

Need help with payment issues? Contact support@gotrip.com`,
      actions: [
        { label: 'Book Ticket', action: 'book', type: 'booking', value: '/booking' }
      ]
    };
  }

  // Coins related
  if (message.includes('coin') || message.includes('reward') || message.includes('discount')) {
    return {
      reply: `About GoTrip Coins:
• Earn 2% of booking amount (max 50 coins per booking)
• Use coins for discounts on future bookings
• Maximum coins per trip depends on your booking history
${userContext ? `\nYour current balance: ${userContext.match(/Coins: (\d+)/)?.[1] || 0} coins` : ''}

Coins are automatically added after booking completion. You can use them during payment to get discounts!

Want to know more about coin usage?`,
      actions: userId ? [
        { label: 'Check Balance', action: 'function', type: 'function', value: 'Check my coin balance' },
        { label: 'Book Ticket', action: 'book', type: 'booking', value: '/booking' }
      ] : [
        { label: 'Login', action: 'link', type: 'link', value: '/login' }
      ]
    };
  }

  // Ticket/PDF related
  if (message.includes('ticket') || message.includes('pdf') || message.includes('download')) {
    return {
      reply: `To get your ticket:
1. Go to "My Bookings"
2. Find your confirmed booking
3. Click "Download PDF" to save locally
4. Or click "Send to Email" to receive it via email

Tickets include all booking details, passenger info, and travel itinerary.

Need help accessing your tickets?`,
      actions: userId ? [
        { label: 'View My Bookings', action: 'view', type: 'booking', value: '/my-bookings' }
      ] : [
        { label: 'Login', action: 'link', type: 'link', value: '/login' }
      ]
    };
  }

  // Enquiry related
  if (message.includes('enquiry') || message.includes('query') || message.includes('help') || message.includes('support')) {
    return {
      reply: `I'm here to help! You can:

• Ask me about bookings, payments, or tickets
• Get help with your account
• Submit enquiries through "Enquire Now" button
• Contact support: support@gotrip.com
• Phone: +91 123 456 7890

${userId ? `Since you're logged in, I can help with your specific bookings and account details.` : 'You can also login for personalized assistance.'}

What would you like help with?`,
      actions: [
        { label: 'Submit Enquiry', action: 'link', type: 'link', value: '/enquiry' },
        ...(userId ? [] : [{ label: 'Login', action: 'link', type: 'link', value: '/login' }])
      ]
    };
  }

  // Account/Profile related
  if (message.includes('account') || message.includes('profile') || message.includes('login') || message.includes('register')) {
    return {
      reply: `${userId ? 'You are logged in! ' : 'You can '}Manage your account:
• View profile details
• Check booking history
• See transaction history
• Manage coins balance

${userId ? 'You can access your profile from the navigation menu.' : 'Login or register to access all features!'}

Need help with account settings?`,
      actions: userId ? [
        { label: 'View Profile', action: 'link', type: 'link', value: '/profile' },
        { label: 'My Bookings', action: 'view', type: 'booking', value: '/my-bookings' }
      ] : [
        { label: 'Login', action: 'link', type: 'link', value: '/login' },
        { label: 'Register', action: 'link', type: 'link', value: '/register' }
      ]
    };
  }

  // Route/Destination related
  if (message.includes('route') || message.includes('destination') || message.includes('where') || message.includes('city')) {
    return {
      reply: `GoTrip covers routes across India:
• Bus services connecting major cities
• Train bookings for Indian Railways
• Flight bookings for domestic and international routes

To search for available routes:
1. Go to "Booking" section
2. Select Bus/Train/Plane
3. Enter your from and to cities
4. Select travel date
5. View available options

Which route are you looking for?`,
      actions: [
        { label: 'Search Routes', action: 'book', type: 'booking', value: '/booking' }
      ]
    };
  }

  // Pricing related
  if (message.includes('price') || message.includes('cost') || message.includes('fare') || message.includes('cheap')) {
    return {
      reply: `Pricing on GoTrip:
• Prices vary by route, date, and travel mode
• Real-time pricing shown during booking
• Use coins for additional discounts
• Student and senior citizen discounts available

Best way to find prices: Start a booking and see real-time rates for your route.

Want to check prices for a specific route?`,
      actions: [
        { label: 'Check Prices', action: 'book', type: 'booking', value: '/booking' }
      ]
    };
  }

  // Greeting/General
  if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('good morning') || message.includes('good afternoon') || message.includes('good evening')) {
    return {
      reply: `Hello! 👋 Welcome to GoTrip! I'm your AI assistant.

I can help you with:
• Booking tickets (Bus, Train, Plane)
• Payment queries
• Ticket downloads
• Coins and rewards
• Account management
• General enquiries

${userId ? `Great to see you back! How can I assist you today?` : 'What would you like to know?'} 😊`,
      suggestions: [
        'How do I book a ticket?',
        'What payment methods do you accept?',
        'How do coins work?'
      ]
    };
  }

  if (message.includes('thank') || message.includes('thanks')) {
    return {
      reply: `You're welcome! 😊 

If you need anything else, just ask. Safe travels with GoTrip! 🚀`,
      suggestions: [
        'How do I book a ticket?',
        'View my bookings',
        'Check coin balance'
      ]
    };
  }

  // Default intelligent response
  return {
    reply: `I understand you're asking about: "${message}"

I can help you with:
• Booking tickets and managing reservations
• Payment and pricing information
• Downloading tickets and PDFs
• Using coins and rewards
• Account and profile management
• Route and destination queries

${userContext ? `Since you're logged in, I can provide personalized assistance with your bookings.` : 'Login for more personalized help!'}

Could you be more specific? I'm here to help! 😊`,
    suggestions: [
      'How do I book a ticket?',
      'What payment methods do you accept?',
      'How do coins work?'
    ],
    actions: !userId ? [
      { label: 'Login', action: 'link', type: 'link', value: '/login' },
      { label: 'Book Ticket', action: 'book', type: 'booking' }
    ] : [
      { label: 'View My Bookings', action: 'view', type: 'booking', value: '/my-bookings' },
      { label: 'Book Ticket', action: 'book', type: 'booking', value: '/booking' }
    ]
  };
}

// Handle bookings query
async function handleBookingsQuery(req, res, userId) {
  if (!userId) {
    return res.json({
      reply: 'Please login to view your bookings.',
      actions: [
        { label: 'Login', action: 'link', type: 'link', value: '/login' }
      ]
    });
  }

  try {
    const [bookings] = await sequelize.query(`
      SELECT id, bookingId, fromCity, toCity, travelDate, travelMode, operator, price, status, createdAt
      FROM bookings 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT 10
    `, {
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT
    });

    if (!bookings || bookings.length === 0) {
      return res.json({
        reply: 'You don\'t have any bookings yet. Would you like to book a ticket?',
        type: 'card',
        actions: [
          { label: 'Book Ticket', action: 'book', type: 'booking', value: '/booking' }
        ]
      });
    }

    const confirmed = bookings.filter(b => b.status === 'confirmed');
    let replyText = `You have ${bookings.length} booking(s). Here are your ${confirmed.length > 0 ? 'upcoming' : 'recent'} trips:\n\n`;
    
    confirmed.slice(0, 3).forEach((booking, index) => {
      replyText += `${index + 1}. ${booking.fromCity} → ${booking.toCity}\n`;
      replyText += `   Date: ${booking.travelDate}\n`;
      replyText += `   Mode: ${booking.travelMode}\n`;
      replyText += `   Status: ${booking.status}\n\n`;
    });

    return res.json({
      reply: replyText,
      type: 'booking',
      bookingData: bookings,
      actions: [
        { label: 'View All Bookings', action: 'view', type: 'booking', value: '/my-bookings' },
        { label: 'Book New Ticket', action: 'book', type: 'booking', value: '/booking' }
      ]
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return res.json({
      reply: 'Unable to fetch your bookings. Please try again later.',
      actions: [
        { label: 'View Bookings', action: 'view', type: 'booking', value: '/my-bookings' }
      ]
    });
  }
}

// Handle coin balance query
async function handleCoinBalanceQuery(req, res, userId) {
  if (!userId) {
    return res.json({
      reply: 'Please login to check your coin balance.',
      actions: [
        { label: 'Login', action: 'link', type: 'link', value: '/login' }
      ]
    });
  }

  try {
    const userRows = await sequelize.query(
      'SELECT coins FROM users WHERE id = ? LIMIT 1',
      { replacements: [userId], type: sequelize.QueryTypes.SELECT }
    );

    const coins = userRows && userRows.length > 0 ? (userRows[0].coins || 0) : 0;
    
    console.log('🪙 Coin balance query for user:', userId, 'Result:', userRows, 'Coins:', coins);

    return res.json({
      reply: `You currently have ${coins} coins! 🪙\n\nUse them for discounts on your next booking.`,
      type: 'card',
      actions: [
        { label: 'Book Ticket', action: 'book', type: 'booking', value: '/booking' },
        { label: 'View Bookings', action: 'view', type: 'booking', value: '/my-bookings' }
      ]
    });
  } catch (err) {
    console.error('Error fetching coin balance:', err);
    return res.json({
      reply: 'Unable to fetch your coin balance. Please try again later.'
    });
  }
}

// Feedback endpoint
exports.chatFeedback = async (req, res) => {
  try {
    const { messageIndex, rating, message } = req.body;
    const userId = req.user?.id || null;

    // Log feedback (optional - can create feedback table)
    console.log('Chat feedback:', { userId, messageIndex, rating, message });

    res.json({ message: 'Feedback received. Thank you!' });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
};

