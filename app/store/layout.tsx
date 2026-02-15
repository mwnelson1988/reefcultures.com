import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getStoreOpenAt } from "@/lib/siteSettings";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const isAdminBypass = cookieStore.get("rc_admin_bypass")?.value === "1";

  const openAt = await getStoreOpenAt();
  const now = new Date();

  if (!isAdminBypass && now < openAt) {
    redirect(`/coming-soon?from=store&openAt=${encodeURIComponent(openAt.toISOString())}`);
  }

  return <>{children}</>;
}
