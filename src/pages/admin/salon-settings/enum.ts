export const TimeFormat = {
  H12: "12h",
  H24: "24h",
} as const;

export type TimeFormat = (typeof TimeFormat)[keyof typeof TimeFormat];
