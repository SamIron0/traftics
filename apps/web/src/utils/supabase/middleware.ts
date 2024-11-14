import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/callback",
  "/api/collect", // Keep analytics endpoint public
];

// Define onboarding routes
const onboardingRoutes = ["/onboarding"];

const authRoutes = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get current pathname
  const pathname = request.nextUrl.pathname;
  // If user exists and trying to access login/signup pages, redirect to dashboard
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get user and profile data
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboards";
    return NextResponse.redirect(url);
  }
  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isPublicRoute) {
    return supabaseResponse;
  }

  // If no user and trying to access protected route, redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If user exists, check onboarding status
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_onboarded")
    .eq("user_id", user.id)
    .single();

  // Handle onboarding flow
  const isOnboardingRoute = onboardingRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!profile?.is_onboarded) {
    // If not onboarded and not on onboarding routes, redirect to onboarding
    if (!isOnboardingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  } else {
    // If already onboarded but trying to access onboarding routes, redirect to dashboard
    if (isOnboardingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboards";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
