// frontend/src/components/WalletDetail.tsx
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../services/api';
import { formatCurrency, formatAddress, formatDate, formatAmount, formatPercentage } from '../utils/formatters';
import { Table, TableBody, TableCell, TableHead, TableRow, Chip, Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import PnLChart from './Charts/PnLChart';
import MarketCapChart from './Charts/MarketCapChart';
import { WalletWithMetrics, Transaction } from '../types';
import { gsap } from 'gsap';
import './WalletDetail.css';

const WalletDetail: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const { data: walletData, isLoading } = useQuery({
    queryKey: ['wallet', address],
    queryFn: () => walletApi.getWallet(address!),
    enabled: !!address,  
  });

  useEffect(() => {
    if (!isLoading && walletData && containerRef.current) {
      const tl = gsap.timeline();
      
      // Main container animation
      tl.to(containerRef.current, {
        duration: 1,
        opacity: 1,
        y: 0,
        ease: "power3.out"
      })
      // Metrics chips animation
      .fromTo('.metric-chip', 
        { 
          opacity: 0, 
          y: 30,
          scale: 0.8
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          stagger: 0.1, 
          duration: 0.6, 
          ease: "back.out(1.7)" 
        },
        "-=0.5"
      )
      // Charts animation
      .fromTo('.chart-container', 
        { 
          opacity: 0, 
          y: 40 
        },
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.2,
          duration: 0.8, 
          ease: "power3.out" 
        },
        "-=0.3"
      )
      // Table rows animation
      .fromTo('.table-body-row', 
        { 
          opacity: 0, 
          x: -30 
        },
        { 
          opacity: 1, 
          x: 0, 
          stagger: 0.03, 
          duration: 0.5, 
          ease: "power2.out" 
        },
        "-=0.4"
      );
    }
  }, [isLoading, walletData]);

  if (isLoading) return <div className="loading">Loading wallet detail...</div>;
  if (!walletData) return <div className="error">Wallet not found</div>;

  const { wallet, metrics } = walletData;
  const transactions = wallet.transactions || [];
  const buys = transactions.filter(t => t.type === 'buy');
  const sells = transactions.filter(t => t.type === 'sell');

  return (
    <Box ref={containerRef} className="wallet-detail-container" sx={{ p: 3, opacity: 0, transform: 'translateY(30px)' }}>
      <Typography variant="h4" gutterBottom className="wallet-title">
        Wallet: {formatAddress(wallet.address)}
      </Typography>

      {/* Metrics Summary */}
      <Box ref={metricsRef} className="metrics-grid">
        <Chip 
          className={`metric-chip ${metrics.pnLUsd >= 0 ? 'positive' : 'negative'}`}
          label={`PnL: ${formatCurrency(metrics.pnLUsd)}`} 
        />
        <Chip className="metric-chip" label={`Hold: ${formatPercentage(metrics.holdPercent)}`} />
        <Chip className="metric-chip" label={`Avg Buy: ${formatCurrency(metrics.boughtAvg)}`} />
        <Chip className="metric-chip" label={`Avg Sell: ${formatCurrency(metrics.soldAvg)}`} />
        <Chip className="metric-chip" label={`Buys: ${buys.length}`} />
        <Chip className="metric-chip" label={`Sells: ${sells.length}`} />
      </Box>

      {/* Charts */}
      <Box ref={chartsRef}>
        <Box className="chart-container" sx={{ mb: 4, opacity: 0 }}>
          <Typography variant="h6" className="chart-title">PnL Chart</Typography>
          <PnLChart transactions={transactions} metrics={metrics} />
        </Box>
        <Box className="chart-container" sx={{ mb: 4, opacity: 0 }}>
          <Typography variant="h6" className="chart-title">Market Cap Chart</Typography>
          <MarketCapChart transactions={transactions} />
        </Box>
      </Box>

      {/* Transactions Table */}
      <Box ref={tableRef}>
        <Typography variant="h6" className="table-title">Transactions</Typography>
        <Table className="stock-table" sx={{ mt: 2 }}>
          <TableHead>
            <TableRow className="table-header-row">
              <TableCell className="table-header-cell">Type</TableCell>
              <TableCell className="table-header-cell">Token</TableCell>
              <TableCell className="table-header-cell">Amount</TableCell>
              <TableCell className="table-header-cell">Price</TableCell>
              <TableCell className="table-header-cell">Market Cap</TableCell>
              <TableCell className="table-header-cell">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx: Transaction) => (
              <TableRow key={tx.id} className="table-body-row">
                <TableCell className="table-body-cell">
                  <Chip 
                    label={tx.type.toUpperCase()} 
                    className={tx.type === 'buy' ? 'buy-chip' : 'sell-chip'}
                    size="small"
                  />
                </TableCell>
                <TableCell className="table-body-cell">
                  <Link 
                    to={`/wallet/${wallet.address}/token/${tx.token}`} 
                    className="token-link"
                  >
                    {formatAddress(tx.token, 6)}
                  </Link>
                </TableCell>
                <TableCell className="table-body-cell">{formatAmount(tx.amount)}</TableCell>
                <TableCell className="table-body-cell">{formatCurrency(tx.priceUsd)}</TableCell>
                <TableCell className="table-body-cell">{formatCurrency(tx.marketCap)}</TableCell>
                <TableCell className="table-body-cell">{formatDate(tx.timestamp)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default WalletDetail;