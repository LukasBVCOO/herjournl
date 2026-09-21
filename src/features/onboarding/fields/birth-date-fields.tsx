import { useId, useRef } from "react";

type DateParts = { day: string; month: string; year: string };

const fieldClass =
  "h-14 border-b border-line bg-transparent text-center font-serif text-[28px] text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-ink";

const digitsOnly = (value: string, max: number) =>
  value.replace(/\D/g, "").slice(0, max);

// The day / month / year boxes. Numbers only, and typing a full day or month
// moves on to the next box by itself. Used by the onboarding birthday question
// and by the Profile screen, so a birth date is entered the same way in both.
export default function BirthDateFields({
  day,
  month,
  year,
  onChange,
  invalid = false,
  autoFocus = false,
}: DateParts & {
  onChange: (patch: Partial<DateParts>) => void;
  // Marks the boxes as having a problem for screen readers.
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  const id = useId();
  const dayField = useRef<HTMLInputElement>(null);
  const monthField = useRef<HTMLInputElement>(null);
  const yearField = useRef<HTMLInputElement>(null);

  return (
    <fieldset>
      <legend className="sr-only">Date of birth</legend>
      <div className="flex items-end gap-3">
        <div className="flex w-16 flex-col">
          <label htmlFor={`${id}-day`} className="text-xs text-muted">
            Day
          </label>
          <input
            ref={dayField}
            id={`${id}-day`}
            type="text"
            inputMode="numeric"
            autoComplete="bday-day"
            maxLength={2}
            placeholder="DD"
            autoFocus={autoFocus}
            value={day}
            aria-invalid={invalid}
            onChange={(event) => {
              const value = digitsOnly(event.target.value, 2);
              onChange({ day: value });
              if (value.length === 2) monthField.current?.focus();
            }}
            className={fieldClass}
          />
        </div>
        <span aria-hidden="true" className="pb-3 text-2xl text-line">
          /
        </span>
        <div className="flex w-16 flex-col">
          <label htmlFor={`${id}-month`} className="text-xs text-muted">
            Month
          </label>
          <input
            ref={monthField}
            id={`${id}-month`}
            type="text"
            inputMode="numeric"
            autoComplete="bday-month"
            maxLength={2}
            placeholder="MM"
            value={month}
            aria-invalid={invalid}
            onChange={(event) => {
              const value = digitsOnly(event.target.value, 2);
              onChange({ month: value });
              if (value.length === 2) yearField.current?.focus();
            }}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && month === "") {
                dayField.current?.focus();
              }
            }}
            className={fieldClass}
          />
        </div>
        <span aria-hidden="true" className="pb-3 text-2xl text-line">
          /
        </span>
        <div className="flex w-28 flex-col">
          <label htmlFor={`${id}-year`} className="text-xs text-muted">
            Year
          </label>
          <input
            ref={yearField}
            id={`${id}-year`}
            type="text"
            inputMode="numeric"
            autoComplete="bday-year"
            maxLength={4}
            placeholder="YYYY"
            value={year}
            aria-invalid={invalid}
            onChange={(event) => onChange({ year: digitsOnly(event.target.value, 4) })}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && year === "") {
                monthField.current?.focus();
              }
            }}
            className={fieldClass}
          />
        </div>
      </div>
    </fieldset>
  );
}
