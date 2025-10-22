import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Scale, Tick } from 'chart.js';
import { Transaction, Metrics, TokenMetrics } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { gsap } from 'gsap';
import styles from './PnLChart.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PnLChartProps {
  transactions: Transaction[];
  metrics: Metrics | TokenMetrics;
}

const PnLChart: React.FC<PnLChartProps> = ({ transactions, metrics }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      gsap.to(chartRef.current, {
        duration: 1,
        opacity: 1,
        y: 0,
        ease: "power3.out",
        delay: 0.4
      });
    }
  }, []);

  let cumulativePnL = 0;
  const pnlData = transactions.map(tx => {
    if (tx.type === 'sell') {
      const avgBuyPrice = 'avgBuyPrice' in metrics ? metrics.avgBuyPrice : metrics.boughtAvg;
      cumulativePnL += (tx.priceUsd - avgBuyPrice) * tx.amount;
    }
    return cumulativePnL;
  });

  const chartData = {
    labels: transactions.map(tx => formatDate(tx.timestamp)),
    datasets: [
      {
        label: 'Cumulative PnL USD',
        data: pnlData,
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: pnlData.map(value => value >= 0 ? '#10b981' : '#ef4444'),
        pointBorderColor: pnlData.map(value => value >= 0 ? '#10b981' : '#ef4444'),
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category' as const,
        title: {
          display: true,
          text: 'Date',
          color: '#ffffff', // SỬA: đổi thành trắng
          font: {
            family: 'Inter',
            size: 12,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff', // SỬA: đổi thành trắng
          font: {
            family: 'Inter',
            size: 11,
          },
        },
      },
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'PnL (USD)',
          color: '#ffffff', // SỬA: đổi thành trắng
          font: {
            family: 'Inter',
            size: 12,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#ffffff', // SỬA: đổi thành trắng
          font: {
            family: 'Inter',
            size: 11,
          },
          callback: (tickValue: string | number, _index: number, _ticks: Tick[]): string => {
            return typeof tickValue === 'number' ? formatCurrency(tickValue) : tickValue;
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ffffff', // SỬA: đổi thành trắng
          font: {
            family: 'Inter',
            size: 12,
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#d1d5db',
        borderColor: 'rgba(55, 65, 81, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `PnL: ${formatCurrency(context.raw)}`,
        },
      },
    },
  };

  return (
    <div ref={chartRef} className={styles.chartContainer}>
      <div className={styles.chartTitle}>Profit & Loss Timeline</div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PnLChart;