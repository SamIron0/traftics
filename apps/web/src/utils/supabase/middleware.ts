import { createServerClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = [
  "/forgot-password",
  "/auth/callback",
  "/api/collect",
  "/api/tracking-code/generate",
  "/api/webhooks",
];
const onboardingRoutes = ["/onboarding"];
const setupRoutes = ["/project-setup"];
const authRoutes = ["/login", "/signup"];

async function getDefaultDashboard(
  supabase: SupabaseClient,
  projectSlug: string
) {
  const { data: project } = await supabase
    .from("websites")
    .select("id")
    .eq("slug", projectSlug)
    .single();

  if (!project) return null;

  const { data: defaultDashboard } = await supabase
    .from("dashboards")
    .select("id")
    .eq("website_id", project.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  return defaultDashboard?.id;
}

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
          cookiesToSet.forEach(({ name, value }) =>
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

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isOnboardingRoute = onboardingRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isPublicRoute) {
    return supabaseResponse;
  }
  const isSetupRoute = setupRoutes.some((route) => pathname.startsWith(route));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user and trying to access protected route, redirect to login
  if (!user) {
    if (!isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    } else {
      return supabaseResponse;
    }
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_onboarded, org_id, active_project_id")
    .eq("user_id", user.id)
    .single();

  // Get organization and project slugs
  const { data: org } = await supabase
    .from("organizations")
    .select("slug")
    .eq("id", profile?.org_id)
    .single();

  const { data: project } = await supabase
    .from("websites")
    .select("slug")
    .eq("id", profile?.active_project_id)
    .single();

  // If user exists and trying to access auth routes, redirect to dashboard
  if (isAuthRoute) {
    const defaultDashboard = await getDefaultDashboard(supabase, project?.slug);

    const url = request.nextUrl.clone();
    url.pathname = `/org/${org?.slug}/project/${project?.slug}/dashboards/${defaultDashboard}`;
    return NextResponse.redirect(url);
  }

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
      url.pathname = `/org/${org?.slug}/project/${project?.slug}/dashboards/`;
      return NextResponse.redirect(url);
    }
  }

  if (!isSetupRoute) {
    return supabaseResponse;
  }

  // Get setup completion status
  const { data: setupStatus } = await supabase
    .from("user_profiles")
    .select("setup_completed")
    .eq("user_id", user.id)
    .single();

  if (setupStatus?.setup_completed) {
    const url = request.nextUrl.clone();
    const defaultDashboard = await getDefaultDashboard(supabase, project?.slug);
    url.pathname = `/org/${org?.slug}/project/${project?.slug}/dashboards/${defaultDashboard}`;
    return NextResponse.redirect(url);
  }
  return supabaseResponse;
}
