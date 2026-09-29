import { Navigate, Route, Routes } from "react-router";
import { onboardingFinishedHere } from "./data/finished";
import BirthdayScreen from "./questions/birthday-screen";
import BirthplaceScreen from "./questions/birthplace-screen";
import BirthTimeScreen from "./questions/birth-time-screen";
import BirthTimeUnknownScreen from "./questions/birth-time-unknown-screen";
import MappingScreen from "./reveal/mapping-screen";
import NameScreen from "./questions/name-screen";
import RevealScreen from "./reveal/reveal-screen";
import WelcomeScreen from "./questions/welcome-screen";

// Every onboarding screen and its web address, all under /onboarding. Each
// screen has its own address so the phone's back button steps back through them
// one at a time. Once she has finished (on this phone), any of them sends her
// home instead — they can still be sitting in the phone's back history.
export default function OnboardingFlow() {
  if (onboardingFinishedHere()) return <Navigate to="/" replace />;
  return (
    <Routes>
      <Route index element={<WelcomeScreen />} />
      <Route path="name" element={<NameScreen />} />
      <Route path="birthday" element={<BirthdayScreen />} />
      <Route path="birth-time" element={<BirthTimeScreen />} />
      <Route path="birth-time-unknown" element={<BirthTimeUnknownScreen />} />
      <Route path="birthplace" element={<BirthplaceScreen />} />
      <Route path="mapping" element={<MappingScreen />} />
      <Route path="reveal" element={<RevealScreen />} />
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  );
}
