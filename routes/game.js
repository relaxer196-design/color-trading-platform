const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const Bet = require('../models/Bet');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get current game
router.get('/current', async (req, res) => {
  try {
    const currentGame = await Game.findOne({ status: 'pending' }).sort({ createdAt: -1 });
    
    if (!currentGame) {
      // Create new game
      const period = Date.now();
      const newGame = new Game({
        gameId: `GAME${period}`,
        period,
        startTime: new Date(),
        endTime: new Date(Date.now() + 3 * 60 * 1000) // 3 minutes
      });
      await newGame.save();
      return res.json({ game: newGame });
    }

    res.json({ game: currentGame });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Place bet
router.post('/bet', auth, async (req, res) => {
  try {
    const { gameId, betType, betValue, amount } = req.body;
    const userId = req.user.id;

    // Validate amount
    if (amount < 10) {
      return res.status(400).json({ message: 'Minimum bet is ₹10' });
    }

    // Check user balance
    const user = await User.findById(userId);
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Check if game is still active
    const game = await Game.findOne({ gameId, status: 'pending' });
    if (!game) {
      return res.status(400).json({ message: 'Game has ended' });
    }

    // Calculate multiplier
    let multiplier = 2;
    if (betType === 'color' && betValue === 'violet') {
      multiplier = 4.5;
    } else if (betType === 'number') {
      multiplier = 9;
    }

    // Create bet
    const bet = new Bet({
      userId,
      gameId,
      period: game.period,
      betType,
      betValue,
      amount,
      multiplier
    });

    await bet.save();

    // Deduct balance
    user.balance -= amount;
    user.totalBets += 1;
    await user.save();

    // Update game stats
    game.totalBets += 1;
    game.totalAmount += amount;
    await game.save();

    res.json({ message: 'Bet placed successfully', bet });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get bet history
router.get('/history', auth, async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ bets });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get game results
router.get('/results', async (req, res) => {
  try {
    const results = await Game.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;