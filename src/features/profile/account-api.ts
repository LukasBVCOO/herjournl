// Changing her account credentials — email and password. This talks to
// Supabase Auth directly (supabase.auth.updateUser), not the profiles table
// (see profile-api.ts for that: her name, birth details, chart). Nothing
// here logs what she enters.

import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";

// A loose check, nothing more — Supabase's own validation is the real one.
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const PASSWORD_MIN_LENGTH = 8;

// Starts an email change. It doesn't take effect at once: Supabase emails a
// confirmation link to the new address (and, depending on the project's own
// "secure email change" setting, to the old one too) before the change is
// real — her signed-in session's email only updates once she clicks it (see
// lib/session.ts's onAuthStateChange listener, which is already wired to
// pick that moment up on its own). Returns a message on failure, or null
// once the confirmation has been sent. Unlike the "forgot password" flow
// (which never says whether an email has an account, since anyone could ask
// it that), this one is fine naming an email already in use: she's already
// signed in and proving ownership of an address, not fishing for one.
export async function changeEmail(newEmail: string): Promise<string | null> {
  const email = newEmail.trim();
  if (!looksLikeEmail(email)) return "That doesn't look like an email address.";

  try {
    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: `${window.location.origin}/auth/email-changed` },
    );
    if (!error) return null;
    return error.code === "email_exists"
      ? "That email already belongs to another account."
      : "We couldn't start that change. Please try again.";
  } catch {
    return "We couldn't start that change. Please try again.";
  }
}

// Changes her password, after checking the current one is right — a fresh
// sign-in with it, which also proves this session is really hers.
// Supabase's own updateUser call would otherwise accept a new password from
// any open, signed-in session with no proof she knows the old one (someone
// with her phone unlocked, say). Returns a message on failure, or null once
// it's changed.
export async function changePassword(currentPassword: string, newPassword: string): Promise<string | null> {
  const email = getSession().email;
  if (!email) return "We couldn't confirm your account. Please try again.";
  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return `Your new password needs to be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  // Caught early rather than waiting on Supabase's own "same_password" check
  // below, since we already have both passwords in hand to compare.
  if (newPassword === currentPassword) return "That's your current password. Choose a different one.";

  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (signInError) return "Your current password wasn't right.";

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) return null;
    return error.code === "same_password"
      ? "That's your current password. Choose a different one."
      : "We couldn't update your password. Please try again.";
  } catch {
    return "We couldn't update your password. Please try again.";
  }
}
