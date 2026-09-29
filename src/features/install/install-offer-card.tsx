import { useEffect, useState, useSyncExternalStore } from "react";
import { useNotes } from "@/features/notes";
import { posthog } from "@/lib/posthog";
import InstallAppCard from "./install-app-card";
import { isPhoneWidth } from "./install-display";
import { isOfferDue, readInstallOfferState, recordNotNow, type InstallOfferState } from "./install-offer";
import { getInstallState, subscribe } from "./install-store";

// Waits a moment after she lands on the list, so it never appears the instant
// the screen does.
const SHOW_DELAY_MS = 1500;

// The "Get the Becomely App" card under the day's cards on her notes list.
// First shown once she has written her first daily note, and then it stays
// until she taps "Not now" or the × — which puts it away for 3 days before it
// comes back (install-offer.ts). Once she has installed, however she did it,
// her account remembers (installed-sync.tsx) and it never shows here again, on
// any device. (Profile has its own, permanent copy: profile-install-card.tsx.)
export default function InstallOfferCard() {
  const { ready, notes } = useNotes();
  const { installed } = useSyncExternalStore(subscribe, getInstallState, getInstallState);
  const [state, setState] = useState<InstallOfferState | null>(null);
  const [putAway, setPutAway] = useState(false);
  const [delayOver, setDelayOver] = useState(false);

  useEffect(() => {
    let current = true;
    void readInstallOfferState().then((result) => {
      if (current) setState(result);
    });
    return () => {
      current = false;
    };
  }, []);

  const hasWrittenFirstDailyNote = ready && notes.some((note) => note.focusLabel !== null);
  // Phones only: a computer has no home screen to add it to.
  const due =
    isPhoneWidth() &&
    !putAway &&
    !installed &&
    state !== null &&
    isOfferDue(state) &&
    hasWrittenFirstDailyNote;

  useEffect(() => {
    if (!due) return;
    const timer = setTimeout(() => setDelayOver(true), SHOW_DELAY_MS);
    return () => {
      clearTimeout(timer);
      setDelayOver(false);
    };
  }, [due]);

  if (!due || !delayOver || !state) return null;

  function notNow() {
    setPutAway(true);
    posthog?.capture("install_offer_not_now");
    void recordNotNow(state!.count);
  }

  return <InstallAppCard onPutAway={notNow} source="notes_list" className="mt-4 animate-fade-in" />;
}
