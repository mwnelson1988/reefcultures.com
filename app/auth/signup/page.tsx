import { Suspense } from "react";
import SignUpClient from "./SignUpClient";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="text-white/70">Loading…</div>}>
      <SignUpClient />
    </Suspense>
  );
}
