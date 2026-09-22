import "server-only";
import { getCurrentUser } from "@/lib/server/session";

const adminRoles = new Set(["ADMIN", "SUPER_ADMIN"]);

export async function requireAdminUser() {
  const user = await getCurrentUser();

  if (!user || !adminRoles.has(user.role)) {
    throw new Error("Admin access required.");
  }

  return user;
}
