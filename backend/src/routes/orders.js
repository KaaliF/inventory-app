import { Router } from 'express';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const { paymentType } = req.query;
    const where = {};
    if (paymentType && paymentType !== 'all') {
      where.paymentType = paymentType;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { item: { select: { name: true, itemCode: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format response
    const formatted = orders.map((order) => ({
      id: order.id,
      orderCode: order.orderCode,
      customerName: order.customerName,
      paymentType: order.paymentType,
      total: order.total,
      date: order.createdAt,
      items: order.items.map((oi) => ({
        id: oi.itemId,
        itemCode: oi.item.itemCode,
        name: oi.item.name,
        price: oi.price,
        quantity: oi.quantity,
      })),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { items, paymentType, customerName, bankId } = req.body;

    if (!items || !items.length || !paymentType) {
      return res.status(400).json({ error: 'Items and paymentType required' });
    }

    // Validate stock availability
    for (const orderItem of items) {
      const item = await prisma.item.findUnique({ where: { id: orderItem.id } });
      if (!item) {
        return res.status(400).json({ error: `Item ${orderItem.id} not found` });
      }
      if (item.quantity < orderItem.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${item.name}. Available: ${item.quantity}` });
      }
    }

    // Generate order code
    const orderCount = await prisma.order.count();
    const orderCode = `ORD-${String(orderCount + 1).padStart(4, '0')}`;

    // Transaction: create order + deduct inventory
    const total = items.reduce((sum, oi) => sum + oi.quantity * oi.price, 0);

    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderCode,
          customerName: customerName || 'Walk-in Customer',
          paymentType,
          total,
          bankId: bankId || null,
          userId: req.user.id,
          items: {
            create: items.map((oi) => ({
              quantity: oi.quantity,
              price: oi.price,
              itemId: oi.id,
            })),
          },
        },
        include: {
          items: {
            include: { item: { select: { name: true, itemCode: true } } },
          },
        },
      });

      // Deduct inventory
      for (const oi of items) {
        await tx.item.update({
          where: { id: oi.id },
          data: { quantity: { decrement: oi.quantity } },
        });
      }

      // Auto-create roznamcha entry
      const lastTx = await tx.transaction.findFirst({ orderBy: { createdAt: 'desc' } });
      const lastBalance = lastTx ? lastTx.balance : 0;
      const itemNames = newOrder.items.map((oi) => oi.item.name).join(', ');

      if (paymentType === 'cash') {
        await tx.transaction.create({
          data: {
            type: 'jama',
            category: 'sale',
            description: `Sale: ${itemNames} (${newOrder.orderCode})`,
            partyName: customerName || 'Walk-in Customer',
            amount: total,
            balance: lastBalance + total,
            paymentMode: 'cash',
            orderId: newOrder.id,
            userId: req.user.id,
          },
        });
      } else if (paymentType === 'bank') {
        let bankName = 'Bank';
        if (bankId) {
          const bank = await tx.bank.findUnique({ where: { id: bankId } });
          if (bank) bankName = bank.name;
        }
        await tx.transaction.create({
          data: {
            type: 'jama',
            category: 'sale',
            description: `Bank Sale (${bankName}): ${itemNames} (${newOrder.orderCode})`,
            partyName: customerName || 'Walk-in Customer',
            amount: total,
            balance: lastBalance + total,
            bankId: bankId || null,
            paymentMode: 'bank',
            orderId: newOrder.id,
            userId: req.user.id,
          },
        });
      } else {
        await tx.transaction.create({
          data: {
            type: 'naam',
            category: 'udhar_diya',
            description: `Udhar Sale: ${itemNames} (${newOrder.orderCode})`,
            partyName: customerName || 'Walk-in Customer',
            amount: total,
            balance: lastBalance - total,
            paymentMode: 'credit',
            orderId: newOrder.id,
            userId: req.user.id,
          },
        });
      }

      return newOrder;
    });

    res.status(201).json({
      id: order.id,
      orderCode: order.orderCode,
      customerName: order.customerName,
      paymentType: order.paymentType,
      total: order.total,
      date: order.createdAt,
      items: order.items.map((oi) => ({
        id: oi.itemId,
        itemCode: oi.item.itemCode,
        name: oi.item.name,
        price: oi.price,
        quantity: oi.quantity,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders/stats
router.get('/stats', async (req, res) => {
  try {
    const orders = await prisma.order.findMany();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const cashOrders = orders.filter((o) => o.paymentType === 'cash');
    const creditOrders = orders.filter((o) => o.paymentType === 'credit');
    const bankOrders = orders.filter((o) => o.paymentType === 'bank');

    res.json({
      totalOrders,
      totalRevenue,
      cashTotal: cashOrders.reduce((sum, o) => sum + o.total, 0),
      cashCount: cashOrders.length,
      creditTotal: creditOrders.reduce((sum, o) => sum + o.total, 0),
      creditCount: creditOrders.length,
      bankTotal: bankOrders.reduce((sum, o) => sum + o.total, 0),
      bankCount: bankOrders.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
