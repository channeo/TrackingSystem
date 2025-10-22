import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../services/api';
import { WalletWithMetrics } from '../types';

export const useWallets = () => {
  return useQuery<WalletWithMetrics[], Error>({
    queryKey: ['wallets'],
    queryFn: walletApi.getWallets,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};