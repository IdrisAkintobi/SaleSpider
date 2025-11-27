# What is SaleSpider?

SaleSpider is a modern, open-source inventory and sales management system designed specifically for small and medium-sized stores. Built with Next.js 14 and PostgreSQL, it provides a powerful yet easy-to-use platform for managing your store operations.

![SaleSpider Dashboard](/images/overview.png)

## Why SaleSpider?

- **Offline-First** - Works without internet (self-hosted deployment)
- **Role-Based Access** - Admin, Manager, and Cashier roles
- **Audit Trails** - Track all actions for accountability
- **Multi-Language** - English, French, Spanish, German
- **Modern Stack** - Next.js 14, PostgreSQL 16, TypeScript, Docker, Prisma

### Key Features

- **Dashboard** - Real-time sales analytics with visual charts
- **Inventory** - Product management, stock tracking, low-stock alerts, deshelving
- **Sales** - Point-of-sale interface, multiple payment methods, receipt printing
- **Staff** - User management, role-based permissions, audit logs
- **AI Insights** - Inventory optimization powered by Google Gemini
- **Multi-Language** - English, French, Spanish, German with locale formatting
- **Performance** - Virtual scrolling, smart caching, optimized bundles

## Who Is It For?

- **Store Owners** - Manage inventory, track performance, operate offline
- **Managers** - Oversee operations, view audit logs, generate reports
- **Cashiers** - Record sales, process payments (Cash, Card, Bank Transfer, Crypto, Other)
- **Developers** - Clean codebase, modern stack, easy to extend

## Deployment Options

- **Self-Hosted** - Full control, offline operation, no cloud fees
- **Hosted Database** - Managed database, requires internet
- **Cloud Platforms** - Serverless, auto-scaling, global CDN

[Learn more →](/deployment/)

## Offline Operation

One of SaleSpider's unique features is its ability to operate completely offline when using self-hosted deployment:

### What Works Offline

- ✅ Sales recording and processing
- ✅ Inventory management
- ✅ Staff management
- ✅ Report generation
- ✅ Data export (CSV)
- ✅ All core functionality

### What Requires Internet

- ❌ AI-powered recommendations (Gemini API)
- ❌ Cloud backups (S3, Azure, GCS)
- ❌ External integrations
- ❌ Software updates

::: tip Perfect for Unreliable Connectivity
If your store is in an area with unreliable internet, SaleSpider's self-hosted deployment ensures your operations never stop.
:::

[Learn more about offline operation →](/deployment/offline)

## Open Source

Released under MIT License - free for commercial use, modification, and distribution.

- Modular, well-documented codebase
- Easy to extend and customize
- Active development and community contributions

## Design Philosophy

- **Product Images** - Uses URLs instead of file uploads for flexibility and simplicity
- **Extensibility** - Modular architecture makes it easy to add features and integrations

## Getting Started

Ready to try SaleSpider?

1. **[Quick Start Guide](/getting-started)** - Get up and running in minutes
2. **[Deployment Options](/deployment/)** - Choose your deployment method
3. **[Configuration](/environment-variables)** - Customize your setup
4. **[Features](/features/)** - Explore what SaleSpider can do

## Community & Support

- [Documentation](/getting-started) - Comprehensive guides
- [GitHub Discussions](https://github.com/IdrisAkintobi/SaleSpider/discussions) - Community support
- [Issue Tracker](https://github.com/IdrisAkintobi/SaleSpider/issues) - Report bugs
- [Contributing Guide](/development/contributing) - How to contribute

## What's Next?

- [Getting Started](/getting-started) - Deploy your first instance
- [Features Overview](/features/) - Explore capabilities
- [Deployment Guide](/deployment/) - Choose your deployment method
- [Configuration](/environment-variables) - Customize your setup
