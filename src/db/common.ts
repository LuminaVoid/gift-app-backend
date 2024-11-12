import type { Document, Types } from "mongoose";

export interface Timestamped {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Price

export const CURRENCY_TYPES = ["crypto", "fiat"] as const;

type CurrencyType = (typeof CURRENCY_TYPES)[number];

export const CRYPTO_CURRENCIES = [
  "USDT",
  "TON",
  "BTC",
  "ETH",
  "LTC",
  "BNB",
  "TRX",
  "USDC",
] as const;

type CryptoCurrency = (typeof CRYPTO_CURRENCIES)[number];

export const FIAT_CURRENCIES = [
  "USD",
  "EUR",
  "RUB",
  "BYN",
  "UAH",
  "GBP",
  "CNY",
  "KZT",
  "UZS",
  "GEL",
  "TRY",
  "AMD",
  "THB",
  "INR",
  "BRL",
  "IDR",
  "AZN",
  "AED",
  "PLN",
  "ILS",
] as const;

type FiatCurrency = (typeof FIAT_CURRENCIES)[number];

// Follows the definitions for createInvoice method
// https://help.crypt.bot/crypto-pay-api#createInvoice
export interface BasePrice {
  currencyType: CurrencyType;
  amount: string;
}

export interface CryptoPrice extends BasePrice {
  currencyType: "crypto";
  asset: CryptoCurrency;
}

export interface FiatPrice extends BasePrice {
  currencyType: "fiat";
  fiat: FiatCurrency;
}

export type Price = CryptoPrice | FiatPrice;

export const PRICE_SCHEMA_DEFINITION = {
  currencyType: {
    type: String,
    required: true,
    enum: CURRENCY_TYPES,
  },
  amount: {
    type: String,
    required: true,
  },
  asset: {
    type: String,
    uppercase: true,
    enum: CRYPTO_CURRENCIES,
  },
  fiat: {
    type: String,
    uppercase: true,
    enum: FIAT_CURRENCIES,
  },
};

// https://help.crypt.bot/crypto-pay-api#Invoice
export type CryptoPayInvoice = {
  invoice_id: number;
  hash: string;
  currency_type: string;
  asset: string;
  fiat: string;
  amount: string;
  paid_asset: string;
  paid_amount: string;
  paid_fiat_rate: string;
  accepted_assets: string;
  fee_asset: string;
  fee_amount: number;
  // Deprecated
  fee: string;
  // Deprecated
  pay_url: string;
  bot_invoice_url: string;
  mini_app_invoice_url: string;
  web_app_invoice_url: string;
  description: string;
  status: "active" | "paid" | "expired";
  created_at: string;
  paid_usd_rate: string;
  // Deprecated
  usd_rate: string;
  allow_comments: boolean;
  allow_anonymous: boolean;
  expiration_date: string;
  paid_at: string;
  paid_anonymously: boolean;
  comment: string;
  hidden_message: string;
  payload: string;
  paid_btn_name: string;
  paid_btn_url: string;
};

type WebHookUpdate = {
  update_id: number; // non-unique
  update_type: string; // "invoice_paid"
  request_date: string; // when this request was sent
  payload: CryptoPayInvoice;
};
