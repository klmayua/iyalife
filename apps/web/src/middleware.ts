import { defineMiddleware, sequence } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase";

// Protected: /account/*, /cart, /checkout (and /checkout/*, e.g. /checkout/success)
const PROTECTED_PREFIXES = ["/account", "/cart", "/checkout"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

const authGuard = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals } = context;

  if (!isProtected(url.pathname)) {
    return next();
  }

  const supabase = createSupabaseServerClient(cookies);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect("/auth/login");
  }

  locals.user = session.user;
  locals.session = session;

  return next();
});

export const onRequest = sequence(authGuard);
