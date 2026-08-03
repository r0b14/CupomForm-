export type Question = {
  key: string;
  label: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT" | "SCALE";
  required: boolean;
  options: string[] | null;
  maxSelections: number | null;
  section: number;
};

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

export type Campaign = {
  slug: string;
  title: string;
  subtitle?: string | null;
  privacyText: string;
  questions: Question[];
};

export type Result = {
  submissionId: string;
  couponCode: string | null;
  isExisting: boolean;
  soldOut: boolean;
};

export type FieldErrors = Record<string, string>;

export type ScreenState =
  | "loading"
  // Splash ainda montado, já em fade-out para encadear com a entrada do card.
  | "splash-exit"
  | "form"
  | "coupon"
  | "soldout"
  | "unavailable";

export type DeliveryState = "idle" | "sending" | "sent";
