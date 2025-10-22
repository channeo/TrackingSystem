import { Transaction, Metrics } from '../types';

export const formatAddress = (address: string, length = 8): string => {
  return `${address.slice(0, 6)}...${address.slice(-length)}`;
};

export const formatCurrency = (value: number): string => {
  if (value === 0) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 6 : 2, // Hiển thị nhiều số thập phân hơn cho giá trị nhỏ
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  const formattedValue = Math.abs(value).toFixed(2);
  return `${value >= 0 ? '+' : '-'}${formattedValue}%`;
};

export const formatDate = (timestamp: string): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatAmount = (amount: number, decimals = 4): string => {
  if (amount === 0) return '0';
  if (amount < 0.0001) return '<0.0001';
  
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

// Hàm mới: Format với color coding
export const formatCurrencyWithColor = (value: number): { text: string; color: string } => {
  const formatted = formatCurrency(value);
  return {
    text: formatted,
    color: value >= 0 ? '#00d4aa' : '#ff4757'
  };
};

export const formatPercentageWithColor = (value: number): { text: string; color: string } => {
  const formatted = formatPercentage(value);
  return {
    text: formatted,
    color: value >= 0 ? '#00d4aa' : '#ff4757'
  };
};

// Format cho số lượng lớn (market cap)
export const formatLargeNumber = (value: number): string => {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  return formatCurrency(value);
};

// Format cho price với nhiều số thập phân
export const formatPrice = (value: number): string => {
  if (value === 0) return '$0.00';
  if (value < 0.0001) {
    return `$${value.toExponential(2)}`;
  }
  if (value < 1) {
    return `$${value.toFixed(6)}`;
  }
  return formatCurrency(value);
};

// Format cho PnL với icon
export const formatPnL = (value: number): { text: string; color: string; icon: string } => {
  const formatted = formatCurrency(value);
  const color = value >= 0 ? '#00d4aa' : '#ff4757';
  const icon = value >= 0 ? '📈' : '📉';
  
  return {
    text: formatted,
    color,
    icon
  };
};

// Format compact cho số
export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(value);
};

// Format cho token amount với auto decimals
export const formatTokenAmount = (amount: number): string => {
  if (amount === 0) return '0';
  if (amount < 0.000001) return '<0.000001';
  if (amount < 1) return amount.toFixed(6);
  if (amount < 1000) return amount.toFixed(4);
  if (amount < 1000000) return amount.toFixed(2);
  return formatCompactNumber(amount);
};