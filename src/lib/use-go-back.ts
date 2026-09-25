import { useNavigate } from "react-router";

// The in-app back arrow. Returns to whichever page she came from, like the
// phone's own back — but when there is no earlier page inside the app (she
// refreshed, or the app opened straight onto this page from a link or a
// notification), going back would do nothing or leave the app, so it goes to
// the notes list instead.
//
// The router numbers each page she visits in this tab (history.state.idx,
// 0 for the first one), which is how "is there a page to go back to" is told.
export function useGoBack() {
  const navigate = useNavigate();
  return () => {
    const index = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (index > 0) navigate(-1);
    else navigate("/", { replace: true });
  };
}
