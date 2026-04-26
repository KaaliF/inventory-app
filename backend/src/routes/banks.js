import { Router } from 'express';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/banks
router.get('/', async (req, res) => {
  try {
    const banks = await prisma.bank.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(banks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/banks
router.post('/', async (req, res) => {
  try {
    const { name, accountNo } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const bank = await prisma.bank.create({
      data: { name, accountNo: accountNo || null, userId: req.user.id },
    });
    res.status(201).json(bank);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/banks/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, accountNo } = req.body;
    const bank = await prisma.bank.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(accountNo !== undefined && { accountNo: accountNo || null }),
      },
    });
    res.json(bank);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Bank not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/banks/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.bank.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Bank not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
