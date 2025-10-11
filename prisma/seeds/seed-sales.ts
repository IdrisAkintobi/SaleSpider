import { PrismaClient, PaymentMode } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { calculateSaleTotals } from '@/lib/vat'

// Sales patterns for realistic data
const PAYMENT_MODE_WEIGHTS = {
  [PaymentMode.CASH]: 0.4, // 40%
  [PaymentMode.CARD]: 0.35, // 35%
  [PaymentMode.BANK_TRANSFER]: 0.15, // 15%
  [PaymentMode.CRYPTO]: 0.05, // 5%
  [PaymentMode.OTHER]: 0.05, // 5%
}

const HOUR_WEIGHTS = {
  // Business hours with peak times
  8: 0.02,
  9: 0.05,
  10: 0.08,
  11: 0.09,
  12: 0.12, // Morning
  13: 0.1,
  14: 0.08,
  15: 0.07,
  16: 0.08,
  17: 0.1, // Afternoon
  18: 0.09,
  19: 0.07,
  20: 0.04,
  21: 0.01, // Evening
}

const DAY_OF_WEEK_WEIGHTS = {
  0: 0.1, // Sunday
  1: 0.14, // Monday
  2: 0.15, // Tuesday
  3: 0.15, // Wednesday
  4: 0.16, // Thursday
  5: 0.15, // Friday
  6: 0.15, // Saturday
}

function getWeightedPaymentMode(): PaymentMode {
  const rand = Math.random()
  let cumulativeWeight = 0

  for (const [mode, weight] of Object.entries(PAYMENT_MODE_WEIGHTS)) {
    cumulativeWeight += weight
    if (rand <= cumulativeWeight) {
      return mode as PaymentMode
    }
  }

  return PaymentMode.CASH // Fallback
}

function getWeightedHour(): number {
  const rand = Math.random()
  let cumulativeWeight = 0

  for (const [hour, weight] of Object.entries(HOUR_WEIGHTS)) {
    cumulativeWeight += weight
    if (rand <= cumulativeWeight) {
      return Number.parseInt(hour)
    }
  }

  return 12 // Fallback to noon
}

function getWeightedDayOfWeek(): number {
  const rand = Math.random()
  let cumulativeWeight = 0

  for (const [day, weight] of Object.entries(DAY_OF_WEEK_WEIGHTS)) {
    cumulativeWeight += weight
    if (rand <= cumulativeWeight) {
      return Number.parseInt(day)
    }
  }

  return 5 // Fallback to Friday
}

function generateSaleTimestamp(startDate: Date, endDate: Date): Date {
  // Generate a completely random date within the range for better distribution
  const randomDate = faker.date.between({ from: startDate, to: endDate })

  // Only apply day-of-week weighting 60% of the time to make distribution more sparse
  if (Math.random() < 0.6) {
    const targetDayOfWeek = getWeightedDayOfWeek()
    const currentDayOfWeek = randomDate.getDay()
    const dayDiff = targetDayOfWeek - currentDayOfWeek

    const adjustedDate = new Date(randomDate)
    adjustedDate.setDate(adjustedDate.getDate() + dayDiff)

    // Ensure the adjusted date is still within range
    if (adjustedDate >= startDate && adjustedDate <= endDate) {
      randomDate.setTime(adjustedDate.getTime())
    }
  }

  // Apply hour weighting only 70% of the time for more natural distribution
  let hour
  if (Math.random() < 0.7) {
    hour = getWeightedHour()
  } else {
    // Use completely random business hour
    hour = faker.number.int({ min: 8, max: 21 })
  }

  const minute = faker.number.int({ min: 0, max: 59 })
  const second = faker.number.int({ min: 0, max: 59 })

  randomDate.setHours(hour, minute, second, 0)

  return randomDate
}

function generateSaleItems(
  products: any[]
): Array<{ productId: string; quantity: number; price: number }> {
  const numItems = faker.number.int({ min: 1, max: 8 }) // 1-8 items per sale
  const selectedProducts = faker.helpers.arrayElements(products, numItems)

  return selectedProducts.map(product => ({
    productId: product.id,
    quantity: faker.number.int({
      min: 1,
      max: Math.min(5, Math.max(1, Math.floor(product.quantity * 0.1))), // Max 10% of stock or 5, whichever is smaller
    }),
    price: product.price, // Use current product price
  }))
}

export async function seedSales(client: PrismaClient, count: number = 12000) {
  console.log(`🚼 Starting to seed ${count} sales spanning 3 months...`)

  // Get users and products for reference
  const cashiers = await client.user.findMany({
    where: {
      OR: [{ role: 'CASHIER' }, { role: 'MANAGER' }],
    },
  })

  const products = await client.product.findMany({
    where: {
      quantity: {
        gt: 0, // Only products with stock
      },
    },
  })

  if (cashiers.length === 0) {
    console.log('❌ No cashiers found. Please seed users first.')
    return
  }

  if (products.length === 0) {
    console.log('❌ No products found. Please seed products first.')
    return
  }

  console.log(
    `👥 Found ${cashiers.length} cashiers and ${products.length} products`
  )

  // Define 3-month date range
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 3)

  console.log(
    `📅 Generating sales from ${startDate.toDateString()} to ${endDate.toDateString()}`
  )

  // Set a consistent seed for reproducible fake data
  faker.seed(54321)

  const batchSize = 20 // Very small batch size for free Neon DB
  let createdCount = 0
  let totalRevenue = 0

  for (let i = 0; i < count; i += batchSize) {
    const currentBatchSize = Math.min(batchSize, count - i)

    try {
      // Create sales within a transaction with increased timeout
      await client.$transaction(
        async tx => {
          for (let j = 0; j < currentBatchSize; j++) {
            const cashier = faker.helpers.arrayElement(cashiers)
            const saleItems = generateSaleItems(products)
            const timestamp = generateSaleTimestamp(startDate, endDate)
            const paymentMode = getWeightedPaymentMode()

            // Calculate subtotal
            const subtotal = saleItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            )

            // Calculate totals with VAT
            const totals = calculateSaleTotals(subtotal)

            // Create the sale
            await tx.sale.create({
              data: {
                cashierId: cashier.id,
                subtotal: totals.subtotal,
                vatAmount: totals.vatAmount,
                vatPercentage: totals.vatPercentage,
                totalAmount: totals.totalAmount,
                paymentMode,
                createdAt: timestamp,
                updatedAt: timestamp,
                items: {
                  create: saleItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                  })),
                },
              },
            })

            totalRevenue += totals.totalAmount
          }
        },
        {
          timeout: 20000, // Increase timeout to 20 seconds
        }
      )

      createdCount += currentBatchSize
      console.log(
        `✅ Created sales ${i + 1}-${i + currentBatchSize} (${createdCount}/${count}) - Revenue: ₦${totalRevenue.toFixed(2)}`
      )

      // Progress update every 500 sales
      if (createdCount % 500 === 0) {
        console.log(
          `🎯 Milestone: ${createdCount} sales created! Total revenue: ₦${totalRevenue.toFixed(2)}`
        )
      }

      // Small delay to prevent overwhelming the database
      if (i % (batchSize * 5) === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error(
        `❌ Error creating sales batch ${i + 1}-${i + currentBatchSize}:`,
        error
      )
      // Continue with next batch instead of stopping
    }
  }

  console.log(`🎉 Successfully created ${createdCount} sales!`)
  console.log(`💰 Total revenue generated: ₦${totalRevenue.toFixed(2)}`)

  // Generate statistics
  console.log('\n📊 Sales Statistics:')

  // Sales by payment method
  const paymentStats = await client.sale.groupBy({
    by: ['paymentMode'],
    _count: { paymentMode: true },
    _sum: { totalAmount: true },
  })

  console.log('\n💳 Payment Method Distribution:')
  paymentStats.forEach(stat => {
    const percentage = ((stat._count.paymentMode / createdCount) * 100).toFixed(
      1
    )
    console.log(
      `  ${stat.paymentMode}: ${stat._count.paymentMode} sales (${percentage}%) - ₦${stat._sum.totalAmount?.toFixed(2) || '0.00'}`
    )
  })

  // Sales by month
  const monthlySales = await client.$queryRaw<
    Array<{ month: Date; sales_count: bigint; total_revenue: number }>
  >`
    SELECT
      DATE_TRUNC('month', "createdAt") as month,
      COUNT(*) as sales_count,
      SUM("totalAmount") as total_revenue
    FROM "Sale"
    WHERE "createdAt" >= ${startDate}
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month;
  `

  console.log('\n📈 Monthly Sales:')
  monthlySales.forEach(month => {
    console.log(
      `  ${month.month.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}: ${month.sales_count} sales - ₦${month.total_revenue.toFixed(2)}`
    )
  })

  // Average sale amount
  const avgSale = totalRevenue / createdCount
  console.log(`\n💵 Average sale amount: ₦${avgSale.toFixed(2)}`)
}
