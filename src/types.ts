/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExchangeRequest {
  itemId: string;
  itemName: string;
  requestTime: string;
}

export interface ExchangeResult {
  itemId: string;
  itemName: string;
  status: "approved" | "rejected";
  timestamp: string;
}

export interface Student {
  id: string;
  name: string;
  classNo: number; // 1 to 10
  code: string;    // 4-digit code (e.g., "1001" represents student 1 of class 1)
  cookies: number;
  activeExchange: ExchangeRequest | null;
  lastExchangeResult: ExchangeResult | null;
}

export interface ShopItem {
  id: string;
  name: string;
  cost: number; // Always 10 as specified by user
  icon: string; // Emoji
  description: string;
}

export interface AppState {
  students: Student[];
  shopItems: ShopItem[];
}
