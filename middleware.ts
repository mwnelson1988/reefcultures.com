import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /**
     * Run middleware on everything EXCEPT:
     * - Next.js internals
     * - API routes
     * - common static assets (images, icons, css/js, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.png|logo.png|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$).*)",
  ],
};
