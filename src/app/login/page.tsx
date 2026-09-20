import AuthForm from "./auth-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <AuthForm
      initialError={
        error === "google"
          ? "Google sign-in didn't work. Please try again."
          : undefined
      }
    />
  );
}
