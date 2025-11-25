# SaleSpider - Smart Inventory & Sales Management

SaleSpider is a modern, Next.js-based application designed for small and medium-sized stores to streamline sales, manage inventory efficiently, and leverage AI-powered insights for growth.

## 📖 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#-tech-stack)
- [💻 Development Setup](#-development-setup)
- [📚 Documentation](#-documentation)

## 🚀 Quick Start

### Self-Hosted Deployment

**Deploy SaleSpider in 3 commands:**

```bash
# 1. Initial setup
make setup

# 2. Edit configuration (set passwords, domain, etc.)
nano .env

# 3. Deploy
make deploy
```

**That's it!** Your production-ready SaleSpider instance will be running with HTTPS, automated backups, and monitoring.

### Cloud Deployment

**Deploy to Vercel, Railway, or Render:**

1. Set up a PostgreSQL database (Neon, Supabase, Railway)
2. Copy `.env.cloud.example` to `.env` and configure
3. Deploy with one click or CLI

📖 **For cloud deployment:** See [Cloud Platforms Guide](https://idrisakintobi.github.io/SaleSpider/deployment/cloud-platforms)

### Quick Commands

```bash
make help      # Show all available commands
make status    # Check service status
make logs      # View logs
make backup    # Create manual backup
```

📖 **For complete self-hosted instructions:** [Deployment Guide](https://idrisakintobi.github.io/SaleSpider/deployment/)

## ✨ Key Features

- **🏪 Advanced Dashboard & Reporting**: Gain insights into sales performance, manage staff, and track inventory with role-based views
- **📦 Smart Inventory Management**: Optimize stock levels, product deshelving, and prevent stockouts with AI insights
- **🔔 Low Stock Notifications**: Real-time alerts for products running low with visual indicators and quick navigation
- **🔐 Role-Based Access Control**: Secure operations with distinct roles for Managers, Cashiers, and Super Admins
- **🤖 AI-Driven Recommendations**: Utilize AI for inventory suggestions, loss prevention, and reorder predictions
- **💰 Sales Recording**: Easy-to-use interface for recording transactions with comprehensive audit trails
- **👥 Staff Management**: Complete user management with performance tracking and audit logs
- **📊 CSV Export**: Export sales and audit data with full filter support in multiple languages
- **🌍 Multi-Language Support**: Full internationalization (English, French, Spanish, German)
- **⚡ Performance Optimized**: Virtual scrolling, smart prefetching, and TanStack Query caching

### Design Decisions

**📸 Product Images**: The app supports product images via image URLs rather than direct file uploads. Users can set up their own image processing service (local or cloud with CDN) and simply provide the image links for products. This approach provides flexibility while avoiding the complexity of built-in file storage, processing, and CDN management. You maintain full control over your image infrastructure and can choose the solution that best fits your needs.

**🔧 Extensibility**: The clean, modular architecture makes it easy to fork and extend SaleSpider with additional features like:

- Direct image uploads and advanced image processing
- Payment provider integrations (Paystack, Moniepoint, Stripe, etc.)
- Custom reporting and analytics dashboards
- Integration with accounting software or ERPs
- Multi-location/multi-store management
- Custom workflow automations

Create your own extended version tailored to your specific business requirements!

## 🛠️ Tech Stack

### Frontend

- **Next.js 14**: React framework with App Router
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework
- **ShadCN UI**: Beautiful, accessible UI components
- **TanStack Query**: Intelligent data fetching and caching

### Backend & Database

- **PostgreSQL 16**: Production-ready database with optimization
- **Prisma ORM**: Type-safe database access with migrations
- **JWT Authentication**: Secure token-based authentication and session management
- **Genkit AI**: Firebase's generative AI toolkit for smart insights

### Deployment & Infrastructure

- **Docker**: Containerized deployment
- **Caddy**: Automatic HTTPS and reverse proxy
- **pgBackRest**: Enterprise-grade backup system
- **AWS S3**: Cloud backup storage
- **Platform Agnostic**: Linux, macOS, Windows support

## 💻 Development Setup

For local development:

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd SaleSpider
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Set up environment variables**:

    ```bash
    cp env.example .env
    # Edit .env with your development settings
    ```

4.  **Set up database**:

    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```

5.  **Run development server**:

    ```bash
    npm run dev
    ```

    Application available at `http://localhost:3000`

6.  **Run AI development server** (optional):
    ```bash
    npm run genkit:dev
    ```
    Genkit flows available at `http://localhost:4000`

## Exploring the Code

- The main application pages are located in `src/app/`.
- UI components can be found in `src/components/`.
- AI-related flows using Genkit are in `src/ai/flows/`.
- Core data structures and mock data logic are in `src/lib/`.

### Path Aliases

This project uses TypeScript path aliases for clean, maintainable imports:

```typescript
// Instead of relative imports like this:
import { Button } from '../../../components/ui/button'

// Use clean path aliases like this:
import { Button } from '@/components/ui/button'
```

Available aliases:

- `@/*` - Root src directory
- `@/components/*` - UI components
- `@/lib/*` - Utility libraries
- `@/hooks/*` - React hooks
- `@/contexts/*` - React contexts
- `@/app/*` - Next.js app directory
- `@/ai/*` - AI-related code
- `@/prisma/*` - Prisma schema and seeds
- `@/types/*` - TypeScript type definitions

## 📚 Documentation

**📖 [View Full Documentation](https://idrisakintobi.github.io/SaleSpider/)**

Our comprehensive documentation site includes:

### 🚀 Getting Started

- **[Quick Start Guide](https://idrisakintobi.github.io/SaleSpider/getting-started)** - Get up and running in minutes
- **[Deployment Options](https://idrisakintobi.github.io/SaleSpider/deployment/)** - Self-hosted, hosted database, and cloud platforms

### 📦 Features

- **[Dashboard & Reporting](https://idrisakintobi.github.io/SaleSpider/features/dashboard)** - Analytics and insights
- **[Inventory Management](https://idrisakintobi.github.io/SaleSpider/features/inventory)** - Stock tracking and management
- **[Sales Recording](https://idrisakintobi.github.io/SaleSpider/features/sales)** - Point-of-sale operations
- **[Staff Management](https://idrisakintobi.github.io/SaleSpider/features/staff)** - User roles and permissions
- **[AI Features](https://idrisakintobi.github.io/SaleSpider/features/ai)** - Smart recommendations

### ⚙️ Configuration

- **[Environment Variables](https://idrisakintobi.github.io/SaleSpider/configuration/environment-variables)** - All configuration options
- **[Security Settings](https://idrisakintobi.github.io/SaleSpider/configuration/security)** - Authentication and security
- **[Backup Configuration](https://idrisakintobi.github.io/SaleSpider/configuration/backup)** - Data protection

### 🔧 Operations

- **[Backup & Restore](https://idrisakintobi.github.io/SaleSpider/operations/backup-restore)** - Database backup procedures
- **[Makefile Commands](https://idrisakintobi.github.io/SaleSpider/operations/makefile)** - Automation commands
- **[Monitoring](https://idrisakintobi.github.io/SaleSpider/operations/monitoring)** - System monitoring
- **[Troubleshooting](https://idrisakintobi.github.io/SaleSpider/operations/troubleshooting)** - Common issues

### 💻 Development

- **[Local Setup](https://idrisakintobi.github.io/SaleSpider/development/local-setup)** - Development environment
- **[Architecture](https://idrisakintobi.github.io/SaleSpider/development/architecture)** - System design
- **[Contributing](https://idrisakintobi.github.io/SaleSpider/development/contributing)** - How to contribute

### ⚡ Quick Reference

**Common Operations:**

```bash
make deploy        # Full deployment
make start         # Start services
make stop          # Stop services
make status        # Service status
make logs          # View logs
make backup        # Manual backup
make help          # All commands
```

**For detailed command references, see [Makefile Commands](https://idrisakintobi.github.io/SaleSpider/operations/makefile)**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Attribution

If you use SaleSpider in your project, please:

- **Keep the license notice**: The MIT license requires that you include the original copyright notice and license text in any substantial portions of the software you distribute.
- **Give credit**: Consider mentioning SaleSpider in your project's README or documentation.
- **Star the repository**: If you find this project useful, please give it a star on GitHub to show your appreciation.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](https://idrisakintobi.github.io/SaleSpider/development/contributing) for details on how to:

- Report bugs
- Suggest features
- Submit pull requests
- Follow our code of conduct

## 💖 Support

If SaleSpider has helped your business, please consider:

- ⭐ Starring this repository
- 🐛 Reporting bugs and suggesting improvements
- 🔧 Contributing code or documentation
- 💬 Sharing your success story

---

**Built with ❤️ for the open source community**

Feel free to explore and modify the code to fit your specific needs!
