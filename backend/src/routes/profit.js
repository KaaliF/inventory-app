import { Router } from 'express';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/profit — per-transaction profit
// Each sale transaction gets its own profit row
// Cost price = Item.price from inventory
// Profit = sale amount - (cost price × qty)
router.get('/', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        itemId: { not: null },
        category: 'sale',
      },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    });

    const items = [];
    let totalRevenue = 0;
    let totalCost = 0;

    for (const tx of transactions) {
      if (!tx.item) continue;

      const qty = tx.itemQty || 1;
      const costPrice = tx.item.price;
      const salePrice = tx.amount / qty;
      const cost = costPrice * qty;
      const profit = tx.amount - cost;

      totalRevenue += tx.amount;
      totalCost += cost;

      items.push({
        id: tx.id,
        itemName: tx.item.name,
        itemCode: tx.item.itemCode,
        date: tx.createdAt,
        qty,
        unit: tx.item.unit || 'qty',
        costPrice: Math.round(costPrice * 100) / 100,
        salePrice: Math.round(salePrice * 100) / 100,
        saleAmount: Math.round(tx.amount * 100) / 100,
        profitPerUnit: Math.round((salePrice - costPrice) * 100) / 100,
        totalProfit: Math.round(profit * 100) / 100,
        partyName: tx.partyName,
      });
    }

    res.json({
      items,
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        totalProfit: Math.round((totalRevenue - totalCost) * 100) / 100,
      },
    });
  } catch (err) {
    console.error('Profit route error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
