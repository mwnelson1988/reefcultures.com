// app/dashboard/user/page.tsx
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LegacyUserDashboardRedirect() {
  // Kept for backwards compatibility
  redirect("/dashboard/overview");
}
