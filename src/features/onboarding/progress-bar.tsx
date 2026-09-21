// A thin bar in equal parts, one part filled in for each question she has
// reached. Deliberately says nothing like "Step 2 of 4": it should feel like
// moving through something, not filling in a form.
export default function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div
      role="progressbar"
      aria-label="Progress"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      className="flex flex-1 gap-1.5"
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`h-[3px] flex-1 rounded-full transition-colors duration-200 ${
            index < current ? "bg-ink" : "bg-line"
          }`}
        />
      ))}
    </div>
  );
}
