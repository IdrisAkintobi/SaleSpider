"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VirtualTable } from "@/components/ui/virtual-table";
import {
  useAuditLogs,
  useRefreshAuditLogs,
  type AuditLog,
  type AuditLogFilters,
} from "@/hooks/use-audit-logs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { useRenderTime, usePagePerformance, useSlowRenderDetector } from "@/hooks/use-performance";
import { ChevronLeft, ChevronRight, Eye, Filter, RefreshCw, Search, Shield } from "lucide-react";
import { useMemo, useState } from "react";

const entityTypeLabels: Record<string, { label: string; color: string }> = {
  USER: {
    label: "User",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  },
  PRODUCT: {
    label: "Product",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  },
  DESHELVING: {
    label: "Deshelving",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  },
};

const actionLabels: Record<string, { label: string; color: string }> = {
  CREATE: {
    label: "Create",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  },
  UPDATE: {
    label: "Update",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  },
  DELETE: {
    label: "Delete",
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  },
  RESTORE: {
    label: "Restore",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  },
  DESHELVE: {
    label: "Deshelve",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  },
};

export function AuditLogTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [filters, setFilters] = useState<AuditLogFilters>({
    entityType: "all",
    action: "all",
    userEmail: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const t = useTranslation();

  useRenderTime("AuditLogTable");
  usePagePerformance("Audit Logs Page");
  const performanceStats = useSlowRenderDetector(16);

  if (
    process.env.NODE_ENV === "development" &&
    performanceStats.slowRenderPercentage > 10
  ) {
    console.warn(
      `AuditLogTable: ${performanceStats.slowRenderPercentage.toFixed(
        1
      )}% slow renders`
    );
  }
  // Transform filters for API call (convert "all" to empty string)
  const apiFilters = {
    ...filters,
    entityType: filters.entityType === "all" ? "" : filters.entityType,
    action: filters.action === "all" ? "" : filters.action,
  };

  const { data, isLoading, error, refetch } = useAuditLogs({
    page,
    limit,
    ...apiFilters,
  });

  const refreshMutation = useRefreshAuditLogs();

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: AuditLogFilters) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const applyFilters = () => {
    setPage(1);
    refetch();
  };

  const clearFilters = () => {
    setFilters({
      entityType: "all",
      action: "all",
      userEmail: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  if (error) {
    toast({
      title: t("error"),
      description: t("failedToLoadAuditLogs"),
      variant: "destructive",
    });
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatJsonData = (data: any) => {
    if (!data) return "N/A";
    return JSON.stringify(data, null, 2);
  };

  const AuditLogRow = useMemo(() => {
    const Component = ({ log }: { log: AuditLog }) => (
      <div
        key={log.id}
        className="flex items-center border-b border-border p-4 hover:bg-muted/50 transition-colors"
        style={{ height: "80px" }}
      >
        <div className="flex-1 min-w-0 grid grid-cols-6 gap-4 items-center">
          <div className="font-mono text-sm text-muted-foreground">
            {formatTimestamp(log.timestamp)}
          </div>

          <div className="flex items-center gap-2">
            <Badge
              className={
                entityTypeLabels[log.entityType]?.color ||
                "bg-gray-100 text-gray-800"
              }
            >
              {entityTypeLabels[log.entityType]?.label || log.entityType}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              className={
                actionLabels[log.action]?.color || "bg-gray-100 text-gray-800"
              }
            >
              {actionLabels[log.action]?.label || log.action}
            </Badge>
          </div>

          <div className="font-mono text-sm truncate">{log.entityId}</div>

          <div className="text-sm text-muted-foreground truncate">
            {log.userEmail || "System"}
          </div>

          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>{t("auditLogDetails")}</DialogTitle>
                  <DialogDescription>
                    {log.entityType} {log.action} -{" "}
                    {new Date(log.timestamp).toLocaleString()}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">{t("entityId")}</Label>
                      <p className="font-mono text-sm mt-1">{log.entityId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">{t("user")}</Label>
                      <p className="text-sm mt-1">{log.userEmail || t("system")}</p>
                    </div>
                  </div>
                  {log.changes && (
                    <div>
                      <Label className="text-sm font-medium">{t("changes")}</Label>
                      <pre className="bg-muted p-3 rounded-md text-xs overflow-auto mt-1">
                        {formatJsonData(log.changes)}
                      </pre>
                    </div>
                  )}
                  {log.oldValues && (
                    <div>
                      <Label className="text-sm font-medium">{t("oldValues")}</Label>
                      <pre className="bg-muted p-3 rounded-md text-xs overflow-auto mt-1">
                        {formatJsonData(log.oldValues)}
                      </pre>
                    </div>
                  )}
                  {log.newValues && (
                    <div>
                      <Label className="text-sm font-medium">{t("newValues")}</Label>
                      <pre className="bg-muted p-3 rounded-md text-xs overflow-auto mt-1">
                        {formatJsonData(log.newValues)}
                      </pre>
                    </div>
                  )}
                  {log.metadata && (
                    <div>
                      <Label className="text-sm font-medium">{t("metadata")}</Label>
                      <pre className="bg-muted p-3 rounded-md text-xs overflow-auto mt-1">
                        {formatJsonData(log.metadata)}
                      </pre>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
    Component.displayName = 'AuditLogRow';
    return Component;
  }, []);
  const auditLogs = data?.auditLogs || [];
  const shouldUseVirtualScrolling = auditLogs.length > 50;

  if (isLoading && !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            {t("loadingAuditLogs")}...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Shield className="h-8 w-8 opacity-20 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {t("filters")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("refresh")}
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="border-t">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="entityType">{t("entityType")}</Label>
                <Select
                  value={filters.entityType}
                  onValueChange={(value) =>
                    handleFilterChange("entityType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("allTypes")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allTypes")}</SelectItem>
                    <SelectItem value="USER">{t("user")}</SelectItem>
                    <SelectItem value="PRODUCT">{t("product")}</SelectItem>
                    <SelectItem value="DESHELVING">{t("deshelving")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="action">{t("action")}</Label>
                <Select
                  value={filters.action}
                  onValueChange={(value) => handleFilterChange("action", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("allActions")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allActions")}</SelectItem>
                    <SelectItem value="CREATE">{t("create")}</SelectItem>
                    <SelectItem value="UPDATE">{t("update")}</SelectItem>
                    <SelectItem value="DELETE">{t("delete")}</SelectItem>
                    <SelectItem value="RESTORE">{t("restore")}</SelectItem>
                    <SelectItem value="DESHELVE">{t("deshelve")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="userEmail">{t("userEmail")}</Label>
                <Input
                  id="userEmail"
                  placeholder={t("searchByEmail")}
                  value={filters.userEmail}
                  onChange={(e) =>
                    handleFilterChange("userEmail", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="startDate">{t("startDate")}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="endDate">{t("endDate")}</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  {t("apply")}
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  {t("clear")}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-border bg-muted/50 p-4">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground">
              <div>{t("date")}</div>
              <div>{t("entity")}</div>
              <div>{t("action")}</div>
              <div>{t("entityId")}</div>
              <div>{t("user")}</div>
              <div className="text-right">{t("details")}</div>
            </div>
          </div>

          {shouldUseVirtualScrolling ? (
            <VirtualTable
              data={auditLogs}
              itemHeight={80}
              containerHeight={600}
              renderItem={(log: AuditLog) => <AuditLogRow log={log} />}
              className="border-0"
            />
          ) : (
            <div className="max-h-[600px] overflow-auto">
              {auditLogs.map((log: AuditLog) => (
                <AuditLogRow key={log.id} log={log} />
              ))}
            </div>
          )}

          {(!auditLogs || auditLogs.length === 0) && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t("noAuditLogsFound")}</p>
              {Object.values(filters).some(Boolean) && (
                <p className="text-sm mt-1">{t("tryAdjustingFilters")}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t("showingEntries")} {(data.pagination.page - 1) * data.pagination.limit + 1}{" "}
                {t("to")}{" "}
                {Math.min(
                  data.pagination.page * data.pagination.limit,
                  data.pagination.totalCount
                )}{" "}
                {t("of")} {data.pagination.totalCount} {t("entries")}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!data.pagination.hasPrev || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </Button>
                <span className="text-sm font-medium">
                  {t("page")} {data.pagination.page} {t("of")} {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!data.pagination.hasNext || isLoading}
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
