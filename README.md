# SaleSpider - Smart Inventory & Sales Management

SaleSpider is a modern, Next.js-based application designed for small and medium-sized stores to streamline sales, manage inventory efficiently, and leverage AI-powered insights for growth.

## 📖 Table of Contents

- [🚀 Quick Deployment](#-quick-deployment)
- [✨ Key Features](#key-features)
- [🛠️ Tech Stack](#tech-stack)
- [💻 Development Setup](#development-setup)
- [📚 Documentation](#-documentation)
  - [Deployment & Operations](#-deployment--operations)
  - [Architecture & Development](#-architecture--development)
  - [Quick Reference](#-quick-reference)

## 🚀 Quick Deployment

**Deploy SaleSpider with Makefile commands:**

```bash
# 1. Initial setup
make setup

# 2. Edit configuration (set passwords, domain, etc.)
nano .env

# 3. Deploy
make deploy
```

**That's it!** Your production-ready SaleSpider instance will be running with HTTPS, automated backups, and monitoring.

### Quick Commands
```bash
make help      # Show all available commands
make status    # Check service status
make logs      # View logs
make backup    # Create manual backup
make restore   # Restore from backup
```

👉 **See [📚 Complete Documentation](#-documentation) below**

## ✨ Key Features

- **🏪 Advanced Dashboard & Reporting**: Gain insights into sales performance, manage staff, and track inventory with role-based views
- **📦 Smart Inventory Management**: Optimize stock levels, product deshelving, and prevent stockouts with AI insights
- **🔐 Role-Based Access Control**: Secure operations with distinct roles for Managers, Cashiers, and Super Admins
- **🤖 AI-Driven Recommendations**: Utilize AI for inventory suggestions, loss prevention, and reorder predictions
- **💰 Sales Recording**: Easy-to-use interface for recording transactions with comprehensive audit trails
- **👥 Staff Management**: Complete user management with performance tracking and audit logs
- **📊 CSV Export**: Export sales and audit data with full filter support in multiple languages
- **🌍 Multi-Language Support**: Full internationalization (English, French, Spanish, German)
- **⚡ Performance Optimized**: Virtual scrolling, smart prefetching, and TanStack Query caching

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
- **NextAuth.js**: Secure authentication and session management
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
import { Button } from "../../../components/ui/button";

// Use clean path aliases like this:
import { Button } from "@/components/ui/button";
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

### 🚀 Deployment & Operations

- **[Makefile Quick Reference](MAKEFILE_GUIDE.md)** - All available `make` commands with examples
- **[Docker Deployment Guide](.docker/README.md)** - Comprehensive Docker deployment documentation
- **[HTTPS Setup Guide](.docker/HTTPS_SETUP.md)** - SSL/TLS certificate configuration for production
- **[Database Restore Guide](.docker/RESTORE_GUIDE.md)** - Complete restore procedures (latest, PITR, specific backups)
- **[Backup Configuration](.docker/BACKUP_CONFIG.md)** - pgBackRest backup system configuration

### 🏗️ Architecture & Development

- **[Project Blueprint](docs/BLUEPRINT.MD)** - Architecture, design patterns, and system overview
- **[Application Settings](docs/SETTINGS.MD)** - Configuration and settings management

### ⚡ Quick Reference

**Common Operations:**
```bash
make deploy        # Full deployment
make start         # Start services
make stop          # Stop services
make status        # Service status
make logs          # View logs
make backup        # Manual backup
make restore       # Restore from latest backup
make db-verify     # Verify database
make help          # All commands
```

**Database Restore:**
```bash
make restore                                    # Latest backup
make restore-pitr TIME="2024-10-04 15:30:00"  # Point-in-time
make restore-specific SET="20241004-163303F"  # Specific backup
make backup-info                               # List backups
```

**Development:**
```bash
make dev-logs          # Tail logs
make app-shell         # Application shell
make db-shell          # Database shell
make dev-restart-app   # Restart app only
```

### 📖 Additional Resources

- **[Deployment Script](deploy.sh)** - Platform-agnostic deployment automation
- **[Makefile](Makefile)** - Command automation with 42+ commands
- **[Environment Template](env.example)** - Configuration template with 80+ variables

---

Feel free to explore and modify the code to fit your specific needs!
