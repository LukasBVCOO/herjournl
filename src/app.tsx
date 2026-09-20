import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import {
  AuthCallbackScreen,
  AuthScreen,
  RequireNoSession,
  RequireSession,
  SettingsScreen,
} from "@/features/auth";
import { UpdatePrompt } from "@/features/install";
import {
  EditNoteScreen,
  NewNoteRedirect,
  NotesListScreen,
  RecentlyDeletedScreen,
} from "@/features/notes";

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
              <NotesListScreen />
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
            <RequireNoSession>
              <AuthScreen mode="signup" />
            </RequireNoSession>
          }
        />
        <Route path="/auth/callback" element={<AuthCallbackScreen />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <UpdatePrompt />
    </BrowserRouter>
  );
}
