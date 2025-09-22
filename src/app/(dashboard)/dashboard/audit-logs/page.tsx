"use client";

import { AuditLogTable } from "@/components/dashboard/audit-log-table";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle } from "lucide-react";

export default function AuditLogsPage() {
  const { user } = useAuth();
  const isAuthorized = user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";

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
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete audit trail of all system activities, changes, and user actions for compliance and security monitoring.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Manager"} Access
        </Badge>
      </div>

      {/* Audit Log Table */}
      <AuditLogTable />
    </div>
  );
}
