/**
 * Monetization foundation — wallet/earnings interfaces only.
 */
export type Currency = "EUR" | "USD";

export interface WalletBalance {
  currency: Currency;
  amount: number;
}

export interface EarningEvent {
  id: string;
  amount: number;
  currency: Currency;
  reason: string;
  at: number;
}
