/**
 * Path Aliases Demonstration
 * This file showcases all the available path aliases in the SaleSpider project
 * and demonstrates how they improve code organization and readability.
 */

// ✅ BEFORE: Ugly relative imports
// import { DEFAULT_SETTINGS } from "../lib/constants";
// import { useAuth } from "../contexts/auth-context";
// import { Button } from "../components/ui/button";
// import { useToast } from "../hooks/use-toast";

// ✅ AFTER: Clean path aliases
import { useAuth } from "@/contexts/auth-context"; // @/contexts/* alias
import { useToast } from "@/hooks/use-toast"; // @/hooks/* alias
import { DEFAULT_SETTINGS } from "@/lib/constants"; // @/lib/* alias

// Example usage of Prisma alias (for seed scripts and database operations)
// import { seedSettings } from "@/prisma/seeds/seed-settings";  // @/prisma/* alias

// Example usage of AI alias
// import { generateRecommendations } from "@/ai/flows/inventory-recommendations";  // @/ai/* alias

// Example usage of App alias (for API routes and app-specific code)
// import { authTokenKey } from "@/app/api/auth/lib/cookie-handler";  // @/app/* alias

/**
 * Available Path Aliases:
 *
 * @/*           - Root src directory (./src/*)
 * @/components/* - UI components (./src/components/*)
 * @/lib/*       - Utility libraries (./src/lib/*)
 * @/hooks/*     - React hooks (./src/hooks/*)
 * @/contexts/*  - React contexts (./src/contexts/*)
 * @/app/*       - Next.js app directory (./src/app/*)
 * @/ai/*        - AI-related code (./src/ai/*)
 * @/prisma/*    - Prisma schema and seeds (./prisma/*)
 * @/types/*     - TypeScript type definitions (./src/types/*)
 *
 * Benefits:
 * ✅ No more ../../../ relative path hell
 * ✅ Imports remain stable when moving files
 * ✅ Clear organization by feature/type
 * ✅ Better IDE autocomplete and navigation
 * ✅ Consistent with modern React/Next.js practices
 */

export function pathAliasesDemo() {
  // This function demonstrates how clean imports make code more readable
  const { user } = useAuth();
  const { toast } = useToast();

  console.log("App settings:", DEFAULT_SETTINGS);
  console.log("Current user:", user);

  return {
    message: "Path aliases make imports clean and maintainable!",
    aliases: [
      "@/components/*",
      "@/lib/*",
      "@/hooks/*",
      "@/contexts/*",
      "@/app/*",
      "@/ai/*",
      "@/prisma/*",
      "@/types/*",
    ],
  };
}
