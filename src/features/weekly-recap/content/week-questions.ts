// The three questions of the weekly reflection. The first is the one she has
// to answer; the other two are there if she wants them. Same voice as the
// daily card: warm, direct, about who she is becoming.
export type WeekQuestionId = "lookingBack" | "belief" | "nextWeek";

export type WeekQuestion = {
  id: WeekQuestionId;
  label: string;
  question: string;
  required: boolean;
};

export const WEEK_QUESTIONS: readonly WeekQuestion[] = [
  {
    id: "lookingBack",
    label: "Looking back",
    question: "What did this week show you about who you're becoming?",
    required: true,
  },
  {
    id: "belief",
    label: "A belief to release",
    question: "Which thought kept holding you back, and is it still true?",
    required: false,
  },
  {
    id: "nextWeek",
    label: "Next week's intention",
    question: "What energy do you want to carry into next week?",
    required: false,
  },
];
