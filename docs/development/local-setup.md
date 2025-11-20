# Local Development Setup

This guide will help you set up SaleSpider for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 24.0.0
- **npm** or **yarn**
- **PostgreSQL** >= 14
- **Git**
- **Docker** (optional, for containerized development)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/IdrisAkintobi/SaleSpider.git
cd SaleSpider
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp env.example .env
```

Edit `.env` and configure your settings:

```bash
# Database
DATABASE_URL="postgresql://salespider:password@localhost:5432/salespider"

# Authentication
JWT_SECRET="your-development-secret-key-change-this"
JWT_EXPIRES_IN="7d"

# AI Features (optional)
GOOGLE_GENAI_API_KEY="your-google-ai-api-key"

# Application
NODE_ENV="development"
PORT=3000
```

### 4. Set Up the Database

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL with Docker Compose
make docker-up

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npm run seed
```

#### Option B: Local PostgreSQL

```bash
# Create database
createdb salespider

# Run migrations
npx prisma migrate dev

# Seed the database
npm run seed
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

### AI Development

```bash
# Start Genkit development server
npm run genkit:dev

# Start Genkit with auto-reload
npm run genkit:watch
```

## Docker Development

### Using Docker Compose

```bash
# Start all services
make docker-up

# Stop all services
make docker-down

# View logs
make docker-logs

# Rebuild containers
make docker-build
```

### Available Make Commands

```bash
make help              # Show all available commands
make docker-up         # Start Docker services
make docker-down       # Stop Docker services
make docker-logs       # View container logs
make docker-build      # Rebuild containers
make backup            # Create database backup
make restore           # Restore database backup
```

## Project Structure

```
SaleSpider/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── (dashboard)/  # Dashboard routes
│   │   ├── api/          # API routes
│   │   └── auth/         # Authentication pages
│   ├── components/       # React components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── shared/       # Shared components
│   │   └── ui/           # UI primitives
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── ai/               # AI/Genkit features
│   └── middleware.ts     # Next.js middleware
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seeds/            # Database seeders
├── .docker/              # Docker configuration
├── docs/                 # Documentation
└── public/               # Static assets
```

## Common Issues

### Port Already in Use

If port 3000 is already in use:

```bash
# Change port in .env
PORT=3001

# Or use a different port directly
npm run dev -- -p 3001
```

### Database Connection Issues

1. Verify PostgreSQL is running:

```bash
# Check PostgreSQL status
pg_isready

# Or with Docker
docker ps | grep postgres
```

2. Check your `DATABASE_URL` in `.env`
3. Ensure database exists and credentials are correct

### Prisma Client Issues

If you encounter Prisma client errors:

```bash
# Regenerate Prisma client
npx prisma generate

# Reset and regenerate
npx prisma migrate reset
```

### Node Version Issues

Ensure you're using Node.js >= 24:

```bash
node --version

# Use nvm to switch versions
nvm use 24
```

## Development Tips

### Hot Reload

The development server supports hot reload. Changes to files will automatically refresh the browser.

### Debugging

1. **VS Code**: Use the built-in debugger with the provided launch configuration
2. **Browser DevTools**: Use React DevTools and Network tab
3. **Server Logs**: Check terminal output for server-side errors

### Database Inspection

Use Prisma Studio for a visual database interface:

```bash
npx prisma studio
```

Access at `http://localhost:5555`

### API Testing

Use tools like:

- **Postman** or **Insomnia** for API testing
- **curl** for command-line testing
- Built-in API routes at `/api/*`

## Next Steps

- [Project Structure](/development/structure)
- [Architecture Overview](/development/architecture)
- [Contributing Guidelines](/development/contributing)
- [Testing Guide](/development/testing)
