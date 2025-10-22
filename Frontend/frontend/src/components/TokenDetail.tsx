// TokenDetail.tsx
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../services/api';
import { formatCurrency, formatAddress, formatDate, formatAmount } from '../utils/formatters';
import { Table, TableBody, TableCell, TableHead, TableRow, Chip, Box, Typography } from '@mui/material';
import PnLChart from './Charts/PnLChart';
import { Transaction, TokenMetrics } from '../types';
import { gsap } from 'gsap';
import styles from './TokenDetail.module.css';

const TokenDetail: React.FC = () => {
  const { address, token } = useParams<{ address: string; token: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['walletToken', address, token],
    queryFn: () => walletApi.getWalletToken(address!, token!),
    enabled: !!address && !!token,
  });

  useEffect(() => {
    if (!isLoading && data && containerRef.current) {
      const tl = gsap.timeline();
      
      tl.to(containerRef.current, {
        duration: 1,
        opacity: 1,
        y: 0,
        ease: "power3.out"
      })
      .fromTo('.metric-card', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.5"
      )
      .fromTo(chartRef.current, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.3"
      )
      .fromTo('.table-row', 
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, stagger: 0.05, duration: 0.6, ease: "power3.out" },
        "-=0.4"
      );
    }
  }, [isLoading, data]);

  if (isLoading) return <div className={styles.loading}>Loading token details...</div>;
  if (!data) return <div className={styles.noData}>No data found</div>;

  const { transactions, metrics } = data as { transactions: Transaction[]; metrics: TokenMetrics };

  return (
    <Box ref={containerRef} className={styles.container}>
      <Typography variant="h4" gutterBottom className={styles.title}>
        Token Detail: {formatAddress(token!)}
      </Typography>

      <Box ref={metricsRef} className={styles.metricsGrid}>
        <div className={`${styles.metricCard} metric-card`}>
          <div className={styles.metricLabel}>Total Bought</div>
          <div className={styles.metricValue}>{formatAmount(metrics.totalBought)}</div>
        </div>
        <div className={`${styles.metricCard} metric-card`}>
          <div className={styles.metricLabel}>Total Sold</div>
          <div className={styles.metricValue}>{formatAmount(metrics.totalSold)}</div>
        </div>
        <div className={`${styles.metricCard} metric-card`}>
          <div className={styles.metricLabel}>Current Hold</div>
          <div className={styles.metricValue}>{formatAmount(metrics.currentHold)}</div>
        </div>
        <div className={`${styles.metricCard} metric-card`}>
          <div className={styles.metricLabel}>Avg Buy Price</div>
          <div className={styles.metricValue}>{formatCurrency(metrics.avgBuyPrice)}</div>
        </div>
        <div className={`${styles.metricCard} metric-card`}>
          <div className={styles.metricLabel}>Avg Sell Price</div>
          <div className={styles.metricValue}>{formatCurrency(metrics.avgSellPrice)}</div>
        </div>
        <div className={`${styles.metricCard} ${metrics.pnl >= 0 ? styles.profit : styles.loss} metric-card`}>
          <div className={styles.metricLabel}>PnL USD</div>
          <div className={styles.metricValue}>{formatCurrency(metrics.pnl)}</div>
        </div>
      </Box>
      <Box ref={chartRef} className={styles.chartSection}>
        <Typography variant="h6" className={styles.sectionTitle}>PnL Timeline</Typography>
        <PnLChart transactions={transactions} metrics={metrics} />
      </Box>
      <Box ref={tableRef}>
        <Typography variant="h6" className={styles.sectionTitle}>Transaction History</Typography>
        <Box className={styles.tableContainer}>
          <Table className={styles.table}>
            <TableHead className={styles.tableHeader}>
              <TableRow>
                <TableCell className={styles.tableHeaderCell}>Type</TableCell>
                <TableCell className={styles.tableHeaderCell}>Amount</TableCell>
                <TableCell className={styles.tableHeaderCell}>Price USD</TableCell>
                <TableCell className={styles.tableHeaderCell}>Market Cap</TableCell>
                <TableCell className={styles.tableHeaderCell}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx: Transaction, index: number) => (
                <TableRow key={tx.id} className={`${styles.tableRow} table-row`}>
                  <TableCell className={styles.tableCell}>
                    <Chip 
                      label={tx.type.toUpperCase()} 
                      className={tx.type === 'buy' ? styles.buyChip : styles.sellChip}
                      size="small"
                    />
                  </TableCell>
                  <TableCell className={styles.tableCell}>{formatAmount(tx.amount)}</TableCell>
                  <TableCell className={styles.tableCell}>{formatCurrency(tx.priceUsd)}</TableCell>
                  <TableCell className={styles.tableCell}>{formatCurrency(tx.marketCap)}</TableCell>
                  <TableCell className={styles.tableCell}>{formatDate(tx.timestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default TokenDetail;