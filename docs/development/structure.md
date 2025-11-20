# Project Structure

Overview of the SaleSpider codebase organization.

## Directory Structure

```
SaleSpider/
├── .docker/              # Docker configuration
├── .github/              # GitHub workflows
├── docs/                 # Documentation
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── scripts/              # Utility scripts
├── src/                  # Application source code
└── [config files]        # Configuration files
```

## Source Code (`src/`)

### Application Routes (`src/app/`)

```
src/app/
├── (dashboard)/          # Dashboard layout group
│   └── dashboard/        # Dashboard pages
│       ├── inventory/    # Inventory management
│       ├── sales/        # Sales history
│       ├── record-sale/  # Record new sale
│       ├── staff/        # Staff management
│       └── page.tsx      # Dashboard home
├── api/                  # API routes
│   ├── auth/             # Authentication endpoints
│   ├── products/         # Product endpoints
│   ├── sales/            # Sales endpoints
│   └── users/            # User endpoints
├── auth/                 # Authentication pages
│   ├── login/            # Login page
│   └── register/         # Registration page
├── layout.tsx            # Root layout
└── page.tsx              # Home page
```

### Components (`src/components/`)

```
src/components/
├── dashboard/            # Dashboard-specific components
│   ├── ai/               # AI features
│   ├── low-stock-bell.tsx
│   ├── overview/         # Dashboard overview
│   └── record-sale/      # Sale recording
├── shared/               # Shared components
│   ├── page-header.tsx
│   └── theme-toggle.tsx
└── ui/                   # UI primitives (shadcn/ui)
    ├── button.tsx
    ├── dialog.tsx
    ├── input.tsx
    └── [other UI components]
```

### Hooks (`src/hooks/`)

```
src/hooks/
├── use-auth.ts           # Authentication hook
├── use-products.ts       # Product data hook
├── use-sales.ts          # Sales data hook
├── use-sales-monthly.ts  # Monthly sales hook
└── use-rate-limit.ts     # Rate limiting hook
```

### Libraries (`src/lib/`)

```
src/lib/
├── auth.ts               # Authentication utilities
├── cors.ts               # CORS configuration
├── csv-export.ts         # CSV export utilities
├── db.ts                 # Database client
├── fetch-utils.ts        # Fetch utilities
├── rate-limiter.ts       # Rate limiting
├── sales-analytics.ts    # Sales analytics
├── utils.ts              # General utilities
└── validation-schemas.ts # Zod validation schemas
```

### AI Features (`src/ai/`)

```
src/ai/
├── flows/                # Genkit AI flows
├── prompts/              # AI prompts
└── dev.ts                # AI development server
```

### Middleware (`src/middleware.ts`)

Next.js middleware for:

- Authentication
- Route protection
- Request handling

## Database (`prisma/`)

```
prisma/
├── schema.prisma         # Database schema
├── migrations/           # Database migrations
└── seeds/                # Database seeders
    ├── index.ts          # Main seeder
    ├── seed-products.ts  # Product data
    ├── seed-settings.ts  # Settings data
    └── seed-users.ts     # User data
```

## Docker Configuration (`.docker/`)

```
.docker/
├── compose/              # Docker Compose files
│   ├── backup.yml        # Backup configuration
│   ├── postgres.yml      # PostgreSQL configuration
│   └── proxy.yml         # Proxy configuration
├── config/               # Service configurations
│   └── proxy/
│       └── Caddyfile     # Caddy configuration
├── scripts/              # Docker scripts
│   ├── backup/           # Backup scripts
│   └── postgres/         # PostgreSQL scripts
├── ssl/                  # SSL certificates
├── Dockerfile            # Application Dockerfile
└── docker-compose.yml    # Main compose file
```

## Documentation (`docs/`)

```
docs/
├── .vitepress/           # VitePress configuration
├── configuration/        # Configuration guides
├── deployment/           # Deployment guides
├── development/          # Development guides
├── features/             # Feature documentation
└── operations/           # Operations guides
```

## Configuration Files

### Root Level

- `package.json` - Node.js dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `vitest.config.ts` - Vitest test configuration
- `eslint.config.js` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `.env` - Environment variables
- `Makefile` - Make commands

## Key Files

### Application Entry Points

- `src/app/layout.tsx` - Root layout
- `src/app/page.tsx` - Home page
- `src/middleware.ts` - Request middleware

### Database

- `prisma/schema.prisma` - Database schema
- `src/lib/db.ts` - Database client

### Authentication

- `src/lib/auth.ts` - Auth utilities
- `src/app/api/auth/` - Auth endpoints
- `src/hooks/use-auth.ts` - Auth hook

### API Routes

- `src/app/api/products/route.ts` - Products API
- `src/app/api/sales/route.ts` - Sales API
- `src/app/api/users/route.ts` - Users API

## Code Organization

### Feature-Based Structure

Components organized by feature:

- Dashboard components in `components/dashboard/`
- Shared components in `components/shared/`
- UI primitives in `components/ui/`

### API Routes

RESTful API structure:

- `/api/products` - Product operations
- `/api/sales` - Sales operations
- `/api/users` - User operations
- `/api/auth` - Authentication

### Type Safety

- TypeScript throughout
- Prisma for database types
- Zod for validation schemas

## Testing

```
src/
├── hooks/
│   └── use-sales.test.ts
├── lib/
│   └── csv-export.test.ts
└── vitest.setup.ts
```

## Build Output

```
.next/                    # Next.js build output
node_modules/             # Dependencies
dist/                     # Production build
```

## Environment Files

- `.env` - Local environment variables
- `.env.example` - Example environment file
- `.env.cloud.example` - Cloud deployment example

## Scripts

```
scripts/
└── [utility scripts]
```

## Public Assets

```
public/
├── images/
├── icons/
└── [static files]
```

## Naming Conventions

### Files

- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Hooks: `use-feature-name.ts`
- API routes: `route.ts`

### Directories

- Features: `kebab-case/`
- Components: `PascalCase/` or `kebab-case/`

### Code

- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

## Import Paths

TypeScript path aliases:

- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks`

## Related Documentation

- [Local Setup](/development/local-setup)
- [Architecture](/development/architecture)
- [Contributing](/development/contributing)
