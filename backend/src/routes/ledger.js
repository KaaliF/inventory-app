import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `ledger-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  },
});

const router = Router();
router.use(authMiddleware);

// GET /api/ledger?date=2026-04-26
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

// POST /api/ledger — manual entry with optional attachment
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const { type, category, description, partyName, amount, laborId, bankId, paymentMode } = req.body;

    console.log('Ledger POST body:', req.body, 'file:', req.file?.filename);

    if (!type || !category || !description || !amount) {
      return res.status(400).json({ error: 'type, category, description, and amount required' });
    }

    // Get last balance
    const lastTx = await prisma.transaction.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const lastBalance = lastTx ? lastTx.balance : 0;
    const parsedAmount = Number(amount);
    const newBalance = type === 'jama' ? lastBalance + parsedAmount : lastBalance - parsedAmount;

    const attachment = req.file ? `/uploads/${req.file.filename}` : null;

    const transaction = await prisma.transaction.create({
      data: {
        type,
        category,
        description,
        partyName: partyName || '—',
        amount: parsedAmount,
        balance: newBalance,
        laborId: laborId || null,
        bankId: bankId || null,
        paymentMode: paymentMode || 'cash',
        attachment,
        userId: req.user.id,
      },
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error('Ledger POST error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export default router;
