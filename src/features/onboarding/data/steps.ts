// Which questions have been answered, so a screen reached without them (a
// refresh clears everything typed so far) can send her back to the first one
// that is missing instead of showing an empty page.

import type { Answers } from "./answers-store";
import { checkBirthDate } from "../validation/birth-date";
import { parseBirthTime } from "../validation/birth-time";

// The questions in the order she meets them.
const questions: { path: string; answered: (answers: Answers) => boolean }[] = [
  { path: "/onboarding/name", answered: (a) => a.name.trim() !== "" },
  {
    path: "/onboarding/birthday",
    answered: (a) => checkBirthDate(a.day, a.month, a.year).ok,
  },
  {
    path: "/onboarding/birth-time",
    answered: (a) => parseBirthTime(a.birthTime) !== null,
  },
  { path: "/onboarding/birthplace", answered: (a) => a.place !== null },
];

// The first of the first `count` questions that hasn't been answered, or null
// when all of them have. A screen that needs the first two answered asks for 2.
export function firstUnanswered(answers: Answers, count: number) {
  return questions.slice(0, count).find((q) => !q.answered(answers))?.path ?? null;
}

// The number of questions, for screens that need all of them.
export const ALL_QUESTIONS = questions.length;
