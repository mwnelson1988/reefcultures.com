import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDashboardOpenAt } from "@/lib/siteSettings";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const isAdminBypass = cookieStore.get("rc_admin_bypass")?.value === "1";

  const openAt = await getDashboardOpenAt();
  const now = new Date();

  if (!isAdminBypass && now < openAt) {
    redirect(
      `/coming-soon?from=dashboard&openAt=${encodeURIComponent(openAt.toISOString())}`
    );
  }

  return <>{children}</>;
}
