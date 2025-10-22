import React, { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Scale, Tick } from 'chart.js';
import { Transaction } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { gsap } from 'gsap';
import styles from './MarketCapChart.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface MarketCapChartProps {
  transactions: Transaction[];
}

const MarketCapChart: React.FC<MarketCapChartProps> = ({ transactions }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      gsap.to(chartRef.current, {
        duration: 1,
        opacity: 1,
        y: 0,
        ease: "power3.out",
        delay: 0.2
      });
    }
  }, []);

  const chartData = {
    labels: transactions.map(tx => formatDate(tx.timestamp)),
    datasets: [
      {
        label: 'Market Cap',
        data: transactions.map(tx => tx.marketCap),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
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
          text: 'Market Cap (USD)',
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
          label: (context: any) => `${context.dataset.label}: ${formatCurrency(context.raw)}`,
        },
      },
    },
  };

  return (
    <div ref={chartRef} className={styles.chartContainer}>
      <div className={styles.chartTitle}>Market Cap Evolution</div>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default MarketCapChart;