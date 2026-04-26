import { Router } from 'express';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/labor
router.get('/', async (req, res) => {
  try {
    const labor = await prisma.labor.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(labor);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/labor
router.post('/', async (req, res) => {
  try {
    const { name, phone, dailyRate } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const labor = await prisma.labor.create({
      data: {
        name,
        phone: phone || null,
        dailyRate: dailyRate ? Number(dailyRate) : null,
        userId: req.user.id,
      },
    });
    res.status(201).json(labor);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/labor/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, dailyRate } = req.body;
    const labor = await prisma.labor.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(dailyRate !== undefined && { dailyRate: dailyRate ? Number(dailyRate) : null }),
      },
    });
    res.json(labor);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Labor not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/labor/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.labor.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Labor not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
