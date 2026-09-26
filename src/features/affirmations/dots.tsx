// One dot per repetition in a session, filled in gold as each is done.
export default function Dots({ count, target }: { count: number; target: number }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden="true">
      {Array.from({ length: target }, (_, index) => (
        <span
          key={index}
          className={`h-2.5 w-2.5 rounded-full transition-colors duration-200 ${
            index < count ? "bg-gold" : "border border-line bg-transparent"
          }`}
        />
      ))}
    </div>
  );
}
