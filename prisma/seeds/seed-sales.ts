import { PrismaClient, PaymentMode } from "@prisma/client";
import { calculateSaleTotals } from "@/lib/vat";

export async function seedSales(client: PrismaClient) {
  // Get existing users and products for reference
  const users = await client.user.findMany();
  const products = await client.product.findMany();

  if (users.length === 0 || products.length === 0) {
    console.log("No users or products found. Skipping sales seeding.");
    return;
  }

  const salesData = [
    {
      cashierId: "user_cashier_001", // John Walker
      items: [
        {
          productId: "prod_electronics_001", // Wireless Mouse
          quantity: 2,
          price: 25.99,
        },
        {
          productId: "prod_electronics_002", // Bluetooth Headphones
          quantity: 1,
          price: 45.99,
        },
      ],
      paymentMode: PaymentMode.CARD,
      timestamp: new Date(),
    },
    {
      cashierId: "user_cashier_002", // Charlie Brown
      items: [
        {
          productId: "prod_electronics_004", // Gaming Laptop
          quantity: 1,
          price: 999.99,
        },
      ],
      paymentMode: PaymentMode.CASH,
      timestamp: new Date(),
    },
    {
      cashierId: "user_cashier_001", // John Walker
      items: [
        {
          productId: "prod_electronics_003", // Wireless Keyboard
          quantity: 1,
          price: 39.99,
        },
      ],
      paymentMode: PaymentMode.CRYPTO,
      timestamp: new Date(),
    },
    {
      cashierId: "user_cashier_001", // John Walker
      items: [
        {
          productId: "prod_electronics_001", // Wireless Mouse
          quantity: 1,
          price: 25.99,
        },
      ],
      paymentMode: PaymentMode.CARD,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      cashierId: "user_cashier_002", // Charlie Brown
      items: [
        {
          productId: "prod_electronics_002", // Bluetooth Headphones
          quantity: 1,
          price: 45.99,
        },
      ],
      paymentMode: PaymentMode.CASH,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  ];

  for (const saleData of salesData) {
    // Calculate subtotal
    const subtotal = saleData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Calculate totals with VAT
    const totals = calculateSaleTotals(subtotal);

    // Create the sale
    const sale = await client.sale.create({
      data: {
        cashierId: saleData.cashierId,
        subtotal: totals.subtotal,
        vatAmount: totals.vatAmount,
        vatPercentage: totals.vatPercentage,
        totalAmount: totals.totalAmount,
        paymentMode: saleData.paymentMode,
        createdAt: saleData.timestamp,
        updatedAt: saleData.timestamp,
        items: {
          create: saleData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    console.log(`Sale created: ${sale.id} - $${sale.totalAmount.toFixed(2)} (VAT: $${sale.vatAmount.toFixed(2)})`);

    // Update product quantities
    for (const item of saleData.items) {
      await client.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }
  }

  console.log(`${salesData.length} sales created with VAT calculations`);
} 