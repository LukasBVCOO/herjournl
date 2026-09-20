import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Runs on every page request: keeps her login fresh and sends logged-out
// visitors to /login. Only /login, /sign-up and /auth/* are open to everyone.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;
  const isEntryPage = pathname === "/login" || pathname === "/sign-up";
  const isAuthRoute = pathname.startsWith("/auth");

  if (!signedIn && !isEntryPage && !isAuthRoute) {
    return redirectTo(request, "/login", response);
  }
  if (signedIn && isEntryPage) {
    return redirectTo(request, "/", response);
  }

  return response;
}

// A redirect must carry along any refreshed login cookies.
function redirectTo(request: NextRequest, path: string, from: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
