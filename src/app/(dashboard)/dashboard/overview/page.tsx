
"use client";

import { useAuth } from "@/contexts/auth-context";
import { ManagerOverview } from "@/components/dashboard/overview/manager-overview";
import { CashierOverview } from "@/components/dashboard/overview/cashier-overview";
import { PageHeader } from "@/components/shared/page-header";

export default function OverviewPage() {
  const { user, role } = useAuth();

  if (!user) {
    return null; // Or a loading indicator, AuthProvider should handle redirect
  }

  return (
    <>
      <PageHeader 
        title={`Welcome, ${user.name}!`}
        description={role === "Manager" ? "Here's an overview of your store's performance." : "Here's a summary of your sales activity."}
      />
      {role === "Manager" ? <ManagerOverview /> : <CashierOverview />}
    </>
  );
}
