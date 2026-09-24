import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import {
  AuthCallbackScreen,
  AuthScreen,
  CheckEmailScreen,
  RequireNoSession,
  RequireSession,
  SettingsScreen,
} from "@/features/auth";
import { FocusScreen, ReflectCard, ReflectScreen, TodaysFocusCard } from "@/features/daily-focus";
import { InstalledSync, InstallOfferPrompt, UpdatePrompt } from "@/features/install";
import { NotificationOfferPrompt } from "@/features/notifications";
import {
  EditNoteScreen,
  NewNoteRedirect,
  NotesListScreen,
  RecentlyDeletedScreen,
} from "@/features/notes";
import { OnboardingFlow } from "@/features/onboarding";
import { FullChartScreen, OpeningGreeting, ProfileScreen } from "@/features/profile";

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
              {/* Today's focus card, then the evening reflection once it's
                  done (the two are never both shown — see reflect-slot.ts),
                  then the install nudge if one is due, all between the
                  search bar and her notes. */}
              <NotesListScreen
                greetingSlot={<OpeningGreeting />}
                focusSlot={
                  <>
                    <TodaysFocusCard />
                    <ReflectCard />
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
              <FocusScreen />
            </RequireSession>
          }
        />
        <Route
          path="/reflect"
          element={
            <RequireSession>
              <ReflectScreen />
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
          element={
            <RequireSession>
              <SettingsScreen />
            </RequireSession>
          }
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
