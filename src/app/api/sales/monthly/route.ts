import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getMonthlySales } from "@/lib/utils";

const prisma = new PrismaClient();

// Function to get monthly sales
export async function GET(req: NextRequest) {
  // Read the X-User-Id header set by the middleware
  const userId = req.headers.get("X-User-Id");

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await getMonthlySales(prisma);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching monthly sales:", error);
    return NextResponse.json(
      { message: "Failed to fetch monthly sales" },
      { status: 500 }
    );
  }
} 