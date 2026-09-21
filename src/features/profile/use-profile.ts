import { useCallback, useEffect, useState } from "react";
import { fetchProfile, type Profile } from "./profile-api";

type State =
  | { status: "loading" }
  | { status: "error" }
  // profile is null when she has none yet.
  | { status: "ready"; profile: Profile | null };

// Loads her profile when the screen opens. `reload` fetches it again quietly
// after a change, keeping what is on screen until the new copy arrives.
export function useProfile() {
  const [state, setState] = useState<State>({ status: "loading" });
  // Goes up by one each "Try again", which is what starts another go.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    fetchProfile()
      .then((profile) => {
        if (current) setState({ status: "ready", profile });
      })
      .catch(() => {
        if (current) setState({ status: "error" });
      });
    return () => {
      current = false;
    };
  }, [attempt]);

  const reload = useCallback(async () => {
    try {
      const profile = await fetchProfile();
      setState({ status: "ready", profile });
    } catch {
      // A failed refresh shouldn't throw away what she is looking at.
      setState((now) => (now.status === "ready" ? now : { status: "error" }));
    }
  }, []);

  function retry() {
    setState({ status: "loading" });
    setAttempt((count) => count + 1);
  }

  return { state, reload, retry };
}
