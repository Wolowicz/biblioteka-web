export type UserRole = "USER" | "LIBRARIAN" | "ADMIN";

export function mapRoleFromDb(dbRole: string): UserRole {
  if (!dbRole) return "USER";

  const role = dbRole.toUpperCase().trim();

  switch (role) {
    case "ADMIN":
    case "1":
      return "ADMIN";

    case "BIBLIOTEKARZ":
    case "LIBRARIAN":
    case "2":
      return "LIBRARIAN";

    case "CZYTELNIK":
    case "USER":
    case "3":
      return "USER";

    default:
      return "USER";
  }
}

export function isValidUserRole(role: any): role is UserRole {
  return ["ADMIN", "LIBRARIAN", "USER"].includes(role);
}
