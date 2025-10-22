// frontend/src/components/TrackingTable.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { walletApi } from '../services/api';
import { WalletWithMetrics } from '../types';
import { formatAddress, formatCurrency, formatPercentage } from '../utils/formatters';
import ImportModal from './ImportModal';
import gsap from 'gsap';
import './TrackingTable.css';

const columnHelper = createColumnHelper<WalletWithMetrics>();

const columns = [
  columnHelper.accessor('address', {
    header: 'Wallet',
    cell: ({ row }) => (
      <Link to={`/wallet/${row.original.address}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <span className='wallet-cell'>
          {formatAddress(row.original.address)}
        </span>
      </Link>
    ),
  }),
  columnHelper.accessor(row => row.metrics.avgMarketCapBuy, {
    id: 'avgMarketCapBuy',
    header: 'Avg MC Buy',
    cell: ({ getValue }) => {
      const value = getValue() || 0;
      return <span className={value >= 0 ? 'positive' : 'negative'}>{formatCurrency(value)}</span>;
    },
  }),
  columnHelper.accessor('metrics.boughtAvg', {
    header: 'Bought Avg $',
    cell: ({ getValue }) => {
      const value = getValue() || 0;
      return <span className={value >= 0 ? 'positive' : 'negative'}>${value?.toFixed(4) || '0.0000'}</span>;
    },
  }),
  columnHelper.accessor('metrics.soldAvg', {
    header: 'Sold Avg $',
    cell: ({ getValue }) => {
      const value = getValue() || 0;
      return <span className={value >= 0 ? 'positive' : 'negative'}>${value?.toFixed(4) || '0.0000'}</span>;
    },
  }),
  columnHelper.accessor('metrics.holdPercent', {
    header: '% Hold',
    cell: ({ getValue }) => {
      const value = getValue() || 0;
      return <span className={value >= 0 ? 'positive' : 'negative'}>{formatPercentage(value)}</span>;
    },
  }),
  columnHelper.accessor('metrics.pnLUsd', {
    header: 'PnL USD',
    cell: ({ getValue }) => {
      const value = getValue() || 0;
      return <span className={value >= 0 ? 'positive' : 'negative'}>{formatCurrency(value)}</span>;
    },
  }),
];

const TrackingTable: React.FC = () => {
  const [importOpen, setImportOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());

  const { data: wallets = [], isLoading, refetch } = useQuery({
    queryKey: ['wallets'],
    queryFn: walletApi.getWallets,
  });

  const table = useReactTable({
    data: wallets,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // GSAP Animations
  useEffect(() => {
    if (tableRef.current && !isLoading) {
      gsap.fromTo(tableRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
    }
  }, [isLoading]);

  useEffect(() => {
    // Animate table rows
    const rowElements = Array.from(rowRefs.current.values());
    rowElements.forEach((row, index) => {
      if (row) {
        gsap.fromTo(row,
          { opacity: 0, x: -30 },
          { 
            opacity: 1, 
            x: 0, 
            duration: 0.6, 
            delay: index * 0.1,
            ease: "back.out(1.7)" 
          }
        );
      }
    });
  }, [wallets]);

  const setRowRef = (index: number) => (el: HTMLTableRowElement | null) => {
    if (el) {
      rowRefs.current.set(index, el);
    } else {
      rowRefs.current.delete(index);
    }
  };

  const handleImportSuccess = () => {
    setImportOpen(false);
    refetch();
  };

  if (isLoading) {
    return <div className="loading">Loading wallets...</div>;
  }

  return (
    <div className="tracking-table-container" ref={tableRef}>
      <div className="table-header">
        <h1 className="table-title">Ethereum Wallet Tracker</h1>
        <Button variant="contained" onClick={() => setImportOpen(true)} className="import-btn">
          Import Wallets
        </Button>
      </div>

      {/* Search */}
      <div className="search-container">
        <input
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(String(e.target.value))}
          placeholder="Search wallets..."
          className="search-input"
        />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <Table className="stock-table">
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="table-header-row">
                {headerGroup.headers.map(header => (
                  <TableCell key={header.id} className="table-header-cell">
                    <div
                      className="header-content"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ArrowUpward fontSize="small" className="sort-icon" />,
                        desc: <ArrowDownward fontSize="small" className="sort-icon" />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row, index) => (
              <TableRow 
                key={row.id} 
                className="table-body-row"
                ref={setRowRef(index)}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className="table-body-cell">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {wallets.length === 0 && (
        <div className="empty-state">
          <h3>No wallets found</h3>
          <p>Click "Import Wallets" to add Ethereum addresses</p>
        </div>
      )}

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default TrackingTable;