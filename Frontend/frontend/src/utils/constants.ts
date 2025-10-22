// frontend/src/utils/constants.ts

// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Chart Configuration Defaults
export const CHART_DEFAULTS = {
  HEIGHT: '300px',
  COLORS: {
    PNL_POSITIVE: 'green',
    PNL_NEGATIVE: 'red',
    MARKET_CAP: {
      BACKGROUND: 'rgba(53, 162, 235, 0.5)',
      BORDER: 'rgb(53, 162, 235)',
    },
    PNL: {
      BACKGROUND: 'rgba(75, 192, 192, 0.2)',
      BORDER: 'rgb(75, 192, 192)',
    },
  },
  TENSION: 0.4,
  BORDER_WIDTH: 1,
};

// Table Configuration
export const TABLE_CONFIG = {
  SEARCH_WIDTH: '300px',
  PAGE_SIZE: 10,
};

// File Import Configuration
export const IMPORT_CONFIG = {
  ACCEPTED_FORMATS: '.csv,.json',
  CSV_REQUIRED_COLUMNS: ['address'],
  JSON_SCHEMA: {
    type: 'array',
    items: {
      type: 'object',
      required: ['address'],
      properties: {
        address: { type: 'string' },
      },
    },
  },
};

// Currency and Formatting
export const CURRENCY = {
  DEFAULT: 'USD',
  DECIMALS: 2,
  AMOUNT_DECIMALS: 4,
};

// Environment
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
};

// API Endpoints
export const ENDPOINTS = {
  WALLETS: '/wallets',
  WALLET_DETAIL: (address: string) => `/wallets/${address}`,
  WALLET_TOKEN: (address: string, token: string) => `/wallets/${address}/token/${token}`,
  IMPORT_WALLETS: '/wallets/import',
  HEALTH: '/health',
};