import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from './db.js';

async function seed() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashedPassword, role: 'admin' },
  });
  console.log('Created user:', user.username);

  // Create inventory items
  const items = [
    { itemCode: 'ITM-001', name: 'Laptop', quantity: 25, price: 75000 },
    { itemCode: 'ITM-002', name: 'Mouse', quantity: 100, price: 1500 },
    { itemCode: 'ITM-003', name: 'Keyboard', quantity: 80, price: 3000 },
    { itemCode: 'ITM-004', name: 'Monitor', quantity: 15, price: 35000 },
    { itemCode: 'ITM-005', name: 'USB Cable', quantity: 200, price: 500 },
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { itemCode: item.itemCode },
      update: {},
      create: item,
    });
    console.log('Created item:', item.name);
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
