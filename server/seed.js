require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const Segment = require('./models/Segment');

const customers = [
  { name: 'Aarav Sharma', email: 'aarav@example.com', phone: '+919876543210', totalSpend: 12500, orderCount: 5, lastOrderDate: new Date('2026-06-10') },
  { name: 'Priya Patel', email: 'priya@example.com', phone: '+919876543211', totalSpend: 8200, orderCount: 3, lastOrderDate: new Date('2026-06-08') },
  { name: 'Vikram Singh', email: 'vikram@example.com', phone: '+919876543212', totalSpend: 450, orderCount: 1, lastOrderDate: new Date('2026-03-15') },
  { name: 'Neha Gupta', email: 'neha@example.com', phone: '+919876543213', totalSpend: 22000, orderCount: 8, lastOrderDate: new Date('2026-06-12') },
  { name: 'Raj Malhotra', email: 'raj@example.com', phone: '+919876543214', totalSpend: 3100, orderCount: 2, lastOrderDate: new Date('2026-05-20') },
  { name: 'Ananya Reddy', email: 'ananya@example.com', phone: '+919876543215', totalSpend: 6700, orderCount: 4, lastOrderDate: new Date('2026-06-05') },
  { name: 'Kabir Joshi', email: 'kabir@example.com', phone: '+919876543216', totalSpend: 150, orderCount: 1, lastOrderDate: new Date('2026-01-10') },
  { name: 'Diya Iyer', email: 'diya@example.com', phone: '+919876543217', totalSpend: 9800, orderCount: 6, lastOrderDate: new Date('2026-06-11') },
  { name: 'Arjun Nair', email: 'arjun@example.com', phone: '+919876543218', totalSpend: 1500, orderCount: 2, lastOrderDate: new Date('2026-04-01') },
  { name: 'Meera Bose', email: 'meera@example.com', phone: '+919876543219', totalSpend: 5400, orderCount: 3, lastOrderDate: new Date('2026-06-02') },
  { name: 'Rohan Das', email: 'rohan@example.com', phone: '+919876543220', totalSpend: 17500, orderCount: 7, lastOrderDate: new Date('2026-06-13') },
  { name: 'Simran Kaur', email: 'simran@example.com', phone: '+919876543221', totalSpend: 2800, orderCount: 2, lastOrderDate: new Date('2026-05-10') },
  { name: 'Aditya Verma', email: 'aditya@example.com', phone: '+919876543222', totalSpend: 950, orderCount: 1, lastOrderDate: new Date('2026-02-20') },
  { name: 'Ishita Mehta', email: 'ishita@example.com', phone: '+919876543223', totalSpend: 14200, orderCount: 5, lastOrderDate: new Date('2026-06-09') },
  { name: 'Karan Chopra', email: 'karan@example.com', phone: '+919876543224', totalSpend: 7600, orderCount: 4, lastOrderDate: new Date('2026-06-07') },
  { name: 'Abhishak Chaturvedi', email: 'abhishak1305@gmail.com', phone: '+919319967828', totalSpend: 50000, orderCount: 8, lastOrderDate: new Date('2026-06-12') }
];

async function seed() {
  await connectDB();

  // Clear existing data
  await Customer.deleteMany({});
  await Order.deleteMany({});
  await Segment.deleteMany({});

  console.log('Cleared existing data.');

  // Insert customers
  const insertedCustomers = await Customer.insertMany(customers);
  console.log(`Inserted ${insertedCustomers.length} customers.`);

  // Generate orders for each customer
  const orders = [];
  for (const c of insertedCustomers) {
    const orderCount = c.orderCount;
    const avgAmount = c.totalSpend / orderCount;

    for (let i = 0; i < orderCount; i++) {
      const daysAgo = Math.floor(Math.random() * 180);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);

      orders.push({
        customerId: c._id,
        amount: Math.round(avgAmount + (Math.random() - 0.5) * avgAmount * 0.4),
        items: ['Kurta Set', 'Sneakers', 'Watch', 'Handbag', 'Perfume', 'Sunglasses'][Math.floor(Math.random() * 6)],
        status: 'completed',
        orderDate
      });
    }
  }

  await Order.insertMany(orders);
  console.log(`Inserted ${orders.length} orders.`);

  // Create default segments
  await Segment.insertMany([
    { name: 'VIP Customers', description: 'Shoppers who spent more than ₹10,000', rules: { minSpend: 10000 }, customerCount: insertedCustomers.filter(c => c.totalSpend >= 10000).length },
    { name: 'Inactive Shoppers', description: 'No order in the last 60 days', rules: { inactiveDays: 60 }, customerCount: insertedCustomers.filter(c => { const d = new Date(); d.setDate(d.getDate() - 60); return c.lastOrderDate < d; }).length },
    { name: 'Recent Buyers', description: 'Ordered in the last 14 days', rules: { lastOrderDaysAgo: 14 }, customerCount: insertedCustomers.filter(c => { const d = new Date(); d.setDate(d.getDate() - 14); return c.lastOrderDate >= d; }).length }
  ]);
  console.log('Created default segments.');

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
