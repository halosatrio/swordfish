// constants/categories.ts
export const CATEGORIES = {
  INCOME: "income",
  MAKAN: "makan",
  CAFE: "cafe",
  ERRAND: "errand",
  UTILS: "utils",
  BENSIN: "bensin",
  OLAHRAGA: "olahraga",
  BELANJA: "belanja",
  FAMILY: "family",
  MISC: "misc",
  TRANSPORT: "transport",
  TRAVELING: "traveling",
  DATE: "date",
  HEALTHCARE: "healthcare",
  SAVINGS: "savings",
} as const;

export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES];
