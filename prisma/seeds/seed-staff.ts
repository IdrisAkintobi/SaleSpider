import { PrismaClient, Role, UserStatus } from "@prisma/client";
import * as argon2 from "argon2";

export async function seedStaff(client: PrismaClient) {
  const staffData = [
    {
      id: "manager_001",
      name: "Idris Akintobi",
      username: "idrisakintobi",
      email: "idris.akintobi@salespider.com",
      password: "Password123#",
      role: Role.MANAGER,
      status: UserStatus.ACTIVE,
    },
    {
      id: "user_cashier_001",
      name: "John Walker",
      username: "cashier1",
      email: "john.walker@salespider.com",
      password: "Password123#",
      role: Role.CASHIER,
      status: UserStatus.ACTIVE,
    },
    {
      id: "user_cashier_002",
      name: "Charlie Brown",
      username: "cashier2",
      email: "charlie.brown@salespider.com",
      password: "Password123#",
      role: Role.CASHIER,
      status: UserStatus.ACTIVE,
    },
    {
      id: "user_cashier_003",
      name: "Diana Prince",
      username: "cashier3",
      email: "diana.prince@salespider.com",
      password: "Password123#",
      role: Role.CASHIER,
      status: UserStatus.INACTIVE,
    },
  ];

  for (const staff of staffData) {
    // Check if user already exists
    const existingUser = await client.user.findUnique({
      where: {
        email: staff.email,
      },
    });

    if (existingUser) {
      console.log(`Staff user ${staff.name} already exists.`);
      continue;
    }

    // Hash the password
    const hashedPassword = await argon2.hash(staff.password);

    // Create the staff user
    const newStaff = await client.user.create({
      data: {
        id: staff.id,
        name: staff.name,
        username: staff.username,
        email: staff.email,
        password: hashedPassword,
        role: staff.role,
        status: staff.status,
      },
    });

    console.log(`Staff user created: ${newStaff.name} (${newStaff.email})`);
  }
} 