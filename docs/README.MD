# SaleSpider Documentation

This directory contains comprehensive documentation for the SaleSpider project.

## Documentation Index

### 📋 [BLUEPRINT.MD](BLUEPRINT.MD)
Project architecture, design patterns, and overall system structure.

### ⚙️ [SETTINGS.MD](SETTINGS.MD)
Application settings configuration, environment variables, and customization options.

### 🔗 [PATH_ALIASES.MD](PATH_ALIASES.MD)
TypeScript path aliases guide with usage examples and best practices for clean imports.

## Quick Reference

### Path Aliases
```typescript
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { DEFAULT_SETTINGS } from "@/lib/constants";
```

### Development Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run seed         # Seed database with sample data
npm run typecheck    # Run TypeScript type checking
```

### Project Structure
```
src/
├── app/             # Next.js app directory
├── components/      # React components
├── hooks/          # Custom React hooks
├── contexts/       # React contexts
├── lib/            # Utility libraries
├── ai/             # AI-related code
└── types/          # TypeScript type definitions

prisma/
├── schema.prisma   # Database schema
└── seeds/          # Database seed scripts

docs/
├── BLUEPRINT.MD    # Project architecture
├── SETTINGS.MD     # Configuration guide
└── PATH_ALIASES.MD # Import aliases guide
```

## Contributing

When adding new documentation:

1. Use uppercase `.MD` file extension
2. Follow the existing structure and formatting
3. Update this index file with new documentation
4. Include practical examples where applicable
5. Keep documentation up-to-date with code changes

## Getting Help

- Check the relevant documentation file for your topic
- Review the main [README.md](../README.md) for setup instructions
- Examine the code examples in each documentation file
