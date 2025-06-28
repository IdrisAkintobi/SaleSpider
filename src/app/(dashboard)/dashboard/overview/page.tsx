"use client";

import { CashierOverview } from "@/components/dashboard/overview/cashier-overview";
import { ManagerOverview } from "@/components/dashboard/overview/manager-overview";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { DollarSign } from "lucide-react";
import Link from "next/link";

export default function OverviewPage() {
  const { user, userIsManager } = useAuth();

  if (!user) {
    return null;
  }

  // Create the Record New Sale button for cashiers
  const recordSaleAction = !userIsManager ? (
    <Button size="lg" asChild>
      <Link href="/dashboard/record-sale">
        <DollarSign className="mr-2 h-5 w-5" /> Record New Sale
      </Link>
    </Button>
  ) : undefined;

  return (
    <>
      <PageHeader
        title={`Welcome, ${user.name}!`}
        description={
          userIsManager
            ? "Here's an overview of your store's performance."
            : "Here's a summary of your sales activity."
        }
        actions={recordSaleAction}
      />
      {userIsManager ? <ManagerOverview /> : <CashierOverview />}
    </>
  );
}
