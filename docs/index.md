---
layout: home

hero:
  name: "SaleSpider"
  text: "Smart Inventory & Sales Management"
  tagline: Modern, Next.js-based application for small and medium-sized stores to streamline sales, manage inventory efficiently, and leverage AI-powered insights.
  image:
    src: /images/overview.png
    alt: SaleSpider Dashboard Overview
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/IdrisAkintobi/SaleSpider
    - theme: alt
      text: Features
      link: /features/

features:
  - icon: 📊
    title: Advanced Dashboard & Reporting
    details: Gain insights into sales performance, manage staff, and track inventory with role-based views and comprehensive analytics.

  - icon: 📦
    title: Smart Inventory Management
    details: Optimize stock levels, product management, and prevent stockouts with AI-powered insights and recommendations.

  - icon: 🔐
    title: Role-Based Access Control
    details: Secure operations with distinct roles for Managers, Cashiers, and Super Admins with granular permissions.

  - icon: 🤖
    title: AI-Driven Recommendations
    details: Utilize AI for inventory suggestions, loss prevention, and reorder predictions powered by Google Gemini.

  - icon: 💰
    title: Easy Sales Recording
    details: Intuitive interface for recording transactions with complete sale history and multi-payment support.

  - icon: 👥
    title: Staff Management
    details: Complete user management with audit logs and role-based access control.

  - icon: 📤
    title: CSV Export
    details: Export sales and audit data with full filter support in multiple languages for reporting and analysis.

  - icon: 🌍
    title: Multi-Language Support
    details: Full internationalization with support for English, French, Spanish, and German languages.

  - icon: ⚡
    title: Performance Optimized
    details: Virtual scrolling, smart prefetching, and TanStack Query caching for lightning-fast user experience.

  - icon: 🔌
    title: Offline-First Capable
    details: Self-hosted deployment enables full offline operation - perfect for areas with unreliable internet connectivity.

  - icon: 🐳
    title: Docker-Based Deployment
    details: Containerized deployment with automatic HTTPS, enterprise-grade backups, and easy scaling.

  - icon: 🛡️
    title: Enterprise Security
    details: Built-in security features including rate limiting, HTTPS, secure authentication, and audit logging.
---

## Quick Start

Deploy SaleSpider in 3 simple commands:

```bash
# 1. Initial setup
make setup

# 2. Edit configuration (set passwords, domain, etc.)
nano .env

# 3. Deploy
make deploy
```

That's it! Your production-ready SaleSpider instance will be running with HTTPS and automated backups.

## Deployment Options

Choose the deployment option that best fits your needs:

### 🏠 Self-Hosted (Full Control + Offline Operation)

Perfect for stores that need offline operation or complete control over their data.

- ✅ **Full offline operation** - Works without internet
- ✅ **Complete data control** - Your infrastructure, your data
- ✅ **Enterprise backups** - pgBackRest with cloud storage support
- ✅ **No monthly fees** - One-time setup cost only

[Learn more →](/deployment/#option-1-self-hosted-deployment)

### ☁️ Hosted Database (Simplified Management)

Ideal for deployments with reliable internet and minimal maintenance requirements.

- ✅ **Managed database** - Provider handles backups and scaling
- ✅ **Simplified setup** - No database management needed
- ✅ **Automatic updates** - Provider manages database updates
- ⚠️ **Requires internet** - Continuous connectivity needed

[Learn more →](/deployment/#option-2-hosted-database-deployment)

### 🚀 Cloud Platforms (Serverless)

Best for zero infrastructure management with automatic scaling.

- ✅ **Zero server management** - Platform handles everything
- ✅ **Automatic scaling** - Scales with your traffic
- ✅ **Global CDN** - Fast access worldwide
- ⚠️ **Requires internet** - Cloud-based deployment

[Learn more →](/deployment/#option-3-cloud-platform-deployment)

## Why SaleSpider?

### Built for Real-World Needs

SaleSpider was designed with real store operations in mind:

- **Offline-first architecture** for areas with unreliable connectivity
- **Role-based access** for multi-user environments
- **Comprehensive audit trails** for accountability
- **Multi-language support** for international operations

### Modern Tech Stack

Built with cutting-edge technologies for performance and reliability:

- **Next.js 14** with App Router for modern React development
- **PostgreSQL 16** for robust data management
- **TypeScript** for type safety and better developer experience
- **Docker** for consistent, reproducible deployments

### Open Source & Extensible

- **MIT License** - Free to use and modify
- **Clean architecture** - Easy to extend and customize
- **Active development** - Regular updates and improvements
- **Community-driven** - Contributions welcome

## Tech Stack

<div class="tech-stack">

**Frontend**

- Next.js 14 • React 18 • TypeScript • Tailwind CSS • ShadCN UI

**Backend**

- PostgreSQL 16 • Prisma ORM • JWT Authentication • Genkit AI

**Infrastructure**

- Docker • Caddy • pgBackRest • AWS S3

</div>

## Get Started Now

Ready to streamline your store operations?

<div class="cta-buttons">

[📖 Read the Docs](/getting-started) • [🚀 Deploy Now](/deployment/) • [💬 Get Help](https://github.com/IdrisAkintobi/SaleSpider/discussions)

</div>

<style>
.tech-stack {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.cta-buttons {
  margin: 2rem 0;
  text-align: center;
  font-size: 1.1rem;
}
</style>
