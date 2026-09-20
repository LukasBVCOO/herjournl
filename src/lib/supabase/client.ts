import { createClient } from "@supabase/supabase-js";

// The one connection to the database, shared by the whole app. One instance
// means one login session and one refresh timer per tab.
//
// The publishable key is meant to be public: it can only ever do what the
// database's privacy rules allow, and those rules only ever let her see her own
// notes.
const url =
  import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    "Missing Supabase settings. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
  );
}

export const supabase = createClient(url, publishableKey, {
  auth: {
    // "pkce" keeps the login tokens out of the web address during Google
    // sign-in. Without setting this the library would use the older, less safe
    // way of doing it.
    flowType: "pkce",
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});
