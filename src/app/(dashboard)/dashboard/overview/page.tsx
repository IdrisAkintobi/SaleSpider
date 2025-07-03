"use client";

import { CashierOverview } from "@/components/dashboard/overview/cashier-overview";
import { ManagerOverview } from "@/components/dashboard/overview/manager-overview";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { DollarSign } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function OverviewPage() {
  const { user, userIsManager } = useAuth();
  const [period, setPeriod] = useState<string>("today");

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
  ) : (
    <Select value={period} onValueChange={setPeriod}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="today">Today</SelectItem>
        <SelectItem value="week">This Week</SelectItem>
        <SelectItem value="month">This Month</SelectItem>
        <SelectItem value="year">This Year</SelectItem>
      </SelectContent>
    </Select>
  );

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
      {userIsManager ? <ManagerOverview period={period} /> : <CashierOverview />}
    </>
  );
}
