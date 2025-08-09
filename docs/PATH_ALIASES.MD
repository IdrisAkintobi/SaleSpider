# Path Aliases Guide

This document explains the TypeScript path aliases configured in the SaleSpider project and how to use them effectively.

## Available Path Aliases

| Alias | Maps To | Purpose | Example |
|-------|---------|---------|---------|
| `@/*` | `./src/*` | Root src directory | `@/middleware` |
| `@/components/*` | `./src/components/*` | UI components | `@/components/ui/button` |
| `@/lib/*` | `./src/lib/*` | Utility libraries | `@/lib/constants` |
| `@/hooks/*` | `./src/hooks/*` | React hooks | `@/hooks/use-auth` |
| `@/contexts/*` | `./src/contexts/*` | React contexts | `@/contexts/auth-context` |
| `@/app/*` | `./src/app/*` | Next.js app directory | `@/app/api/auth/route` |
| `@/ai/*` | `./src/ai/*` | AI-related code | `@/ai/flows/inventory` |
| `@/prisma/*` | `./prisma/*` | Prisma schema/seeds | `@/prisma/seeds/seed-settings` |
| `@/types/*` | `./src/types/*` | TypeScript types | `@/types/user` |

## Benefits

### ✅ Before (Relative Imports)
```typescript
// Fragile and hard to read
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../contexts/auth-context";
import { DEFAULT_SETTINGS } from "../lib/constants";
```

### ✅ After (Path Aliases)
```typescript
// Clean and maintainable
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { DEFAULT_SETTINGS } from "@/lib/constants";
```

## Usage Examples

### Components
```typescript
// UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";

// Feature Components
import { DashboardHeader } from "@/components/dashboard/header";
import { SalesForm } from "@/components/sales/sales-form";
```

### Hooks & Contexts
```typescript
// Custom hooks
import { useAuth } from "@/hooks/use-auth";
import { useSales } from "@/hooks/use-sales";
import { useToast } from "@/hooks/use-toast";

// React contexts
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/contexts/settings-context";
```

### Utilities & Libraries
```typescript
// Constants and configuration
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Business logic
import { calculateVatAmount } from "@/lib/vat";
import { formatCurrency } from "@/lib/currency";
```

### API Routes
```typescript
// API utilities
import { setCookie } from "@/app/api/auth/lib/cookie-handler";
import { validateRequest } from "@/app/api/lib/validation";
```

### Database & Seeds
```typescript
// Prisma operations
import { seedSettings } from "@/prisma/seeds/seed-settings";
import { seedProducts } from "@/prisma/seeds/seed-products";
```

### AI Features
```typescript
// AI flows and utilities
import { generateRecommendations } from "@/ai/flows/inventory-recommendations";
import { ai } from "@/ai/genkit";
```

## Best Practices

### 1. Use Specific Aliases When Available
```typescript
// ✅ Good - Uses specific alias
import { useAuth } from "@/hooks/use-auth";

// ❌ Avoid - Generic alias when specific exists
import { useAuth } from "@/hooks/use-auth";
```

### 2. Group Imports by Type
```typescript
// External libraries
import React from "react";
import { NextRequest } from "next/server";

// Internal - Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Internal - Hooks & Contexts
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Internal - Utilities
import { cn } from "@/lib/utils";
import { DEFAULT_SETTINGS } from "@/lib/constants";
```

### 3. Consistent Usage
Always use path aliases instead of relative imports for internal modules:

```typescript
// ✅ Consistent
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

// ❌ Inconsistent
import { Button } from "@/components/ui/button";
import { useAuth } from "../hooks/use-auth";  // Don't mix!
```

## IDE Configuration

Most modern IDEs (VS Code, WebStorm, etc.) automatically recognize TypeScript path aliases from `tsconfig.json`. Features you get:

- ✅ Auto-completion for imports
- ✅ Go-to-definition navigation
- ✅ Automatic import suggestions
- ✅ Refactoring support

## Script Support

The project uses `tsx` for running TypeScript scripts (like database seeds) which natively supports these path aliases:

```bash
# This works with all path aliases
npm run seed
```

## Migration Guide

When refactoring existing code to use path aliases:

1. **Identify relative imports**: Look for imports with `../` or `./`
2. **Choose appropriate alias**: Use the most specific alias available
3. **Update imports**: Replace relative paths with aliases
4. **Test**: Ensure everything still works

Example migration:
```typescript
// Before
import { Button } from "../../../components/ui/button";

// After  
import { Button } from "@/components/ui/button";
```

## Configuration

Path aliases are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/contexts/*": ["./src/contexts/*"],
      "@/app/*": ["./src/app/*"],
      "@/ai/*": ["./src/ai/*"],
      "@/prisma/*": ["./prisma/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

This configuration enables both TypeScript compilation and IDE support for path aliases.
