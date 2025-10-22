import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../services/api';
import { WalletWithMetrics } from '../types';

export const useWalletDetail = (address: string) => {
  return useQuery<WalletWithMetrics, Error>({
    queryKey: ['wallet', address],
    queryFn: () => walletApi.getWallet(address),
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};