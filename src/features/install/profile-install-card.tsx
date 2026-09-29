import { useSyncExternalStore } from "react";
import InstallAppCard from "./install-app-card";
import { isPhoneWidth } from "./install-display";
import { getInstallState, subscribe } from "./install-store";

// The permanent "Get the Becomely App" card on her Profile, under the link to
// her birth chart. Unlike the notes-list card it can't be put away: no × and no
// "Not now", just Download. Phones only (a computer has no home screen), and
// hidden while she is using the installed app itself, where there is nothing
// left to download.
export default function ProfileInstallCard({ className = "" }: { className?: string }) {
  const { installed } = useSyncExternalStore(subscribe, getInstallState, getInstallState);
  if (installed || !isPhoneWidth()) return null;
  return <InstallAppCard source="profile" className={className} />;
}
