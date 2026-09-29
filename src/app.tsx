import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AffirmationPracticeScreen, AffirmationsScreen } from "@/features/affirmations";
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
  AfterTrialWelcome,
  PaywallScreen,
  PremiumOnly,
  PremiumTeaserCard,
  ThankYouScreen,
  TrialWelcomePrompt,
} from "@/features/billing";
import { BugReportScreen } from "@/features/bug-report";
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
import { PrivacyScreen, TermsScreen } from "@/features/legal";
import { NotificationOfferPrompt, PushSyncOnOpen } from "@/features/notifications";
import {
  EditNoteScreen,
  NewNoteRedirect,
  NotesListScreen,
  RecentlyDeletedScreen,
} from "@/features/notes";
import { OnboardingFlow } from "@/features/onboarding";
import { FullChartScreen, ProfileScreen } from "@/features/profile";
import {
  HiddenDuringWeeklyRecap,
  WeeklyRecapButton,
  WeeklyRecapCard,
  WeeklyRecapScreen,
  WeekReflectScreen,
} from "@/features/weekly-recap";

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
              {/* Once her trial is over (free plan), the day's cards give
                  way to one Premium card instead — and today's focus card
                  isn't made for her at all. */}
              <NotesListScreen
                focusSlot={
                  <>
                    <PremiumOnly fallback={<PremiumTeaserCard />}>
                      <TodaysFocusCard />
                      <DailyPlanCard />
                      {/* On Sunday from 18:00 to Monday 08:00 the week's
                          card replaces the evening reflection. */}
                      <HiddenDuringWeeklyRecap>
                        <WaitingForReflectionCard />
                        <ReflectCard />
                        <DoneForTodayCard />
                      </HiddenDuringWeeklyRecap>
                      <WeeklyRecapCard />
                    </PremiumOnly>
                    {/* Waits until the "your 7 days have started" sheet
                        has been closed, so the two never overlap. */}
                    <AfterTrialWelcome>
                      <InstallOfferPrompt />
                    </AfterTrialWelcome>
                  </>
                }
                headerAction={<WeeklyRecapButton />}
              />
            </RequireSession>
          }
        />
        <Route
          path="/focus"
          element={
            <RequireSession>
              <PremiumOnly>
                <FocusScreen />
              </PremiumOnly>
            </RequireSession>
          }
        />
        <Route
          path="/reflect"
          element={
            <RequireSession>
              <PremiumOnly>
                <ReflectScreen />
              </PremiumOnly>
            </RequireSession>
          }
        />
        <Route
          path="/affirmations"
          element={
            <RequireSession>
              <PremiumOnly>
                <AffirmationsScreen />
              </PremiumOnly>
            </RequireSession>
          }
        />
        <Route
          path="/affirmations/today"
          element={
            <RequireSession>
              <PremiumOnly>
                <AffirmationPracticeScreen />
              </PremiumOnly>
            </RequireSession>
          }
        />
        {/* Her week in review: this week at /week, an earlier one at
            /week/<its Monday>, and reflecting on it at …/reflect. */}
        {["/week", "/week/:start"].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <RequireSession>
                <PremiumOnly>
                  <WeeklyRecapScreen />
                </PremiumOnly>
              </RequireSession>
            }
          />
        ))}
        {["/week/reflect", "/week/:start/reflect"].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <RequireSession>
                <PremiumOnly>
                  <WeekReflectScreen />
                </PremiumOnly>
              </RequireSession>
            }
          />
        ))}
        <Route
          path="/premium"
          element={
            <RequireSession>
              <PaywallScreen />
            </RequireSession>
          }
        />
        <Route
          path="/thank-you"
          element={
            <RequireSession>
              <ThankYouScreen />
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
          path="/report-bug"
          element={
            <RequireSession>
              <BugReportScreen />
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
        {/* Open to anyone, logged in or not: Google sign-in, Stripe and the
            website link straight here. */}
        <Route path="/privacy" element={<PrivacyScreen />} />
        <Route path="/terms" element={<TermsScreen />} />
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
      <PushSyncOnOpen />
      <AfterTrialWelcome>
        <NotificationOfferPrompt />
      </AfterTrialWelcome>
      <TrialWelcomePrompt />
    </BrowserRouter>
  );
}
