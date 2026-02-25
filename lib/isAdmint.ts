export function isAdminFromClaims(claims: any): boolean {
  const role =
    claims?.publicMetadata?.role ||
    claims?.metadata?.role ||
    claims?.role ||
    claims?.user?.role;

  return String(role || "").toLowerCase() === "admin";
}
