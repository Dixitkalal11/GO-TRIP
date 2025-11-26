import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface MessageAction {
  label: string;
  action: string;
  type: 'link' | 'function' | 'booking';
  value?: string;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'card' | 'booking' | 'suggestions';
  actions?: MessageAction[];
  suggestions?: string[];
  bookingData?: any;
  rating?: number;
  showFeedback?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.css']
})
export class ChatbotComponent implements OnInit {
  isOpen = false;
  messages: Message[] = [];
  userMessage = '';
  isLoading = false;
  showQuickActions = true;
  showSuggestions = true;
  isRecording = false;

  quickActions = [
    { label: 'Book Ticket', action: 'book', icon: 'bi-ticket' },
    { label: 'My Bookings', action: 'bookings', icon: 'bi-calendar-check' },
    { label: 'Check Balance', action: 'balance', icon: 'bi-wallet2' },
    { label: 'Support', action: 'support', icon: 'bi-headset' }
  ];

  commonQuestions = [
    'How do I book a ticket?',
    'What payment methods do you accept?',
    'How do coins work?',
    'Can I cancel my booking?',
    'How to download ticket?'
  ];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    // Don't load history on init - only when chatbot opens
    this.messages = [];
    this.showQuickActions = true;
    this.showSuggestions = true;
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      // Load conversation history when opening
      this.loadConversationHistory();
      if (this.messages.length === 0) {
        this.addBotMessage("Hi! I'm GoTrip AI Assistant. How can I help you with bookings, tickets, or any questions about our services? 😊", {
          suggestions: this.commonQuestions.slice(0, 3)
        });
      }
      this.showQuickActions = this.messages.length <= 1;
      this.showSuggestions = this.messages.length <= 2;
      // Show quick actions on open
      setTimeout(() => this.scrollToBottom(), 100);
    } else {
      // Clear conversation when closing
      this.messages = [];
      this.showQuickActions = true;
      this.showSuggestions = true;
      localStorage.removeItem('chatbot_history');
    }
  }

  loadConversationHistory() {
    try {
      const saved = localStorage.getItem('chatbot_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.messages = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (e) {
      console.error('Error loading chat history:', e);
    }
  }

  saveConversationHistory() {
    try {
      // Save last 50 messages
      const toSave = this.messages.slice(-50);
      localStorage.setItem('chatbot_history', JSON.stringify(toSave));
    } catch (e) {
      console.error('Error saving chat history:', e);
    }
  }

  addUserMessage(text: string) {
    if (!text.trim()) return;
    
    this.messages.push({
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    });
    this.userMessage = '';
    this.saveConversationHistory();
    this.sendToBackend(text.trim());
  }

  addBotMessage(text: string, options?: { actions?: MessageAction[], suggestions?: string[], bookingData?: any, type?: 'text' | 'card' | 'booking' | 'suggestions' }) {
    const message: Message = {
      text,
      sender: 'bot',
      timestamp: new Date(),
      type: options?.type || 'text',
      actions: options?.actions,
      suggestions: options?.suggestions,
      bookingData: options?.bookingData,
      showFeedback: true
    };
    
    this.messages.push(message);
    this.saveConversationHistory();
    this.scrollToBottom();
  }

  // Format text for display (replace newlines with <br>)
  formatMessageText(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  scrollToBottom() {
    setTimeout(() => {
      const chatMessages = document.querySelector('.chatbot-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }

  sendToBackend(message: string) {
    this.isLoading = true;
    
    // Handle special commands
    const lowerMessage = message.toLowerCase().trim();
    if (lowerMessage.includes('check my coin balance') || lowerMessage === 'check balance' || lowerMessage.includes('my coins')) {
      this.isLoading = false;
      this.getCoinBalance();
      return;
    }
    
    if (lowerMessage.includes('show my bookings') || lowerMessage.includes('my bookings') || lowerMessage.includes('view bookings')) {
      this.isLoading = false;
      this.getUserBookings();
      return;
    }
    
    const token = localStorage.getItem('token');
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    this.http.post('http://localhost:5000/api/chat', {
      message: message,
      conversationHistory: this.messages.slice(-5).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))
    }, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        // Handle rich response with actions/suggestions
        if (response.actions || response.suggestions || response.bookingData) {
          this.addBotMessage(
            response.reply || response.message || response.text,
            {
              actions: response.actions,
              suggestions: response.suggestions,
              bookingData: response.bookingData,
              type: response.type || 'text'
            }
          );
        } else {
          this.addBotMessage(response.reply || response.message || response.text || 'I apologize, but I couldn\'t process that request.');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Chat error:', error);
        this.addBotMessage('I\'m having trouble connecting. Please try again or contact support at support@gotrip.com');
      }
    });
  }

  sendMessage() {
    if (this.userMessage.trim() && !this.isLoading) {
      this.addUserMessage(this.userMessage);
    }
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Quick Actions
  handleQuickAction(action: string) {
    this.showQuickActions = false;
    switch(action) {
      case 'book':
        this.addUserMessage('I want to book a ticket');
        this.router.navigate(['/booking']);
        break;
      case 'bookings':
        this.addUserMessage('Show my bookings');
        this.router.navigate(['/my-bookings']);
        break;
      case 'balance':
        this.addUserMessage('Check my coin balance');
        break;
      case 'support':
        this.addUserMessage('I need support');
        this.router.navigate(['/enquiry']);
        break;
    }
  }

  // Handle action buttons in bot messages
  handleAction(action: MessageAction) {
    switch(action.type) {
      case 'link':
        if (action.value) {
          this.router.navigate([action.value]);
          this.toggleChat(); // Close chat when navigating
        }
        break;
      case 'function':
        if (action.value) {
          this.addUserMessage(action.value);
        }
        break;
      case 'booking':
        if (action.action === 'view') {
          this.router.navigate(['/my-bookings']);
          this.toggleChat();
        } else if (action.action === 'book') {
          this.router.navigate(['/booking']);
          this.toggleChat();
        }
        break;
    }
  }

  // Suggestion click
  sendSuggestion(question: string) {
    this.addUserMessage(question);
  }

  // Feedback/Rating
  rateMessage(messageIndex: number, rating: number) {
    if (this.messages[messageIndex]) {
      this.messages[messageIndex].rating = rating;
      this.saveConversationHistory();
      
      // Send feedback to backend
      const token = localStorage.getItem('token');
      if (token) {
        this.http.post('http://localhost:5000/api/chat/feedback', {
          messageIndex,
          rating,
          message: this.messages[messageIndex].text
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).subscribe();
      }
      
      // Show thank you message
      setTimeout(() => {
        this.addBotMessage('Thank you for your feedback! 😊');
      }, 500);
    }
  }

  // Voice Input (structure)
  toggleVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.addBotMessage('Voice input is not supported in your browser. Please type your message.');
      return;
    }

    this.isRecording = !this.isRecording;
    
    if (this.isRecording) {
      // Initialize speech recognition
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.userMessage = transcript;
        this.isRecording = false;
        this.sendMessage();
      };

      recognition.onerror = () => {
        this.isRecording = false;
        this.addBotMessage('Sorry, I couldn\'t hear you. Please try again or type your message.');
      };

      recognition.onend = () => {
        this.isRecording = false;
      };

      recognition.start();
    }
  }

  // File Upload
  handleFileInput(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // For images, show preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.messages.push({
          text: `[Image: ${file.name}]`,
          sender: 'user',
          timestamp: new Date(),
          type: 'text'
        });
        this.addBotMessage('I received your image. While I can\'t analyze images yet, you can describe what you need help with and I\'ll assist you!');
        this.saveConversationHistory();
      };
      reader.readAsDataURL(file);
    } else {
      this.addBotMessage(`I received your file "${file.name}". For document support, please contact support@gotrip.com`);
    }
  }

  // Get user bookings for integration
  getUserBookings() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.addBotMessage('Please login to view your bookings.');
      return;
    }

    this.isLoading = true;
    this.http.get('http://localhost:5000/api/bookings', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const bookings = response.bookings || [];
        
        if (bookings.length === 0) {
          this.addBotMessage('You don\'t have any bookings yet. Would you like to book a ticket?', {
            actions: [
              { label: 'Book Ticket', action: 'book', type: 'booking', value: '/booking' }
            ]
          });
        } else {
          const upcoming = bookings.filter((b: any) => b.status === 'confirmed').slice(0, 3);
          let bookingText = `You have ${bookings.length} booking(s). Here are your upcoming trips:\n\n`;
          
          upcoming.forEach((booking: any, index: number) => {
            bookingText += `${index + 1}. ${booking.fromCity} → ${booking.toCity}\n`;
            bookingText += `   Date: ${booking.travelDate}\n`;
            bookingText += `   Status: ${booking.status}\n\n`;
          });

          this.addBotMessage(bookingText, {
            actions: [
              { label: 'View All Bookings', action: 'view', type: 'booking', value: '/my-bookings' }
            ],
            bookingData: bookings
          });
        }
      },
      error: () => {
        this.isLoading = false;
        this.addBotMessage('Unable to fetch bookings. Please try again later.');
      }
    });
  }

  // Get coin balance
  getCoinBalance() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.addBotMessage('Please login to check your coin balance.', {
        actions: [
          { label: 'Login', action: 'link', type: 'link', value: '/login' }
        ]
      });
      return;
    }

    this.isLoading = true;
    this.http.get('http://localhost:5000/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        // Profile endpoint returns { user: { coins, ... } }
        const coins = response.user?.coins ?? response.coins ?? 0;
        console.log('💰 Coin balance response:', response, 'Extracted coins:', coins);
        
        let coinMessage = '';
        if (coins === 0) {
          coinMessage = `You currently have ${coins} coins. 🪙\n\nStart booking to earn coins! Each booking earns you 2% of the booking amount (max 50 coins per booking).`;
        } else {
          coinMessage = `You currently have ${coins} coins! 🪙\n\nGreat! Use them for discounts on your next booking.`;
        }
        
        this.addBotMessage(coinMessage, {
          type: 'card',
          actions: [
            { label: 'Book Ticket', action: 'book', type: 'booking', value: '/booking' },
            { label: 'View Bookings', action: 'view', type: 'booking', value: '/my-bookings' }
          ]
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Coin balance error:', error);
        this.addBotMessage('Unable to fetch your coin balance. Please try again later.', {
          actions: [
            { label: 'Try Again', action: 'function', type: 'function', value: 'Check my coin balance' }
          ]
        });
      }
    });
  }
}
