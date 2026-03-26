export const Gender = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];
