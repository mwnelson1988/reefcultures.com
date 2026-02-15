export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-10 text-center">

        {/* Navigation Links */}
        <div className="flex justify-center gap-8 text-sm text-white/60 mb-6">
          <a
            href="/privacy"
            className="hover:text-white transition-colors"
          >
            Privacy
          </a>
          <a
            href="/terms"
            className="hover:text-white transition-colors"
          >
            Terms
          </a>
          <a
            href="/contact"
            className="hover:text-white transition-colors"
          >
            Contact
          </a>
        </div>

        {/* Copyright */}
        <div className="text-xs text-white/40">
          © {new Date().getFullYear()} Reefcultures. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
