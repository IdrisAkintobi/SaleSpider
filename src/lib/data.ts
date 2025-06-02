import type { Product, Sale, User, UserStatus } from "./types";

// Mock Users
export const DUMMY_USERS: User[] = [
  {
    id: "admin_001",
    name: "Super Admin",
    username: "super_admin",
    role: "SUPER_ADMIN",
    status: "Active",
  },
  {
    id: "manager_001",
    name: "Idris Akintobi",
    username: "idrisakintobi",
    role: "MANAGER",
    status: "Active",
  },
  {
    id: "user_cashier_001",
    name: "John Walker",
    username: "cashier1",
    role: "CASHIER",
    status: "Active",
  },
  {
    id: "user_cashier_002",
    name: "Charlie Brown",
    username: "cashier2",
    role: "CASHIER",
    status: "Active",
  },
  {
    id: "user_cashier_003",
    name: "Diana Prince",
    username: "cashier3",
    role: "CASHIER",
    status: "Inactive",
  },
];

// Mock Products
export const DUMMY_PRODUCTS: Product[] = [
  {
    id: "prod_electronics_001",
    name: "Wireless Mouse",
    price: 25.99,
    quantity: 150,
    lowStockMargin: 20,
    imageUrl: "https://placehold.co/300x300.png?text=Mouse",
    dateAdded: new Date("2023-01-15T09:30:00Z").getTime(),
  },
  {
    id: "prod_electronics_002",
    name: "Mechanical Keyboard",
    price: 75.0,
    quantity: 80,
    lowStockMargin: 10,
    imageUrl: "https://placehold.co/300x300.png?text=Keyboard",
    dateAdded: new Date("2023-01-20T11:00:00Z").getTime(),
  },
  {
    id: "prod_office_001",
    name: "Ergonomic Chair",
    price: 250.5,
    quantity: 30,
    lowStockMargin: 5,
    imageUrl: "https://placehold.co/300x300.png?text=Chair",
    dateAdded: new Date("2023-02-10T14:15:00Z").getTime(),
  },
  {
    id: "prod_books_001",
    name: "The Art of Programming",
    price: 45.99,
    quantity: 120,
    lowStockMargin: 15,
    imageUrl: "https://placehold.co/300x300.png?text=Book",
    dateAdded: new Date("2023-03-01T16:45:00Z").getTime(),
  },
  {
    id: "prod_electronics_003",
    name: "USB-C Hub",
    price: 39.99,
    quantity: 5, // Example of low stock
    lowStockMargin: 10,
    imageUrl: "https://placehold.co/300x300.png?text=Hub",
    dateAdded: new Date("2023-03-05T10:00:00Z").getTime(),
  },
];

// Mock Sales
export const DUMMY_SALES: Sale[] = [
  {
    id: "sale_001",
    cashierId: DUMMY_USERS[1].id, // John Walker
    cashierName: DUMMY_USERS[1].name,
    items: [
      {
        productId: DUMMY_PRODUCTS[0].id,
        productName: DUMMY_PRODUCTS[0].name,
        quantity: 2,
        price: DUMMY_PRODUCTS[0].price,
      },
      {
        productId: DUMMY_PRODUCTS[1].id,
        productName: DUMMY_PRODUCTS[1].name,
        quantity: 1,
        price: DUMMY_PRODUCTS[1].price,
      },
    ],
    totalAmount: 2 * 25.99 + 75.0,
    timestamp: new Date("2023-05-01T10:30:00Z").getTime(),
    paymentMode: "Card",
  },
  {
    id: "sale_002",
    cashierId: DUMMY_USERS[2].id, // Charlie Brown
    cashierName: DUMMY_USERS[2].name,
    items: [
      {
        productId: DUMMY_PRODUCTS[3].id,
        productName: DUMMY_PRODUCTS[3].name,
        quantity: 1,
        price: DUMMY_PRODUCTS[3].price,
      },
    ],
    totalAmount: 45.99,
    timestamp: new Date("2023-05-01T12:15:00Z").getTime(),
    paymentMode: "Cash",
  },
  {
    id: "sale_003",
    cashierId: DUMMY_USERS[1].id, // John Walker
    cashierName: DUMMY_USERS[1].name,
    items: [
      {
        productId: DUMMY_PRODUCTS[2].id,
        productName: DUMMY_PRODUCTS[2].name,
        quantity: 1,
        price: DUMMY_PRODUCTS[2].price,
      },
    ],
    totalAmount: 250.5,
    timestamp: new Date("2023-05-02T15:00:00Z").getTime(),
    paymentMode: "Crypto",
  },
  // Add more sales for weekly/daily performance
  {
    id: "sale_004",
    cashierId: DUMMY_USERS[1].id,
    cashierName: DUMMY_USERS[1].name,
    items: [
      {
        productId: DUMMY_PRODUCTS[0].id,
        productName: DUMMY_PRODUCTS[0].name,
        quantity: 1,
        price: DUMMY_PRODUCTS[0].price,
      },
    ],
    totalAmount: 25.99,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).getTime(), // 2 days ago
    paymentMode: "Card",
  },
  {
    id: "sale_005",
    cashierId: DUMMY_USERS[2].id,
    cashierName: DUMMY_USERS[2].name,
    items: [
      {
        productId: DUMMY_PRODUCTS[1].id,
        productName: DUMMY_PRODUCTS[1].name,
        quantity: 1,
        price: DUMMY_PRODUCTS[1].price,
      },
    ],
    totalAmount: 75.0,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).getTime(), // 1 day ago
    paymentMode: "Cash",
  },
];

// Utility functions to interact with mock data

// Users
export const findUserByUsername = (username: string): User | undefined =>
  DUMMY_USERS.find((user) => user.username === username);

export const getAllUsers = (): User[] => DUMMY_USERS;

export const updateUserStatus = (id: string, status: UserStatus): boolean => {
  const userIndex = DUMMY_USERS.findIndex((user) => user.id === id);
  if (userIndex !== -1) {
    DUMMY_USERS[userIndex].status = status;
    return true;
  }
  return false;
};

// Products
export const getAllProducts = (): Product[] => DUMMY_PRODUCTS;

export const getProductById = (id: string): Product | undefined =>
  DUMMY_PRODUCTS.find((p) => p.id === id);

export const addProduct = (
  product: Omit<Product, "id" | "dateAdded">
): Product => {
  const newProduct: Product = {
    ...product,
    id: `prod_new_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    dateAdded: Date.now(),
    imageUrl:
      product.imageUrl ??
      `https://placehold.co/300x300.png?text=${encodeURIComponent(
        product.name
      )}`,
  };
  DUMMY_PRODUCTS.unshift(newProduct); // Add to the beginning
  return newProduct;
};

export const updateProductStock = (
  id: string,
  newQuantity: number
): boolean => {
  const productIndex = DUMMY_PRODUCTS.findIndex((p) => p.id === id);
  if (productIndex !== -1) {
    DUMMY_PRODUCTS[productIndex].quantity += newQuantity;
    return true;
  }
  return false;
};

// Sales
export const getAllSales = (): Sale[] => DUMMY_SALES;

export const getSalesByCashierId = (cashierId: string): Sale[] =>
  DUMMY_SALES.filter((sale) => sale.cashierId === cashierId);

export const recordSale = (saleData: Omit<Sale, "id" | "timestamp">): Sale => {
  const newSale: Sale = {
    ...saleData,
    id: `sale_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    timestamp: Date.now(),
  };

  // Update product stock
  newSale.items.forEach((item) => {
    const product = getProductById(item.productId);
    if (product) {
      updateProductStock(item.productId, product.quantity - item.quantity);
    }
  });

  DUMMY_SALES.unshift(newSale); // Add to the beginning
  return newSale;
};
