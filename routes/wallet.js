const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create deposit order
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount < 100) {
      return res.status(400).json({ message: 'Minimum deposit is ₹100' });
    }

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `deposit_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    const transaction = new Transaction({
      userId: req.user.id,
      type: 'deposit',
      amount,
      transactionId: order.id,
      status: 'pending'
    });

    await transaction.save();

    res.json({ order, transactionId: transaction._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify deposit
router.post('/verify-deposit', auth, async (req, res) => {
  try {
    const { transactionId, paymentId } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update transaction
    transaction.status = 'completed';
    transaction.transactionId = paymentId;
    await transaction.save();

    // Update user balance
    const user = await User.findById(req.user.id);
    user.balance += transaction.amount;
    user.totalDeposit += transaction.amount;
    await user.save();

    res.json({ message: 'Deposit successful', balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request withdrawal
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount } = req.body;

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
      description: 'Withdrawal request'
    });

    await transaction.save();

    // Deduct balance
    user.balance -= amount;
    await user.save();

    res.json({ message: 'Withdrawal request submitted', transaction });
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

module.exports = router;