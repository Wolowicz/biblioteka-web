// lib/auth-server.ts
import { cookies } from "next/headers";
import { UserRole } from "@/lib/auth-client";
import { isValidUserRole } from "@/lib/role-map";


export type UserSession = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

export async function getUserSessionSSR(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("userSession");

  if (!sessionCookie) return null;

  try {
    const parsed = JSON.parse(sessionCookie.value);

    // Walidacja roli
    if (!isValidUserRole(parsed.role)) {
      parsed.role = "USER";
    }

    return parsed as UserSession;
  } catch {
    return null;
  }
}
