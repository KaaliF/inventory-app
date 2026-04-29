import { Router } from 'express';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/vendors
router.post('/', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const vendor = await prisma.vendor.create({
      data: {
        name,
        phone: phone || null,
        address: address || null,
        userId: req.user.id,
      },
    });
    res.status(201).json(vendor);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/vendors/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(address !== undefined && { address: address || null }),
      },
    });
    res.json(vendor);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Vendor not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/vendors/:id/transactions
router.get('/:id/transactions', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { vendorId: req.params.id },
      orderBy: { createdAt: 'desc' },
      include: { item: true },
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/vendors/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.vendor.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Vendor not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
