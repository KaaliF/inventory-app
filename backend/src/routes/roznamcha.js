import { Router } from 'express';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/roznamcha?date=2026-04-26
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;

    let startDate, endDate;
    if (date) {
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate day totals
    const totalJama = transactions
      .filter((t) => t.type === 'jama')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalNaam = transactions
      .filter((t) => t.type === 'naam')
      .reduce((sum, t) => sum + t.amount, 0);

    // Get opening balance (last transaction before this day)
    const previousTx = await prisma.transaction.findFirst({
      where: { createdAt: { lt: startDate } },
      orderBy: { createdAt: 'desc' },
    });
    const openingBalance = previousTx ? previousTx.balance : 0;

    res.json({
      date: startDate.toISOString().split('T')[0],
      openingBalance,
      closingBalance: openingBalance + totalJama - totalNaam,
      totalJama,
      totalNaam,
      transactions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/roznamcha — manual entry (expense, udhar wapsi, etc.)
router.post('/', async (req, res) => {
  try {
    const { type, category, description, partyName, amount } = req.body;

    if (!type || !category || !description || !amount) {
      return res.status(400).json({ error: 'type, category, description, and amount required' });
    }

    // Get last balance
    const lastTx = await prisma.transaction.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const lastBalance = lastTx ? lastTx.balance : 0;
    const newBalance = type === 'jama' ? lastBalance + amount : lastBalance - amount;

    const transaction = await prisma.transaction.create({
      data: {
        type,
        category,
        description,
        partyName: partyName || '—',
        amount,
        balance: newBalance,
        userId: req.user.id,
      },
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
