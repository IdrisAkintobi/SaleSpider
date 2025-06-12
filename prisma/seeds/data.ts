import { ProductCategory } from "@prisma/client";

export const products = [
  {
    id: "prod_electronics_001",
    name: "Wireless Mouse",
    price: 25.99,
    quantity: 150,
    lowStockMargin: 20,
    imageUrl: "https://placehold.co/300x300.png?text=Mouse",
    createdAt: new Date("2025-06-14T09:30:00Z"),
    gtin: "123456789012",
    category: ProductCategory.ELECTRONICS,
    description:
      "A high-precision wireless mouse with ergonomic design and long battery life.",
  },
  {
    id: "prod_electronics_002",
    name: "Bluetooth Headphones",
    price: 45.99,
    quantity: 100,
    lowStockMargin: 15,
    imageUrl: "https://placehold.co/300x300.png?text=Headphones",
    createdAt: new Date("2025-06-14T09:30:00Z"),
    gtin: "987654321098",
    category: ProductCategory.ELECTRONICS,
    description:
      "Noise-canceling Bluetooth headphones with high-quality sound and comfortable fit.",
  },
  {
    id: "prod_electronics_003",
    name: "Wireless Keyboard",
    price: 39.99,
    quantity: 200,
    lowStockMargin: 30,
    imageUrl: "https://placehold.co/300x300.png?text=Keyboard",
    createdAt: new Date("2025-06-13T09:30:00Z"),
    gtin: "112233445566",
    category: ProductCategory.ELECTRONICS,
    description:
      "Compact wireless keyboard with responsive keys and a sleek design for easy typing.",
  },
  {
    id: "prod_electronics_004",
    name: "Gaming Laptop",
    price: 999.99,
    quantity: 50,
    lowStockMargin: 5,
    imageUrl: "https://placehold.co/300x300.png?text=Laptop",
    createdAt: new Date("2025-06-13T09:30:00Z"),
    gtin: "667788990011",
    category: ProductCategory.ELECTRONICS,
    description:
      "High-performance gaming laptop with powerful GPU, fast processor, and large storage capacity.",
  },
];
