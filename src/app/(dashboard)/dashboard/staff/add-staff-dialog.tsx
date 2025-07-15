"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useAddStaff } from "@/hooks/use-staff";
import type { Role } from "@prisma/client";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "@/lib/i18n";

const addStaffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["MANAGER", "CASHIER"]),
});

type AddStaffFormData = z.infer<typeof addStaffSchema>;

interface AddStaffDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStaffAdded: () => void;
}

export function AddStaffDialog({
  isOpen,
  onOpenChange,
  onStaffAdded,
}: Readonly<AddStaffDialogProps>) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const t = useTranslation();

  const form = useForm<AddStaffFormData>({
    resolver: zodResolver(addStaffSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role: "CASHIER",
    },
  });

  // Use custom hook for adding staff
  const addStaffMutation = useAddStaff();

  const handleSubmit = (data: AddStaffFormData) => {
    addStaffMutation.mutate(data, {
      onSuccess: (data) => {
        toast({
          title: "Staff Added",
          description: `${data.name} has been added successfully.`,
        });
        
        form.reset();
        onOpenChange(false);
        onStaffAdded();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to add staff member",
          variant: "destructive",
        });
      },
    });
  };

  // Determine available roles based on current user
  const availableRoles: { value: Role; label: string }[] = [];
  if (currentUser?.role === "SUPER_ADMIN") {
    availableRoles.push(
      { value: "MANAGER", label: "Manager" },
      { value: "CASHIER", label: "Cashier" }
    );
  } else if (currentUser?.role === "MANAGER") {
    availableRoles.push({ value: "CASHIER", label: "Cashier" });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          {t("add_staff")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("add_new_staff_member")}</DialogTitle>
          <DialogDescription>
            {t("add_staff_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("full_name")}</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder={t("enter_full_name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t("username")}</Label>
            <Input
              id="username"
              {...form.register("username")}
              placeholder={t("enter_username")}
            />
            {form.formState.errors.username && (
              <p className="text-sm text-destructive">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder={t("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              placeholder={t("enter_password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t("role")}</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(value) => form.setValue("role", value as "MANAGER" | "CASHIER")}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("select_role")} />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={addStaffMutation.isPending}>
              {addStaffMutation.isPending ? t("adding") : t("add_staff")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 