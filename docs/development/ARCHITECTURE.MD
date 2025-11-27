# Architecture Overview

SaleSpider is built with modern web technologies and follows best practices for scalability, maintainability, and performance.

## Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **TanStack Query** - Data fetching and caching
- **Recharts** - Data visualization

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Relational database
- **Jose** - JWT authentication
- **Argon2** - Password hashing

### AI & Analytics

- **Google Genkit** - AI framework
- **Google Generative AI** - LLM integration

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **pgBackRest** - PostgreSQL backup solution
- **Caddy** - Reverse proxy and HTTPS

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│                    ┌──────────────┐                          │
│                    │   Browser    │                          │
│                    └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Next.js App Router                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │ Dashboard  │  │   Sales    │  │ Inventory  │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes (Next.js)                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   Auth     │  │   Sales    │  │  Products  │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Business Logic Layer                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   Hooks    │  │    Lib     │  │     AI     │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Prisma ORM                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  PostgreSQL                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### Authentication & Authorization

**JWT-based Authentication**

- Stateless authentication using JWT tokens
- Secure password hashing with Argon2
- Role-based access control (Admin, Manager, Cashier)
- Middleware-based route protection

```typescript
// Authentication flow
User Login → Validate Credentials → Generate JWT → Store in Cookie
Protected Route → Verify JWT → Check Role → Allow/Deny Access
```

### Data Management

**Prisma ORM**

- Type-safe database queries
- Automatic migrations
- Schema-first development
- Connection pooling

**Database Schema**

```
Users ──┬── Sales
        ├── Products
        └── Settings

Sales ──── SaleItems ──── Products

Products ──── Categories
```

### State Management

**TanStack Query**

- Server state management
- Automatic caching and revalidation
- Optimistic updates
- Background refetching

**React Hooks**

- Custom hooks for business logic
- Separation of concerns
- Reusable state logic

### API Design

**RESTful API Routes**

```
/api/auth/login          POST   - User authentication
/api/users               GET    - List users
/api/users               POST   - Create user
/api/users/[id]          PUT    - Update user
/api/users/[id]          DELETE - Delete user
/api/products            GET    - List products
/api/products            POST   - Create product
/api/products/[id]       PUT    - Update product
/api/products/low-stock  GET    - Low stock alerts
/api/sales               GET    - List sales
/api/sales               POST   - Create sale
/api/sales/analytics     GET    - Sales analytics
```

### AI Integration

**Google Genkit Framework**

- AI-powered sales insights
- Inventory recommendations
- Predictive analytics
- Natural language processing

```typescript
// AI flow
User Request → Genkit Flow → LLM Processing → Structured Response
```

## Design Patterns

### Component Architecture

**Atomic Design**

- **Atoms**: Basic UI elements (Button, Input)
- **Molecules**: Simple component groups (FormField)
- **Organisms**: Complex components (ProductGrid, SalesTable)
- **Templates**: Page layouts
- **Pages**: Complete views

### Code Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Dashboard layout group
│   │   └── dashboard/      # Dashboard pages
│   ├── api/                # API routes
│   └── auth/               # Auth pages
├── components/
│   ├── dashboard/          # Feature-specific components
│   ├── shared/             # Shared components
│   └── ui/                 # UI primitives
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and helpers
│   ├── auth.ts            # Authentication utilities
│   ├── db.ts              # Database client
│   ├── validation-schemas.ts  # Zod schemas
│   └── rate-limiter.ts    # Rate limiting
├── ai/                     # AI/Genkit flows
└── middleware.ts           # Next.js middleware
```

### Error Handling

**Layered Error Handling**

1. **API Layer**: Catch and format errors
2. **Business Logic**: Validate and throw specific errors
3. **UI Layer**: Display user-friendly messages

```typescript
try {
  // Business logic
} catch (error) {
  if (error instanceof ValidationError) {
    return { error: 'Invalid input' }
  }
  return { error: 'Something went wrong' }
}
```

## Security Architecture

### Authentication Security

- JWT tokens with expiration
- HTTP-only cookies
- Secure password hashing (Argon2)
- CSRF protection

### API Security

- Rate limiting
- Input validation (Zod)
- SQL injection prevention (Prisma)
- XSS protection (React)

### Data Security

- Encrypted database connections
- Environment variable management
- Secure backup encryption
- Role-based access control

## Performance Optimization

### Frontend Optimization

- Server-side rendering (SSR)
- Static generation where possible
- Image optimization (Next.js Image)
- Code splitting
- Lazy loading

### Backend Optimization

- Database connection pooling
- Query optimization
- Caching with TanStack Query
- API response compression

### Database Optimization

- Indexed columns
- Efficient queries
- Connection pooling
- Regular maintenance

## Scalability Considerations

### Horizontal Scaling

- Stateless API design
- Database connection pooling
- Load balancing ready
- Container orchestration

### Vertical Scaling

- Efficient resource usage
- Optimized queries
- Caching strategies
- Background job processing

## Deployment Architecture

### Docker Containers

```
┌─────────────────────────────────────────┐
│           Caddy (Reverse Proxy)         │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│   Next.js     │       │  PostgreSQL   │
│   Container   │◄──────┤   Container   │
└───────────────┘       └───────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
            ┌───────────────┐
            │  pgBackRest   │
            │   (Backup)    │
            └───────────────┘
```

### Environment Separation

- **Development**: Local with hot reload
- **Staging**: Docker Compose setup
- **Production**: Optimized containers with backups

## Monitoring & Logging

### Application Logging

- Structured logging with Pino
- Error tracking
- Performance monitoring
- User activity logs

### Database Monitoring

- Query performance
- Connection pool status
- Backup verification
- Storage usage

## Testing Strategy

### Unit Tests

- Component testing
- Hook testing
- Utility function testing
- Vitest framework

### Integration Tests

- API endpoint testing
- Database operations
- Authentication flows

### End-to-End Tests

- User workflows
- Critical paths
- Cross-browser testing

## Future Architecture Considerations

### Potential Enhancements

- Microservices architecture
- Message queue integration
- Real-time features (WebSockets)
- Multi-tenancy support
- GraphQL API layer

## Related Documentation

- [Local Setup](/development/local-setup)
- [Project Structure](/development/structure)
- [Contributing Guidelines](/development/contributing)
- [Deployment Guide](/deployment/)
