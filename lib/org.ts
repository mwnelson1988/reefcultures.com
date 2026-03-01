export function mustGetOrgId(): string {
  const orgId = process.env.RC_ORG_ID;
  if (!orgId) {
    throw new Error("Missing RC_ORG_ID in environment");
  }
  return orgId;
}