// Signing in and out, and who is signed in.
//
//   lib/session.ts         who is signed in (outside React, one listener)
//   use-session.ts         reading that from a screen
//   require-session.tsx    which screens need her signed in, and which don't
//   auth-screen.tsx        the log in / create account screen
//   check-email-screen.tsx "Confirmation link sent", shown right after sign-up
//   auth-callback-screen   where Google and the email link send her back
//   forgot-password-screen.tsx  "Forgot password?" on the login screen leads here:
//                          enter her email, a reset link is sent
//   reset-password-screen.tsx   where that reset link sends her back: choose a
//                          new password
//   settings-screen.tsx    her email and the log out button
//   opening-screen.tsx     the blink before the app knows who she is
//
// The rest of the app uses only what is exported here.
export { default as AuthScreen } from "./auth-screen";
export { default as CheckEmailScreen } from "./check-email-screen";
export { default as AuthCallbackScreen } from "./auth-callback-screen";
export { default as ForgotPasswordScreen } from "./forgot-password-screen";
export { default as ResetPasswordScreen } from "./reset-password-screen";
export { default as SettingsScreen } from "./settings-screen";
export { RequireSession, RequireNoSession } from "./require-session";
