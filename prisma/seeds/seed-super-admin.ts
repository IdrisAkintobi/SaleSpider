import { PrismaClient, Role } from "@prisma/client";
import * as argon2 from "argon2";

export async function seedSuperAdmin(client: PrismaClient) {
  const superAdminEmail =
    process.env.SUPER_ADMIN_EMAIL ?? "admin@salespider.com";
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD ?? "Password123#";

  // Check if super admin already exists
  const existingSuperAdmin = await client.user.findUnique({
    where: {
      email: superAdminEmail,
    },
  });

  if (existingSuperAdmin) {
    console.log("Super admin user already exists.");
    return;
  }

  // Hash the super admin password
  const hashedSuperAdminPassword = await argon2.hash(superAdminPassword);

  // Create the super admin user
  const superAdmin = await client.user.create({
    data: {
      id: "super_admin",
      username: "super_admin",
      name: "Super Admin",
      email: superAdminEmail,
      password: hashedSuperAdminPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log(`Super admin user created with email: ${superAdmin.email}`);
}
