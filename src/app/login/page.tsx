import AuthForm from "../auth/auth-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <AuthForm
      mode="login"
      initialError={
        error === "google"
          ? "Google sign-in didn't work. Please try again."
          : undefined
      }
    />
  );
}
