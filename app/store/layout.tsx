import { ReactNode } from "react";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  // Store is live — Coming Soon gate removed
  return <>{children}</>;
}