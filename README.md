# SaleSpider - Smart Inventory & Sales Management

SaleSpider is a modern, Next.js-based application designed for small and medium-sized stores to streamline sales, manage inventory efficiently, and leverage AI-powered insights for growth.

## Key Features

- **Advanced Dashboard & Reporting**: Gain insights into sales performance, manage staff, and track inventory. Role-based views for Managers and Cashiers.
- **Smart Inventory Management**: Optimize stock levels, add new products, and prevent stockouts.
- **Role-Based Access Control**: Secure operations with distinct roles for Managers and Cashiers.
- **AI-Driven Recommendations**: Utilize AI for inventory suggestions, promotional opportunities, and reorder predictions.
- **Sales Recording**: Easy-to-use interface for Cashiers to record sales transactions.
- **Staff Management**: For Managers to oversee staff performance and status.

## Tech Stack

- **Next.js**: React framework for server-side rendering and static site generation.
- **React**: JavaScript library for building user interfaces.
- **TypeScript**: Superset of JavaScript for type safety.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **ShadCN UI**: Re-usable UI components.
- **Genkit (for AI)**: Firebase's generative AI toolkit.

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd SaleSpider
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  **Set up environment variables**:
    Create a `.env` file in the root directory and add any necessary environment variables (e.g., Firebase configuration, API keys for Genkit).
    ```env
    # Example .env content
    # NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    # ... other variables
    ```
4.  **Run the development server**:
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    The application will be available at `http://localhost:9002`.

5.  **Run Genkit development server (for AI features)**:
    In a separate terminal, run:
    ```bash
    npm run genkit:dev
    # or
    yarn genkit:dev
    # or
    pnpm genkit:dev
    ```
    This will start the Genkit flows, typically on `http://localhost:4000`.

## Exploring the Code

- The main application pages are located in `src/app/`.
- UI components can be found in `src/components/`.
- AI-related flows using Genkit are in `src/ai/flows/`.
- Core data structures and mock data logic are in `src/lib/`.

Feel free to explore and modify the code to fit your specific needs!
