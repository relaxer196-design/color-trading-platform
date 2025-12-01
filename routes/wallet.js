const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Manual deposit (Admin will approve)
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount, upiId, transactionId } = req.body;

    if (amount < 100) {
      return res.status(400).json({ message: 'Minimum deposit is ₹100' });
    }

    const transaction = new Transaction({
      userId: req.user.id,
      type: 'deposit',
      amount,
      transactionId: transactionId || `DEP${Date.now()}`,
      status: 'pending',
      description: `Deposit request - UPI: ${upiId || 'N/A'}`
    });

    await transaction.save();

    res.json({ 
      message: 'Deposit request submitted. Admin will approve shortly.',
      transaction 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add balance manually (for testing - remove in production)
router.post('/add-balance', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount < 10 || amount > 10000) {
      return res.status(400).json({ message: 'Amount must be between ₹10 and ₹10,000' });
    }

    const user = await User.findById(req.user.id);
    user.balance += amount;
    user.totalDeposit += amount;
    await user.save();

    const transaction = new Transaction({
      userId: req.user.id,
      type: 'deposit',
      amount,
      status: 'completed',
      description: 'Manual balance addition'
    });

    await transaction.save();

    res.json({ 
      message: 'Balance added successfully', 
      balance: user.balance 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request withdrawal
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, upiId, accountNumber } = req.body;

    if (amount < 200) {
      return res.status(400).json({ message: 'Minimum withdrawal is ₹200' });
    }

    const user = await User.findById(req.user.id);
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const transaction = new Transaction({
      userId: req.user.id,
      type: 'withdrawal',
      amount,
      status: 'pending',
      description: `Withdrawal to ${upiId || accountNumber || 'Bank Account'}`
    });

    await transaction.save();

    // Deduct balance
    user.balance -= amount;
    await user.save();

    res.json({ 
      message: 'Withdrawal request submitted. Admin will process shortly.', 
      transaction 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transaction history
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;