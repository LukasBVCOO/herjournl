"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState =
  | { email?: string; error?: string; notice?: string }
  | undefined;

function readForm(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function logIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password } = readForm(formData);
  if (!email || !password) {
    return { email, error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { email, error: "That email and password don't match. Try again." };
  }

  redirect("/");
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password } = readForm(formData);
  if (!email) {
    return { email, error: "Enter your email address." };
  }
  if (password.length < 8) {
    return { email, error: "Choose a password with at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    if (error.code === "user_already_exists") {
      return { email, error: "That email already has an account. Log in instead." };
    }
    return { email, error: "We couldn't create your account. Please try again." };
  }

  // With email confirmation on, there is no session until she confirms.
  if (!data.session) {
    return {
      email,
      notice: "Check your email to confirm your account, then log in.",
    };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
