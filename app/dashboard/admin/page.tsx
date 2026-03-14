// app/dashboard/admin/page.tsx
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminIndexPage() {
  redirect("/dashboard/admin/accounting");
}
