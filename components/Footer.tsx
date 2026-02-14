import Link from "next/link";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-border">
      <Container className="py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="text-sm opacity-80">
          <div className="font-semibold opacity-100">Reefcultures</div>
          <div>© {new Date().getFullYear()} Reefcultures. All rights reserved.</div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link className="opacity-80 hover:opacity-100" href="/privacy">Privacy</Link>
          <Link className="opacity-80 hover:opacity-100" href="/terms">Terms</Link>
          <Link className="opacity-80 hover:opacity-100" href="/contact">Contact</Link>
        </div>
      </Container>
    </footer>
  );
}
