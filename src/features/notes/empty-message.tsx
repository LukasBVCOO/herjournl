// One calm line for screens with nothing on them.
export default function EmptyMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="mt-24 text-center font-serif text-2xl text-ink-soft">
      {children}
    </p>
  );
}
