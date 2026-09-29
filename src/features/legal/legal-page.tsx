import type { ReactNode } from "react";
import { Link } from "react-router";
import { BackIcon } from "@/components/icons";
import { useGoBack } from "@/lib/use-go-back";
import { CONTACT_EMAIL } from "./contact";
import LegalFooter from "./legal-footer";

// The shared frame of a legal page (Privacy policy, Terms of service): open to
// anyone, logged in or not, at a plain public address, because Google sign-in,
// Stripe and the website all link here. Laid out for reading: one column, a
// comfortable line length, and each section's heading clearly above its text.
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  const goBack = useGoBack();
  return (
    <main className="mx-auto flex w-full max-w-[40rem] flex-1 animate-fade-in flex-col px-6 pb-10">
      <header className="flex items-center justify-between pt-[max(1.25rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <BackIcon />
        </button>
        <Link to="/" className="font-serif text-xl font-medium text-ink">
          Becomely
        </Link>
        <span aria-hidden="true" className="w-11" />
      </header>

      <div className="mt-8 mb-8">
        <h1 className="font-serif text-[36px] leading-[1.05] font-medium text-balance text-ink">{title}</h1>
        <p className="mt-3 text-[14px] text-ink-soft">Last updated {updated}</p>
      </div>

      <article className="text-[16px] leading-relaxed text-ink">{children}</article>

      <LegalFooter />
    </main>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="mb-3 font-serif text-[23px] leading-snug font-medium text-ink">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

// A smaller heading inside a section ("Account information"…).
export function Sub({ children }: { children: ReactNode }) {
  return <h3 className="mt-2 text-[16px] font-semibold text-ink">{children}</h3>;
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-accent">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

// Two-column facts ("Purpose" / "Legal basis") shown as stacked pairs, so
// nothing scrolls sideways on a phone.
export function Pairs({ heads, rows }: { heads: [string, string]; rows: [string, string][] }) {
  return (
    <dl className="divide-y divide-line rounded-card bg-card px-5 shadow-soft">
      {rows.map(([left, right]) => (
        <div key={left} className="py-3.5">
          <dt className="text-[15px] font-medium text-ink">{left}</dt>
          <dd className="mt-0.5 text-[15px] text-ink-soft">
            <span className="sr-only">{heads[1]}: </span>
            {right}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// The disclaimer and liability clauses, which the law expects in capitals.
// A touch smaller so a block of capitals stays readable.
export function Caps({ children }: { children: ReactNode }) {
  return <p className="text-[14px] leading-relaxed tracking-[0.01em] text-ink">{children}</p>;
}

export function Email() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="font-medium underline decoration-accent underline-offset-4 hover:decoration-ink"
    >
      {CONTACT_EMAIL}
    </a>
  );
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="font-medium underline decoration-accent underline-offset-4 hover:decoration-ink">
      {children}
    </Link>
  );
}
