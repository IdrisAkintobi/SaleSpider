"use client";

import { AuditLogTable } from "@/components/dashboard/audit-log-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { exportAuditLogsCSV } from "@/lib/csv-export";
import { Shield, AlertTriangle, Download } from "lucide-react";
import { useState } from "react";

export default function AuditLogsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const isAuthorized = user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await exportAuditLogsCSV();
      toast({
        title: t("exportSuccess"),
        description: t("exportSuccess"),
      });
    } catch (error) {
      console.error("Error exporting audit logs:", error);
      toast({
        title: t("exportError"),
        description: error instanceof Error ? error.message : t("exportError"),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground text-center">
              Only managers and administrators can access audit logs.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8" />
            {t("auditLogs")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("auditLogsDescription")}
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          disabled={isExporting}
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? t("exportingData") : t("exportCSV")}
        </Button>
      </div>

      {/* Audit Log Table */}
      <AuditLogTable />
    </div>
  );
}
