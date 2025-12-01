const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Game = require('../models/Game');
const Bet = require('../models/Bet');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get dashboard stats
router.get('/stats', [auth, adminAuth], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalGames = await Game.countDocuments();
    const totalBets = await Bet.countDocuments();
    
    const deposits = await Transaction.aggregate([
      { $match: { type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const withdrawals = await Transaction.aggregate([
      { $match: { type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalUsers,
      activeUsers,
      totalGames,
      totalBets,
      totalDeposits: deposits[0]?.total || 0,
      totalWithdrawals: withdrawals[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users
router.get('/users', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user status
router.put('/users/:id/status', [auth, adminAuth], async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    res.json({ message: 'User status updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending withdrawals
router.get('/withdrawals', [auth, adminAuth], async (req, res) => {
  try {
    const withdrawals = await Transaction.find({
      type: 'withdrawal',
      status: 'pending'
    }).populate('userId', 'username email phone').sort({ createdAt: -1 });

    res.json({ withdrawals });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Process withdrawal
router.put('/withdrawals/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = status;
    await transaction.save();

    // If rejected, refund balance
    if (status === 'rejected') {
      const user = await User.findById(transaction.userId);
      user.balance += transaction.amount;
      await user.save();
    } else if (status === 'completed') {
      const user = await User.findById(transaction.userId);
      user.totalWithdrawal += transaction.amount;
      await user.save();
    }

    res.json({ message: 'Withdrawal processed', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate game result
router.post('/game/result', [auth, adminAuth], async (req, res) => {
  try {
    const { gameId, color, number } = req.body;

    const game = await Game.findOne({ gameId });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Update game result
    game.result = { color, number };
    game.status = 'completed';
    await game.save();

    // Process all bets for this game
    const bets = await Bet.find({ gameId, result: 'pending' });

    for (const bet of bets) {
      let isWin = false;

      if (bet.betType === 'color') {
        if (bet.betValue === color) {
          isWin = true;
        } else if (bet.betValue === 'violet' && (color === 'red' || color === 'green')) {
          isWin = true;
        }
      } else if (bet.betType === 'number' && bet.betValue === number.toString()) {
        isWin = true;
      }

      if (isWin) {
        bet.result = 'win';
        bet.winAmount = bet.amount * bet.multiplier;

        // Update user balance
        const user = await User.findById(bet.userId);
        user.balance += bet.winAmount;
        user.totalWins += 1;
        await user.save();

        // Create win transaction
        const transaction = new Transaction({
          userId: bet.userId,
          type: 'win',
          amount: bet.winAmount,
          status: 'completed',
          description: `Win from game ${gameId}`
        });
        await transaction.save();
      } else {
        bet.result = 'loss';
      }

      await bet.save();
    }

    // Emit result via socket
    const io = req.app.get('io');
    io.emit('gameResult', { gameId, result: game.result });

    res.json({ message: 'Game result generated', game });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all games
router.get('/games', [auth, adminAuth], async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 }).limit(100);
    res.json({ games });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;