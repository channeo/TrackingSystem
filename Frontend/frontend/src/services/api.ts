import axios from 'axios';
import { WalletWithMetrics, TokenMetrics } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const walletApi = {
  // Lấy danh sách wallets
  getWallets: (): Promise<WalletWithMetrics[]> =>
    api.get('/wallets').then(res => res.data),

  // Lấy chi tiết wallet
  getWallet: (address: string): Promise<WalletWithMetrics> =>
    api.get(`/wallets/${address}`).then(res => res.data),

  // Lấy token cụ thể trong wallet
  getWalletToken: (address: string, token: string): Promise<{ transactions: any[], metrics: TokenMetrics }> =>
    api.get(`/wallets/${address}/token/${token}`).then(res => res.data),

  // Import wallets từ file
  importWallets: (file: File, type: 'csv' | 'json'): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/wallets/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(() => {});
  },
};

export default api;