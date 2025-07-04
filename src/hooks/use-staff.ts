import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, UserStatus } from "@/lib/types";
import { usePaginatedQuery } from "./use-paginated-query";

export interface UseStaffParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: string;
  searchTerm?: string;
}

export interface StaffQueryResult {
  data: User[];
  total: number;
}

async function fetchStaffData(params: UseStaffParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page.toString());
  if (params.pageSize) query.set("pageSize", params.pageSize.toString());
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);
  if (params.searchTerm) query.set("search", params.searchTerm);
  const res = await fetch(`/api/users?${query.toString()}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch staff");
  }
  return res.json() as Promise<StaffQueryResult>;
}

export function useStaff(params: UseStaffParams = {}, enabled: boolean = true) {
  return usePaginatedQuery<StaffQueryResult>({
    queryKey: ['staff', params],
    queryFn: () => fetchStaffData(params),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

async function updateUserStatus(userId: string, status: UserStatus) {
  const res = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update user status");
  }
  
  return res.json() as Promise<User>;
}

async function addStaff(staffData: {
  name: string;
  username: string;
  email: string;
  password: string;
  role: "MANAGER" | "CASHIER";
}) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(staffData),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to add staff member");
  }
  
  return res.json();
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      updateUserStatus(userId, status),
    onSuccess: (updatedUser) => {
      // Invalidate and refetch staff data
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useAddStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addStaff,
    onSuccess: () => {
      // Invalidate staff queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
} 