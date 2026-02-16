import { eq, and } from "drizzle-orm";
import { db } from "../config/database";
import { users } from "../models/schema";

export const userService = {
  async listTechnicians() {
    const technicians = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(
        and(
          eq(users.role, "technician"),
          eq(users.isActive, true)
        )
      );

    return technicians;
  },
};
