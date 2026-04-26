import { Router } from 'express';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/inventory
router.get('/', async (req, res) => {
  try {
    const items = await prisma.item.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/inventory
router.post('/', async (req, res) => {
  try {
    const { name, quantity, price, unit } = req.body;
    if (!name || quantity == null || price == null) {
      return res.status(400).json({ error: 'Name, quantity, and price required' });
    }

    // Generate item code
    const count = await prisma.item.count();
    const itemCode = `ITM-${String(count + 1).padStart(3, '0')}`;

    const item = await prisma.item.create({
      data: { itemCode, name, quantity: Number(quantity), price: Number(price), unit: unit || 'qty' },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/inventory/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, quantity, price, unit } = req.body;
    const item = await prisma.item.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(quantity != null && { quantity: Number(quantity) }),
        ...(price != null && { price: Number(price) }),
        ...(unit && { unit }),
      },
    });
    res.json(item);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Item not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.item.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Item not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
