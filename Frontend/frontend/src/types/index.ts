// frontend/src/types/index.ts
export interface Wallet {
  id: number;
  address: string;
  createdAt?: string;
}

export interface Transaction {
  id: number;
  txHash: string;
  type: 'buy' | 'sell';
  token: string;
  amount: number;
  priceUsd: number;
  priceSol?: number;
  marketCap: number;
  timestamp: string;
}

export interface Metrics {
  avgMarketCapBuy: number;
  avgMarketCapSell: number;
  boughtAvg: number;
  soldAvg: number;
  holdPercent: number;
  pnLUsd: number;
}

export interface WalletWithMetrics extends Wallet {
  wallet : Wallet & { transactions: Transaction[]};
  metrics: Metrics;
}

export interface TokenMetrics {
  token: string;
  totalBought: number;
  totalSold: number;
  currentHold: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  pnl: number; // Sửa: đổi từ pnLUsd thành pnl để nhất quán với backend
}