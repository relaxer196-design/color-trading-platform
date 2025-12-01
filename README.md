# Color Trading Platform

A full-featured color trading platform similar to Tiranga with admin panel, real-time game updates, and payment integration.

## Features

### User Features
- 🎨 **Color Trading**: Bet on Red, Green, or Violet colors
- 🔢 **Number Betting**: Bet on numbers 0-9
- 💰 **Wallet System**: Deposit and withdrawal functionality
- 📊 **Game History**: Track all your bets and results
- 🎁 **Referral System**: Earn bonuses by referring friends
- ⚡ **Real-time Updates**: Live game results via Socket.IO

### Admin Features
- 📈 **Dashboard**: View platform statistics
- 👥 **User Management**: Manage users and their status
- 💸 **Withdrawal Management**: Approve/reject withdrawal requests
- 🎮 **Game Control**: Generate game results
- 📊 **Analytics**: Track deposits, withdrawals, and bets

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Payment**: Razorpay
- **Authentication**: JWT
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

## Installation

1. Clone the repository:
```bash
git clone https://github.com/relaxer196-design/color-trading-platform.git
cd color-trading-platform
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Deployment

### Railway
1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

### Vercel (Frontend only)
1. Deploy the `public` folder to Vercel
2. Update API_URL in `app.js` to your backend URL

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Game
- `GET /api/game/current` - Get current game
- `POST /api/game/bet` - Place a bet
- `GET /api/game/history` - Get bet history
- `GET /api/game/results` - Get game results

### Wallet
- `POST /api/wallet/deposit` - Create deposit order
- `POST /api/wallet/verify-deposit` - Verify deposit
- `POST /api/wallet/withdraw` - Request withdrawal
- `GET /api/wallet/transactions` - Get transaction history

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/withdrawals` - Get pending withdrawals
- `PUT /api/admin/withdrawals/:id` - Process withdrawal
- `POST /api/admin/game/result` - Generate game result

## Game Rules

### Color Betting
- **Green**: 2x multiplier
- **Red**: 2x multiplier
- **Violet**: 4.5x multiplier

### Number Betting
- **Any Number (0-9)**: 9x multiplier

### Minimum Bets
- Minimum bet: ₹10
- Minimum deposit: ₹100
- Minimum withdrawal: ₹200

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Rate limiting
- Helmet.js security headers
- Input validation
- CORS protection

## License

MIT License

## Support

For support, email: support@colortrading.com

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

**Note**: This is a demo project. Please ensure compliance with local gambling laws before deploying in production.