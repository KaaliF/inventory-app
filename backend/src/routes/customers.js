import { Router } from 'express';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/customers
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/customers
router.post('/', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const customer = await prisma.customer.create({
      data: {
        name,
        phone: phone || null,
        address: address || null,
        userId: req.user.id,
      },
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(address !== undefined && { address: address || null }),
      },
    });
    res.json(customer);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Customer not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/customers/:id/transactions
router.get('/:id/transactions', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { customerId: req.params.id },
      orderBy: { createdAt: 'desc' },
      include: { item: true },
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Customer not found' });
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
