import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isCashier(user: User | null) {
  return user?.role === "CASHIER";
}

export function isManager(user: User | null) {
  return user?.role === "MANAGER" || user?.role === "SUPER_ADMIN";
}
