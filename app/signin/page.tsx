import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function safeInternalPath(raw: unknown) {
  const v = String(raw ?? "").trim();
  if (!v) return "/dashboard";
  if (!v.startsWith("/")) return "/dashboard";
  if (v.startsWith("//")) return "/dashboard";
  if (v.includes("://")) return "/dashboard";
  return v;
}

export default async function SignInAliasPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const next = safeInternalPath(sp.next);
  redirect(`/login?redirectTo=${encodeURIComponent(next)}`);
}
