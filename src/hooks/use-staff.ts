import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, UserStatus } from "@/lib/types";

async function fetchStaffData() {
  const res = await fetch("/api/users");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch staff");
  }
  return res.json() as Promise<User[]>;
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

export function useStaff(enabled: boolean = true) {
  return useQuery({
    queryKey: ['staff'],
    queryFn: fetchStaffData,
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
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