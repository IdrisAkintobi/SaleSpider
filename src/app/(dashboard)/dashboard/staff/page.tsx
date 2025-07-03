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
import type { User, UserStatus } from "@/lib/types";
import {
  Search,
  SlidersHorizontal,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AddStaffDialog } from "./add-staff-dialog";

interface StaffPerformance extends User {
  totalSalesValue: number;
  numberOfSales: number;
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

  // Use custom hooks for data fetching
  const { data: users = [], isLoading: isLoadingUsers } = useStaff(userIsManager);
  const { data: sales = [], isLoading: isLoadingSales } = useSales();
  const updateStatusMutation = useUpdateUserStatus();

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

  const isLoading = isLoadingUsers || isLoadingSales;

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
              onStaffAdded={() => {
                // No need to invalidate queries here, as the mutation handles it
              }}
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
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead># Orders</TableHead>
                <TableHead>Status</TableHead>
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
                      <Badge variant={userIsManager ? "default" : "secondary"}>
                        {staff.role}
                      </Badge>
                    </TableCell>
                    <TableCell>${staff.totalSalesValue.toFixed(2)}</TableCell>
                    <TableCell>{staff.numberOfSales}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          staff.status === "ACTIVE" ? "outline" : "destructive"
                        }
                        className={
                          staff.status === "ACTIVE"
                            ? "border-green-500 text-green-600"
                            : ""
                        }
                      >
                        {staff.status === "ACTIVE" ? (
                          <UserCheck className="mr-1 h-3 w-3" />
                        ) : (
                          <UserX className="mr-1 h-3 w-3" />
                        )}
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedStaff(staff)}
                          >
                            <SlidersHorizontal className="mr-2 h-3 w-3" /> View
                            Performance
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Performance: {selectedStaff?.name}
                            </DialogTitle>
                            <DialogDescription>
                              Detailed sales performance.
                            </DialogDescription>
                          </DialogHeader>
                          {selectedStaff && (
                            <div className="py-4 space-y-2">
                              <p>
                                <strong>Total Sales Value:</strong> $
                                {selectedStaff.totalSalesValue.toFixed(2)}
                              </p>
                              <p>
                                <strong>Number of Orders:</strong>{" "}
                                {selectedStaff.numberOfSales}
                              </p>
                              <p>
                                <strong>Average Order Value:</strong> $
                                {selectedStaff.numberOfSales > 0
                                  ? (
                                      selectedStaff.totalSalesValue /
                                      selectedStaff.numberOfSales
                                    ).toFixed(2)
                                  : "0.00"}
                              </p>
                              <p className="text-xs text-muted-foreground pt-2">
                                Staff ID: {selectedStaff.id}
                              </p>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Switch
                        checked={staff.status === "ACTIVE"}
                        onCheckedChange={(checked) =>
                          handleStatusChange(staff, checked)
                        }
                        disabled={staff.id === currentUser?.id} // Prevent self-deactivation
                        aria-label={`Toggle status for ${staff.name}`}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No staff members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
