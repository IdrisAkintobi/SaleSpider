import { PrismaClient, ProductCategory } from '@prisma/client'
import { faker } from '@faker-js/faker'

// Product categories with realistic NGN pricing
const CATEGORY_PRODUCTS = {
  [ProductCategory.FOOD_AND_BEVERAGES]: {
    prefixes: ['Fresh', 'Organic', 'Premium', 'Classic', 'Artisan'],
    products: [
      'Bread',
      'Milk',
      'Cheese',
      'Yogurt',
      'Coffee',
      'Tea',
      'Juice',
      'Water',
      'Soda',
      'Chips',
      'Cookies',
      'Cereal',
      'Rice',
      'Pasta',
      'Sauce',
    ],
    priceRange: [500, 8500], // ₦500 - ₦8,500
    stockRange: [20, 500],
  },
  [ProductCategory.HOUSEHOLD_ITEMS]: {
    prefixes: ['Ultra', 'Super', 'Heavy Duty', 'Eco-friendly', 'Quick'],
    products: [
      'Detergent',
      'Soap',
      'Shampoo',
      'Towels',
      'Plates',
      'Cups',
      'Cutlery',
      'Vacuum',
      'Mop',
      'Broom',
      'Trash Bags',
      'Toilet Paper',
      'Paper Towels',
    ],
    priceRange: [1200, 35000], // ₦1,200 - ₦35,000
    stockRange: [15, 200],
  },
  [ProductCategory.HEALTH_AND_BEAUTY]: {
    prefixes: ['Professional', 'Natural', 'Advanced', 'Luxury', 'Clinical'],
    products: [
      'Moisturizer',
      'Sunscreen',
      'Lipstick',
      'Foundation',
      'Mascara',
      'Perfume',
      'Toothpaste',
      'Mouthwash',
      'Vitamins',
      'Pain Relief',
      'Bandages',
    ],
    priceRange: [2500, 45000], // ₦2,500 - ₦45,000
    stockRange: [10, 150],
  },
  [ProductCategory.CLOTHING_AND_APPAREL]: {
    prefixes: ['Designer', 'Casual', 'Formal', 'Sport', 'Vintage'],
    products: [
      'T-Shirt',
      'Jeans',
      'Dress',
      'Jacket',
      'Shoes',
      'Socks',
      'Hat',
      'Belt',
      'Scarf',
      'Gloves',
      'Sweater',
      'Shorts',
      'Skirt',
    ],
    priceRange: [3500, 85000], // ₦3,500 - ₦85,000
    stockRange: [5, 100],
  },
  [ProductCategory.ELECTRONICS]: {
    prefixes: [
      'Smart',
      'Wireless',
      'Digital',
      'High-Tech',
      'Pro',
      'Gaming',
      'Business',
      'Professional',
    ],
    products: [
      'Smartphone',
      'iPhone',
      'Samsung Galaxy',
      'Android Phone',
      'Gaming Laptop',
      'Business Laptop',
      'MacBook',
      'Dell Laptop',
      'HP Laptop',
      'Lenovo ThinkPad',
      'iPad',
      'Tablet',
      'Android Tablet',
      'Wireless Headphones',
      'Gaming Headset',
      'AirPods',
      'Bluetooth Speaker',
      'Sound Bar',
      'USB Charger',
      'Wireless Charger',
      'Power Bank',
      'USB Cable',
      'HDMI Cable',
      'Wireless Mouse',
      'Gaming Mouse',
      'Mechanical Keyboard',
      'Wireless Keyboard',
      '4K Monitor',
      'Gaming Monitor',
      'Ultrawide Monitor',
      'LED TV',
      'Smart TV',
      'DSLR Camera',
      'Action Camera',
      'Web Camera',
      'Security Camera',
      'Smartwatch',
      'Fitness Tracker',
      'Apple Watch',
      'Samsung Watch',
    ],
    priceRange: [8500, 2500000], // ₦8,500 - ₦2,500,000 (for high-end laptops/phones)
    stockRange: [2, 50],
  },
  [ProductCategory.TOYS_AND_GAMES]: {
    prefixes: ['Educational', 'Fun', 'Interactive', 'Creative', 'Adventure'],
    products: [
      'Puzzle',
      'Board Game',
      'Action Figure',
      'Doll',
      'Building Blocks',
      'Car',
      'Ball',
      'Bike',
      'Scooter',
      'Art Set',
      'Musical Toy',
    ],
    priceRange: [2500, 75000], // ₦2,500 - ₦75,000
    stockRange: [5, 100],
  },
  [ProductCategory.OFFICE_SUPPLIES]: {
    prefixes: [
      'Professional',
      'Premium',
      'Heavy Duty',
      'Ergonomic',
      'Multi-purpose',
    ],
    products: [
      'Pen',
      'Pencil',
      'Notebook',
      'Folder',
      'Stapler',
      'Calculator',
      'Desk Lamp',
      'Chair',
      'Desk',
      'Printer',
      'Paper',
      'Binder',
    ],
    priceRange: [800, 150000], // ₦800 - ₦150,000
    stockRange: [10, 200],
  },
  [ProductCategory.PET_SUPPLIES]: {
    prefixes: ['Premium', 'Natural', 'Healthy', 'Deluxe', 'Training'],
    products: [
      'Dog Food',
      'Cat Food',
      'Leash',
      'Collar',
      'Toy',
      'Bed',
      'Carrier',
      'Treats',
      'Shampoo',
      'Litter',
      'Bowl',
      'Brush',
    ],
    priceRange: [2000, 40000], // ₦2,000 - ₦40,000
    stockRange: [8, 150],
  },
  [ProductCategory.AUTOMOTIVE]: {
    prefixes: [
      'High Performance',
      'Professional',
      'Heavy Duty',
      'Premium',
      'Universal',
    ],
    products: [
      'Oil',
      'Filter',
      'Tire',
      'Battery',
      'Wiper',
      'Light',
      'Tool Set',
      'Jack',
      'Cleaner',
      'Polish',
      'Mat',
      'Cover',
    ],
    priceRange: [5000, 150000], // ₦5,000 - ₦150,000
    stockRange: [3, 75],
  },
  [ProductCategory.BOOKS_AND_STATIONERY]: {
    prefixes: ['Classic', 'Modern', 'Educational', 'Creative', 'Professional'],
    products: [
      'Novel',
      'Textbook',
      'Journal',
      'Planner',
      'Pen Set',
      'Marker',
      'Highlighter',
      'Eraser',
      'Ruler',
      'Calendar',
      'Sticky Notes',
    ],
    priceRange: [1500, 25000], // ₦1,500 - ₦25,000
    stockRange: [5, 120],
  },
  [ProductCategory.SEASONAL_AND_SPECIAL_OCCASIONS]: {
    prefixes: ['Festive', 'Holiday', 'Celebration', 'Decorative', 'Special'],
    products: [
      'Decoration',
      'Gift Wrap',
      'Card',
      'Candle',
      'Ornament',
      'Lights',
      'Wreath',
      'Garland',
      'Banner',
      'Balloon',
      'Party Supplies',
    ],
    priceRange: [1000, 45000], // ₦1,000 - ₦45,000
    stockRange: [10, 200],
  },
  [ProductCategory.BABY_PRODUCTS]: {
    prefixes: ['Gentle', 'Safe', 'Organic', 'Soft', 'Hypoallergenic'],
    products: [
      'Diaper',
      'Formula',
      'Bottle',
      'Pacifier',
      'Blanket',
      'Toy',
      'Clothing',
      'Shampoo',
      'Lotion',
      'Stroller',
      'Car Seat',
      'High Chair',
    ],
    priceRange: [2500, 150000], // ₦2,500 - ₦150,000
    stockRange: [5, 100],
  },
  [ProductCategory.SPORTS_AND_OUTDOORS]: {
    prefixes: ['Professional', 'Outdoor', 'Fitness', 'Adventure', 'Training'],
    products: [
      'Ball',
      'Racket',
      'Weights',
      'Mat',
      'Tent',
      'Backpack',
      'Water Bottle',
      'Shoes',
      'Clothing',
      'Equipment',
      'Gear',
    ],
    priceRange: [5000, 200000], // ₦5,000 - ₦200,000
    stockRange: [3, 80],
  },
  [ProductCategory.MEDIA]: {
    prefixes: ['Digital', 'HD', 'Premium', "Collector's", 'Limited Edition'],
    products: [
      'DVD',
      'Blu-ray',
      'CD',
      'Vinyl',
      'Book',
      'Magazine',
      'Game',
      'Software',
      'Streaming',
      'Download',
    ],
    priceRange: [2500, 40000], // ₦2,500 - ₦40,000
    stockRange: [5, 100],
  },
  [ProductCategory.OFFICE_AND_SCHOOL_SUPPLIES]: {
    prefixes: ['Student', 'Professional', 'Bulk', 'Premium', 'Essential'],
    products: [
      'Backpack',
      'Binder',
      'Calculator',
      'Pencil Case',
      'Lunch Box',
      'Water Bottle',
      'Notebook',
      'Art Supplies',
      'Glue',
      'Scissors',
    ],
    priceRange: [1500, 45000], // ₦1,500 - ₦45,000
    stockRange: [10, 150],
  },
  [ProductCategory.GARDENING_AND_TOOLS]: {
    prefixes: [
      'Professional',
      'Heavy Duty',
      'Precision',
      'Ergonomic',
      'Multi-tool',
    ],
    products: [
      'Hammer',
      'Screwdriver',
      'Wrench',
      'Drill',
      'Saw',
      'Pliers',
      'Seeds',
      'Fertilizer',
      'Pot',
      'Hose',
      'Shovel',
      'Rake',
    ],
    priceRange: [4000, 100000], // ₦4,000 - ₦100,000
    stockRange: [5, 80],
  },
  [ProductCategory.JEWELRY_AND_WATCHES]: {
    prefixes: ['Elegant', 'Luxury', 'Designer', 'Classic', 'Modern'],
    products: [
      'Necklace',
      'Bracelet',
      'Ring',
      'Earrings',
      'Watch',
      'Pendant',
      'Chain',
      'Cufflinks',
      'Brooch',
      'Charm',
    ],
    priceRange: [10000, 500000], // ₦10,000 - ₦500,000
    stockRange: [1, 25],
  },
  [ProductCategory.HEALTH_AND_FITNESS]: {
    prefixes: ['Professional', 'Medical', 'Fitness', 'Wellness', 'Therapeutic'],
    products: [
      'Supplement',
      'Protein',
      'Equipment',
      'Monitor',
      'Scale',
      'Thermometer',
      'Blood Pressure',
      'Glucose',
      'First Aid',
      'Exercise',
    ],
    priceRange: [5000, 150000], // ₦5,000 - ₦150,000
    stockRange: [5, 100],
  },
  [ProductCategory.OTHERS]: {
    prefixes: ['Universal', 'Multi-purpose', 'Specialty', 'Custom', 'Unique'],
    products: [
      'Gadget',
      'Tool',
      'Accessory',
      'Component',
      'Part',
      'Kit',
      'Set',
      'Device',
      'Equipment',
      'Item',
    ],
    priceRange: [3000, 75000], // ₦3,000 - ₦75,000
    stockRange: [5, 75],
  },
}

function generateGTIN(): string {
  // Generate a valid GTIN-13 (EAN-13) barcode
  let gtin = ''
  for (let i = 0; i < 12; i++) {
    gtin += faker.number.int({ min: 0, max: 9 })
  }

  // Calculate check digit
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = Number.parseInt(gtin[i])
    sum += i % 2 === 0 ? digit : digit * 3
  }
  const checkDigit = (10 - (sum % 10)) % 10

  return gtin + checkDigit
}

function getProductImageUrl(
  category: ProductCategory,
  baseProduct: string
): string {
  // Free image sources with realistic product images
  const imageMapping = {
    // Electronics - Unsplash has great tech photos
    Smartphone:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
    iPhone:
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
    'Samsung Galaxy':
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&h=300&fit=crop',
    'Android Phone':
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=300&h=300&fit=crop',
    'Gaming Laptop':
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&h=300&fit=crop',
    'Business Laptop':
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop',
    MacBook:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
    'Dell Laptop':
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&h=300&fit=crop',
    'HP Laptop':
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop',
    'Lenovo ThinkPad':
      'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=300&h=300&fit=crop',
    iPad: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
    Tablet:
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300&h=300&fit=crop',
    'Android Tablet':
      'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=300&h=300&fit=crop',
    'Wireless Headphones':
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    'Gaming Headset':
      'https://images.unsplash.com/photo-1599669454699-248893623440?w=300&h=300&fit=crop',
    AirPods:
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&h=300&fit=crop',
    'Bluetooth Speaker':
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop',
    'Sound Bar':
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    'Smart TV':
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop',
    'LED TV':
      'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=300&h=300&fit=crop',
    '4K Monitor':
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=300&fit=crop',
    'Gaming Monitor':
      'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=300&h=300&fit=crop',
    'Ultrawide Monitor':
      'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=300&h=300&fit=crop',
    'Apple Watch':
      'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=300&h=300&fit=crop',
    'Samsung Watch':
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    Smartwatch:
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300&h=300&fit=crop',
    'Fitness Tracker':
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&h=300&fit=crop',
    'DSLR Camera':
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop',
    'Action Camera':
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    'Web Camera':
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=300&h=300&fit=crop',
    'Security Camera':
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    'Gaming Mouse':
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
    'Wireless Mouse':
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&h=300&fit=crop',
    'Mechanical Keyboard':
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop',
    'Wireless Keyboard':
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop',
    'Power Bank':
      'https://images.unsplash.com/photo-1609592806436-53dd2bd57d64?w=300&h=300&fit=crop',
    'Wireless Charger':
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop',
    'USB Charger':
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop',

    // Food & Beverages
    Bread:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop',
    Milk: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop',
    Coffee:
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&h=300&fit=crop',
    Tea: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&h=300&fit=crop',
    Juice:
      'https://images.unsplash.com/photo-1560424072-74053d0bfcb0?w=300&h=300&fit=crop',
    Water:
      'https://images.unsplash.com/photo-1549484014-20c67c3e0b2b?w=300&h=300&fit=crop',

    // Clothing & Apparel
    'T-Shirt':
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    Jeans:
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
    Shoes:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop',
    Jacket:
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=300&h=300&fit=crop',

    // Health & Beauty
    Moisturizer:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
    Perfume:
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop',
    Lipstick:
      'https://images.unsplash.com/photo-1586495985345-b4d86b3df0ab?w=300&h=300&fit=crop',

    // Home & Garden
    Chair:
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300&h=300&fit=crop',
    Desk: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=300&h=300&fit=crop',
    Lamp: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=300&fit=crop',

    // Sports & Outdoors
    Ball: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=300&h=300&fit=crop',
    Bicycle:
      'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=300&h=300&fit=crop',
    Weights:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
  }

  // Check if we have a specific image for this product
  if (imageMapping[baseProduct as keyof typeof imageMapping]) {
    return imageMapping[baseProduct as keyof typeof imageMapping]
  }

  // Category-based fallbacks using Unsplash collections
  const categoryImages = {
    [ProductCategory.ELECTRONICS]: `https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.FOOD_AND_BEVERAGES]: `https://images.unsplash.com/photo-1506617564039-2f9b62efe483?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.CLOTHING_AND_APPAREL]: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.HEALTH_AND_BEAUTY]: `https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.HOUSEHOLD_ITEMS]: `https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.TOYS_AND_GAMES]: `https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.OFFICE_SUPPLIES]: `https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.PET_SUPPLIES]: `https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.AUTOMOTIVE]: `https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.BOOKS_AND_STATIONERY]: `https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.SEASONAL_AND_SPECIAL_OCCASIONS]: `https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.BABY_PRODUCTS]: `https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.SPORTS_AND_OUTDOORS]: `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.MEDIA]: `https://images.unsplash.com/photo-1489599162687-f5d7f0ce4a1e?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.OFFICE_AND_SCHOOL_SUPPLIES]: `https://images.unsplash.com/photo-1586281010595-85ada1b5a466?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.GARDENING_AND_TOOLS]: `https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.JEWELRY_AND_WATCHES]: `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.HEALTH_AND_FITNESS]: `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&sig=${Math.random()}`,
    [ProductCategory.OTHERS]: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop&sig=${Math.random()}`,
  }

  return (
    categoryImages[category] ||
    `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop&sig=${Math.random()}`
  )
}

function generateElectronicsPrice(baseProduct: string): number {
  // Special pricing tiers for electronics based on product type
  const electronicspricing = {
    // High-end laptops and computers
    'Gaming Laptop': { min: 800000, max: 2500000 },
    'Business Laptop': { min: 450000, max: 1200000 },
    MacBook: { min: 1200000, max: 2800000 },
    'Dell Laptop': { min: 400000, max: 1500000 },
    'HP Laptop': { min: 350000, max: 1200000 },
    'Lenovo ThinkPad': { min: 500000, max: 1800000 },

    // Smartphones and tablets
    iPhone: { min: 400000, max: 1500000 },
    'Samsung Galaxy': { min: 200000, max: 800000 },
    Smartphone: { min: 80000, max: 600000 },
    'Android Phone': { min: 50000, max: 400000 },
    iPad: { min: 300000, max: 800000 },
    'Android Tablet': { min: 80000, max: 300000 },
    Tablet: { min: 60000, max: 250000 },

    // TVs and Monitors
    'Smart TV': { min: 200000, max: 1200000 },
    'LED TV': { min: 150000, max: 800000 },
    '4K Monitor': { min: 150000, max: 500000 },
    'Gaming Monitor': { min: 180000, max: 600000 },
    'Ultrawide Monitor': { min: 200000, max: 700000 },

    // Audio equipment
    AirPods: { min: 80000, max: 250000 },
    'Wireless Headphones': { min: 15000, max: 150000 },
    'Gaming Headset': { min: 25000, max: 120000 },
    'Bluetooth Speaker': { min: 8500, max: 80000 },
    'Sound Bar': { min: 50000, max: 300000 },

    // Watches and wearables
    'Apple Watch': { min: 150000, max: 800000 },
    'Samsung Watch': { min: 80000, max: 400000 },
    Smartwatch: { min: 25000, max: 200000 },
    'Fitness Tracker': { min: 15000, max: 80000 },

    // Cameras
    'DSLR Camera': { min: 200000, max: 1500000 },
    'Action Camera': { min: 50000, max: 300000 },
    'Web Camera': { min: 8500, max: 50000 },
    'Security Camera': { min: 15000, max: 100000 },

    // Accessories
    'Power Bank': { min: 8500, max: 35000 },
    'Wireless Charger': { min: 12000, max: 45000 },
    'USB Charger': { min: 3500, max: 25000 },
    'Gaming Mouse': { min: 15000, max: 80000 },
    'Wireless Mouse': { min: 8500, max: 35000 },
    'Mechanical Keyboard': { min: 25000, max: 120000 },
    'Wireless Keyboard': { min: 12000, max: 60000 },
  }

  const pricing =
    electronicspricing[baseProduct as keyof typeof electronicspricing]
  if (pricing) {
    return faker.number.float({
      min: pricing.min,
      max: pricing.max,
      fractionDigits: 0, // Whole numbers for NGN
    })
  }

  // Fallback to category default
  return faker.number.float({
    min: 8500,
    max: 2500000,
    fractionDigits: 0,
  })
}

function generateProduct(index: number): any {
  const categories = Object.keys(CATEGORY_PRODUCTS) as ProductCategory[]
  const category = faker.helpers.arrayElement(categories)
  const categoryData = CATEGORY_PRODUCTS[category]

  const prefix = faker.helpers.arrayElement(categoryData.prefixes)
  const baseProduct = faker.helpers.arrayElement(categoryData.products)
  const brand = faker.company.name().split(' ')[0] // Use first word of company name as brand

  // Create varied product names
  const nameVariations = [
    `${prefix} ${baseProduct}`,
    `${brand} ${baseProduct}`,
    `${prefix} ${brand} ${baseProduct}`,
    `${baseProduct} ${prefix}`,
    `${baseProduct} by ${brand}`,
  ]

  const name = faker.helpers.arrayElement(nameVariations)
  const [minPrice, maxPrice] = categoryData.priceRange
  const [minStock, maxStock] = categoryData.stockRange

  // Use special pricing for electronics, otherwise use category defaults
  let price: number
  if (category === ProductCategory.ELECTRONICS) {
    price = generateElectronicsPrice(baseProduct)
  } else {
    price = faker.number.float({
      min: minPrice,
      max: maxPrice,
      fractionDigits: 0, // Whole numbers for NGN
    })
  }

  const quantity = faker.number.int({
    min: minStock,
    max: maxStock,
  })

  // Generate realistic descriptions based on category
  const features =
    category === ProductCategory.ELECTRONICS
      ? [
          'high performance',
          'cutting-edge',
          'premium quality',
          'advanced features',
          'latest technology',
          'professional grade',
          'user-friendly',
          'reliable',
          'energy efficient',
          'sleek design',
        ]
      : [
          'high quality',
          'durable',
          'lightweight',
          'easy to use',
          'premium',
          'reliable',
          'efficient',
          'comfortable',
          'stylish',
          'innovative',
          'eco-friendly',
          'affordable',
          'versatile',
          'professional',
          'portable',
        ]

  const selectedFeatures = faker.helpers.arrayElements(features, {
    min: 2,
    max: 4,
  })
  const description = `${selectedFeatures.join(', ')} ${baseProduct.toLowerCase()}. Perfect for everyday use with excellent value for money.`

  return {
    id: `prod_${category.toLowerCase()}_${String(index + 1).padStart(4, '0')}`,
    name,
    description: description.charAt(0).toUpperCase() + description.slice(1),
    category,
    price,
    quantity,
    lowStockMargin: Math.max(1, Math.floor(quantity * 0.1)), // 10% of quantity as low stock margin
    imageUrl: getProductImageUrl(category, baseProduct),
    gtin: generateGTIN(),
    createdAt: faker.date.between({
      from: new Date('2024-01-01'),
      to: new Date(),
    }),
  }
}

export async function seedProducts(client: PrismaClient, count: number = 1600) {
  console.log(`🌱 Starting to seed ${count} products...`)

  const batchSize = 100
  let createdCount = 0

  // Set a consistent seed for reproducible fake data
  faker.seed(12345)

  for (let i = 0; i < count; i += batchSize) {
    const batch = []
    const currentBatchSize = Math.min(batchSize, count - i)

    for (let j = 0; j < currentBatchSize; j++) {
      const product = generateProduct(i + j)
      batch.push(product)
    }

    try {
      // Use createMany for better performance
      await client.product.createMany({
        data: batch,
        skipDuplicates: true,
      })

      createdCount += currentBatchSize
      console.log(
        `✅ Created products ${i + 1}-${i + currentBatchSize} (${createdCount}/${count})`
      )

      // Small delay to prevent overwhelming the database
      if (i % (batchSize * 5) === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error(
        `❌ Error creating batch ${i + 1}-${i + currentBatchSize}:`,
        error
      )
    }
  }

  console.log(`🎉 Successfully created ${createdCount} products!`)

  // Log distribution by category
  const categories = await client.product.groupBy({
    by: ['category'],
    _count: {
      category: true,
    },
  })

  console.log('\n📊 Product distribution by category:')
  categories.forEach(cat => {
    console.log(`  ${cat.category}: ${cat._count.category} products`)
  })
}
