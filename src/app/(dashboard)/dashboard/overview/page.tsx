"use client";

import { CashierOverview } from "@/components/dashboard/overview/cashier-overview";
import { ManagerOverview } from "@/components/dashboard/overview/manager-overview";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/contexts/auth-context";

export default function OverviewPage() {
  const { user, userIsManager } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <>
      <PageHeader
        title={`Welcome, ${user.name}!`}
        description={
          userIsManager
            ? "Here's an overview of your store's performance."
            : "Here's a summary of your sales activity."
        }
      />
      {userIsManager ? <ManagerOverview /> : <CashierOverview />}
    </>
  );
}
