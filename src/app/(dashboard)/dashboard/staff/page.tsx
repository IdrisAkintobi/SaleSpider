"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useSales } from "@/hooks/use-sales";
import { useStaff, useUpdateUserStatus } from "@/hooks/use-staff";
import { Role } from "@prisma/client";
import type { User, UserStatus } from "@/lib/types";
import {
  Search,
  SlidersHorizontal,
  UserCheck,
  Users,
  UserX,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
  Pencil,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AddStaffDialog } from "./add-staff-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StaffPerformance extends User {
  totalSalesValue: number;
  numberOfSales: number;
}

// Add this outside the component
async function editUser(update: Partial<User> & { id: string }) {
  const res = await fetch("/api/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to update user");
  return res.json();
}

export default function StaffPage() {
  const { user: currentUser, userIsManager, userIsCashier } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffPerformance | null>(
    null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<string>("name");
  const [order, setOrder] = useState<string>("asc");
  const [editStaff, setEditStaff] = useState<StaffPerformance | null>(null);

  // Use custom hooks for data fetching
  const { data, isLoading: isLoadingUsers } = useStaff({
    page,
    pageSize,
    sort,
    order,
    searchTerm,
  }, userIsManager);
  const users = data?.data ?? [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);
  const updateStatusMutation = useUpdateUserStatus();

  // Add after useStaff and before staffList
  const { data: salesData, isLoading: isLoadingSales } = useSales();
  const sales = salesData?.data ?? [];

  // Combine users and sales data to create performance data
  const staffList: StaffPerformance[] = useMemo(() => {
    return users.map((user: User) => {
      const userSales = sales.filter((sale: any) => sale.cashierId === user.id);
      const totalSalesValue = userSales.reduce(
        (sum: number, sale: any) => sum + sale.totalAmount,
        0
      );
      return {
        ...user,
        totalSalesValue,
        numberOfSales: userSales.length,
      };
    });
  }, [users, sales]);

  const isLoading = isLoadingUsers;

  const handleStatusChange = (
    staffMember: StaffPerformance,
    newStatus: boolean
  ) => {
    const status: UserStatus = newStatus ? "ACTIVE" : "INACTIVE";
    
    // Use the mutation with toast handling
    updateStatusMutation.mutate(
      { userId: staffMember.id, status },
      {
        onSuccess: (updatedUser) => {
          toast({
            title: "Status Updated",
            description: `${updatedUser.name}'s status changed to ${updatedUser.status}.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update status",
            variant: "destructive",
          });
        },
      }
    );
  };

  const filteredStaff = useMemo(
    () =>
      staffList
        .filter(
          (staff) =>
            staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.role.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [staffList, searchTerm]
  );

  // Sorting handler
  const handleSort = (field: string) => {
    if (sort === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSort(field);
      setOrder("asc");
    }
    setPage(1);
  };

  // Replace the editMutation definition inside the component with:
  const queryClient = useQueryClient();
  const editMutation = useMutation({
    mutationFn: editUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  if (userIsCashier) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Users className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          Only Managers can access this page.
        </p>
        <Button
          onClick={() => router.push("/dashboard/overview")}
          className="mt-4"
        >
          Go to Overview
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading staff data...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Staff Management"
        description="View staff details, performance, and manage their status."
        actions={
          (currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "MANAGER") && (
            <AddStaffDialog
              isOpen={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              onStaffAdded={() => {}}
            />
          )
        }
      />
      <div className="mb-4">
        <Input
          placeholder="Search staff by name, username, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>Name {sort === "name" && (order === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("username")}>Username {sort === "username" && (order === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("role")}>Role {sort === "role" && (order === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead># Orders</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>Status {sort === "status" && (order === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.username}</TableCell>
                    <TableCell>
                      <Badge variant={userIsManager ? "default" : "secondary"}>{staff.role}</Badge>
                    </TableCell>
                    <TableCell>${staff.totalSalesValue.toFixed(2)}</TableCell>
                    <TableCell>{staff.numberOfSales}</TableCell>
                    <TableCell>
                      <Switch
                        checked={staff.status === "ACTIVE"}
                        onCheckedChange={(checked) => handleStatusChange(staff, checked)}
                        disabled={currentUser?.role !== "SUPER_ADMIN" && (currentUser?.role !== "MANAGER" || staff.role !== "CASHIER")}
                      />
                      <span className="ml-2">{staff.status}</span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditStaff(staff)}
                            disabled={currentUser?.role !== "SUPER_ADMIN" && (currentUser?.role !== "MANAGER" || staff.role !== "CASHIER")}
                          >
                            <Pencil className="mr-2 h-3 w-3" /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Staff: {editStaff?.name}</DialogTitle>
                            <DialogDescription>Update staff details below.</DialogDescription>
                          </DialogHeader>
                          {editStaff && (
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const formData = new FormData(form);
                                const update: any = { id: editStaff.id };
                                if (currentUser?.role === "SUPER_ADMIN" || (currentUser?.role === "MANAGER" && editStaff.role === "CASHIER")) {
                                  update.name = formData.get("name");
                                  update.username = formData.get("username");
                                  update.role = formData.get("role");
                                }
                                editMutation.mutate(update, {
                                  onSuccess: () => {
                                    toast({ title: "Staff updated" });
                                    setEditStaff(null);
                                  },
                                  onError: (error: any) => {
                                    toast({ title: "Error", description: error.message, variant: "destructive" });
                                  },
                                });
                              }}
                              className="space-y-4"
                            >
                              <Input name="name" defaultValue={editStaff.name} placeholder="Name" required disabled={currentUser?.role !== "SUPER_ADMIN" && (currentUser?.role !== "MANAGER" || editStaff.role !== "CASHIER")}/>
                              <Input name="username" defaultValue={editStaff.username} placeholder="Username" required disabled={currentUser?.role !== "SUPER_ADMIN" && (currentUser?.role !== "MANAGER" || editStaff.role !== "CASHIER")}/>
                              <Select
                                name="role"
                                value={editStaff.role}
                                onValueChange={value => {
                                  setEditStaff(editStaff => editStaff ? { ...editStaff, role: value as Role } : editStaff);
                                }}
                                disabled={currentUser?.role !== "SUPER_ADMIN" && (currentUser?.role !== "MANAGER" || editStaff.role !== "CASHIER")}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CASHIER">Cashier</SelectItem>
                                  <SelectItem value="MANAGER">Manager</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setEditStaff(null)}>Cancel</Button>
                                <Button type="submit" variant="default" disabled={editMutation.isPending}>
                                  {editMutation.isPending ? "Saving..." : "Save"}
                                </Button>
                              </div>
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No staff found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-4 py-2 border-t bg-muted">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={() => setPage(1)} disabled={page === 1}><ChevronsLeft className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setPage(page - 1)} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <Button size="icon" variant="ghost" onClick={() => setPage(page + 1)} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronsRight className="w-4 h-4" /></Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Rows per page:</span>
              <Select value={pageSize.toString()} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map(size => (
                    <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
