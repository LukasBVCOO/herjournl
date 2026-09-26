import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AffirmationPracticeScreen, AffirmationSession, AffirmationsScreen } from "@/features/affirmations";
import {
  AuthCallbackScreen,
  AuthScreen,
  CheckEmailScreen,
  ForgotPasswordScreen,
  RequireNoSession,
  RequireSession,
  ResetPasswordScreen,
} from "@/features/auth";
import {
  DailyPlanCard,
  DoneForTodayCard,
  FocusScreen,
  ReflectCard,
  ReflectScreen,
  TodaysFocusCard,
  WaitingForReflectionCard,
} from "@/features/daily-focus";
import { InstalledSync, InstallOfferPrompt, UpdatePrompt } from "@/features/install";
import { NotificationOfferPrompt } from "@/features/notifications";
import {
  EditNoteScreen,
  NewNoteRedirect,
  NotesListScreen,
  RecentlyDeletedScreen,
} from "@/features/notes";
import { OnboardingFlow } from "@/features/onboarding";
import { FullChartScreen, ProfileScreen } from "@/features/profile";

// Every screen in the app and the web address that opens it. Moving between
// them never asks the server for a new page, which is what makes it quick.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RequireSession>
              {/* Today's focus card, then the Daily Plan prompt once it's
                  done, then a quiet "come back at 8pm" placeholder once she
                  has today's Daily Plan note, then the evening reflection
                  once it's due (the morning and reflect cards are never
                  both shown — see reflect-slot.ts), then a quiet closing
                  note once the reflection is done, then the install nudge
                  if one is due, all between the search bar and her notes. */}
              <NotesListScreen
                focusSlot={
                  <>
                    <TodaysFocusCard />
                    <DailyPlanCard />
                    <WaitingForReflectionCard />
                    <ReflectCard />
                    <DoneForTodayCard />
                    <InstallOfferPrompt />
                  </>
                }
              />
            </RequireSession>
          }
        />
        <Route
          path="/focus"
          element={
            <RequireSession>
              {/* The morning 3x of the day's affirmation closes her entry. */}
              <FocusScreen affirmationSlot={<AffirmationSession session="morning" />} />
            </RequireSession>
          }
        />
        <Route
          path="/reflect"
          element={
            <RequireSession>
              {/* The evening 9x comes before her journal; the ninth moves
                  her straight on to the recap. */}
              <ReflectScreen
                affirmationSlot={(onComplete) => (
                  <AffirmationSession session="evening" onComplete={onComplete} />
                )}
              />
            </RequireSession>
          }
        />
        <Route
          path="/affirmations"
          element={
            <RequireSession>
              <AffirmationsScreen />
            </RequireSession>
          }
        />
        <Route
          path="/affirmations/today"
          element={
            <RequireSession>
              <AffirmationPracticeScreen />
            </RequireSession>
          }
        />
        <Route
          path="/notes/new"
          element={
            <RequireSession>
              <NewNoteRedirect />
            </RequireSession>
          }
        />
        <Route
          path="/notes/:id"
          element={
            <RequireSession>
              <EditNoteScreen />
            </RequireSession>
          }
        />
        <Route
          path="/recently-deleted"
          element={
            <RequireSession>
              <RecentlyDeletedScreen />
            </RequireSession>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireSession>
              <ProfileScreen />
            </RequireSession>
          }
        />
        <Route
          path="/profile/chart"
          element={
            <RequireSession>
              <FullChartScreen />
            </RequireSession>
          }
        />
        <Route
          path="/settings"
          // Settings now lives at the bottom of Profile; the old address
          // (bookmarks, older links) still lands somewhere sensible.
          element={<Navigate to="/profile" replace />}
        />

        <Route
          path="/login"
          element={
            <RequireNoSession>
              <AuthScreen mode="login" />
            </RequireNoSession>
          }
        />
        <Route
          path="/sign-up"
          element={
            <RequireNoSession to="/onboarding">
              <AuthScreen mode="signup" />
            </RequireNoSession>
          }
        />
        {/* Shown right after sign-up. Not behind RequireNoSession: it moves
            her on by itself once the link has been opened. */}
        <Route path="/check-email" element={<CheckEmailScreen />} />
        <Route path="/auth/callback" element={<AuthCallbackScreen />} />
        {/* The link in the confirmation email comes back here. */}
        <Route
          path="/auth/confirmed"
          element={<AuthCallbackScreen next="/onboarding" />}
        />
        {/* "Forgot password?" on the login screen. Not gated either way — see
            forgot-password-screen.tsx. */}
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        {/* The link in the password-reset email comes back here. */}
        <Route path="/auth/reset-password" element={<ResetPasswordScreen />} />
        {/* The link in an email-CHANGE confirmation (account/account-api.ts,
            profile) comes back here — a different landing page from sign-up's,
            since she's already set up and should return to her profile, not
            onboarding. */}
        <Route
          path="/auth/email-changed"
          element={<AuthCallbackScreen next="/profile" />}
        />
        {/* The "/*" lets the onboarding feature choose its own screens. */}
        <Route
          path="/onboarding/*"
          element={
            <RequireSession>
              <OnboardingFlow />
            </RequireSession>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <UpdatePrompt />
      <InstalledSync />
      <NotificationOfferPrompt />
    </BrowserRouter>
  );
}
