import { type NextRequest} from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Get the pathname from the request

  const supabaseResponse = await updateSession(request);

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - landing-static (proxied landing app assets)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|landing-static|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
