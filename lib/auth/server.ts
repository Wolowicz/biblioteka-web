import { cookies } from "next/headers";
import { mapRoleFromDb } from "@/lib/auth/role-map";
import { UserSession } from "@/lib/auth"; 


export async function getUserSessionSSR(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("userSession");

  if (!sessionCookie) return null;

  try {
    const session = JSON.parse(sessionCookie.value);

    session.role = mapRoleFromDb(session.role);

    return session as UserSession;
  } catch {
    return null;
  }
}
