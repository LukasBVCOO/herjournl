// Shown for the instant before the app knows whether she is signed in. Calm and
// almost empty on purpose: it should read as the app opening, not as loading.
export default function OpeningScreen() {
  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <p className="font-serif text-2xl font-medium text-muted">HerJournl</p>
    </main>
  );
}
