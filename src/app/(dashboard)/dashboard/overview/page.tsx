"use client";

import { CashierOverview } from "@/components/dashboard/overview/cashier-overview";
import { ManagerOverview } from "@/components/dashboard/overview/manager-overview";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

export default function OverviewPage() {
  const { user, userIsManager } = useAuth();
  const t = useTranslation();
  const [period, setPeriod] = useState<string>("today");

  if (!user) {
    return null;
  }

  // Create the Record New Sale button for cashiers
  const recordSaleAction = !userIsManager ? (
    <Button size="lg" asChild>
      <Link href="/dashboard/record-sale">
        <ShoppingCart className="mr-2 h-5 w-5" /> {t("record_sale")}
      </Link>
    </Button>
  ) : (
    <Select value={period} onValueChange={setPeriod}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="today">{t("today")}</SelectItem>
        <SelectItem value="week">{t("this_week")}</SelectItem>
        <SelectItem value="month">{t("this_month")}</SelectItem>
        <SelectItem value="year">{t("this_year")}</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <>
      <PageHeader
        title={`${t("welcome")}, ${user.name}!`}
        description={
          userIsManager
            ? t("manager_overview_description")
            : t("cashier_overview_description")
        }
        actions={recordSaleAction}
      />
      {userIsManager ? <ManagerOverview period={period} /> : <CashierOverview />}
    </>
  );
}
