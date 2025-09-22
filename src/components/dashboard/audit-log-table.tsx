"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuditLogs, useRefreshAuditLogs, type AuditLog, type AuditLogFilters } from "@/hooks/use-audit-logs";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Shield,
} from "lucide-react";
import { useState } from "react";

const entityTypeLabels: Record<string, { label: string; color: string }> = {
  USER: { label: "User", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
  PRODUCT: { label: "Product", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
  DESHELVING: { label: "Deshelving", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" },
};

const actionLabels: Record<string, { label: string; color: string }> = {
  CREATE: { label: "Create", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
  UPDATE: { label: "Update", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
  DELETE: { label: "Delete", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
  RESTORE: { label: "Restore", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" },
  DESHELVE: { label: "Deshelve", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" },
};

export function AuditLogTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [filters, setFilters] = useState<AuditLogFilters>({
    entityType: "",
    action: "",
    userEmail: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  // Use TanStack Query for data fetching
  const { data, isLoading, error, refetch } = useAuditLogs({
    page,
    limit,
    ...filters,
  });

  // Refresh mutation
  const refreshMutation = useRefreshAuditLogs();

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const applyFilters = () => {
    setPage(1);
    refetch();
  };

  const clearFilters = () => {
    setFilters({
      entityType: "",
      action: "",
      userEmail: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  // Handle errors
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load audit logs",
      variant: "destructive",
    });
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatJsonData = (data: any) => {
    if (!data) return "N/A";
    return JSON.stringify(data, null, 2);
  };

  if (isLoading && !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading audit logs...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Audit Logs
              </CardTitle>
              <CardDescription>
                Complete audit trail of all system activities and changes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading || refreshMutation.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading || refreshMutation.isPending ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="border-t">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="entityType">Entity Type</Label>
                <Select
                  value={filters.entityType}
                  onValueChange={(value) => handleFilterChange("entityType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="PRODUCT">Product</SelectItem>
                    <SelectItem value="DESHELVING">Deshelving</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="action">Action</Label>
                <Select
                  value={filters.action}
                  onValueChange={(value) => handleFilterChange("action", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All actions</SelectItem>
                    <SelectItem value="CREATE">Create</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                    <SelectItem value="RESTORE">Restore</SelectItem>
                    <SelectItem value="DESHELVE">Deshelve</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="userEmail">User Email</Label>
                <Input
                  id="userEmail"
                  placeholder="Search by email..."
                  value={filters.userEmail}
                  onChange={(e) => handleFilterChange("userEmail", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                />
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Apply
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Log ID</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.auditLogs.map((log: AuditLog) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {formatTimestamp(log.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={entityTypeLabels[log.entityType]?.color || "bg-gray-100 text-gray-800"}
                      variant="secondary"
                    >
                      {entityTypeLabels[log.entityType]?.label || log.entityType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={actionLabels[log.action]?.color || "bg-gray-100 text-gray-800"}
                      variant="secondary"
                    >
                      {actionLabels[log.action]?.label || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.userEmail}
                  </TableCell>
                  <TableCell className="font-mono text-sm" title={log.entityId}>
                    {log.entityId.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="font-mono text-sm" title={log.id}>
                    {log.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Audit Log Details</DialogTitle>
                          <DialogDescription>
                            Complete details for audit log entry
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <Label>Timestamp</Label>
                              <div className="font-mono text-sm p-2 bg-muted rounded">
                                {formatTimestamp(log.timestamp)}
                              </div>
                            </div>
                            <div>
                              <Label>User</Label>
                              <div className="font-medium p-2 bg-muted rounded">
                                {log.userEmail}
                              </div>
                            </div>
                            <div>
                              <Label>Entity Type</Label>
                              <div className="p-2 bg-muted rounded">
                                <Badge className={entityTypeLabels[log.entityType]?.color}>
                                  {entityTypeLabels[log.entityType]?.label || log.entityType}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label>Action</Label>
                              <div className="p-2 bg-muted rounded">
                                <Badge className={actionLabels[log.action]?.color}>
                                  {actionLabels[log.action]?.label || log.action}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label>Entity ID (Affected Item)</Label>
                              <div className="font-mono text-sm p-2 bg-muted rounded">
                                {log.entityId}
                              </div>
                            </div>
                            <div>
                              <Label>Log ID</Label>
                              <div className="font-mono text-sm p-2 bg-muted rounded">
                                {log.id}
                              </div>
                            </div>
                          </div>

                          {log.oldValues && (
                            <div>
                              <Label>Old Values</Label>
                              <pre className="text-xs p-3 bg-muted rounded overflow-x-auto">
                                {formatJsonData(log.oldValues)}
                              </pre>
                            </div>
                          )}

                          {log.newValues && (
                            <div>
                              <Label>New Values</Label>
                              <pre className="text-xs p-3 bg-muted rounded overflow-x-auto">
                                {formatJsonData(log.newValues)}
                              </pre>
                            </div>
                          )}

                          {log.changes && (
                            <div>
                              <Label>Changes</Label>
                              <pre className="text-xs p-3 bg-muted rounded overflow-x-auto">
                                {formatJsonData(log.changes)}
                              </pre>
                            </div>
                          )}

                          {log.metadata && (
                            <div>
                              <Label>Metadata</Label>
                              <pre className="text-xs p-3 bg-muted rounded overflow-x-auto">
                                {formatJsonData(log.metadata)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(!data?.auditLogs || data.auditLogs.length === 0) && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No audit logs found</p>
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
                Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{" "}
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.totalCount)} of{" "}
                {data.pagination.totalCount} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!data.pagination.hasPrev || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm font-medium">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!data.pagination.hasNext || isLoading}
                >
                  Next
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
