import { PrismaClient, Transaction } from '@prisma/client';
import { fetchTransactionData, fetchMarketCap } from '../utils/fetchBlockchain';
import { EtherscanTokenTx, BlockchainTransaction } from '../types/transaction';
const prisma = new PrismaClient();

export async function fetchTransactions(address: string) {
  
  const txs = await fetchTransactionData(address); 
  for (const tx of txs) {
    const marketCap = await fetchMarketCap(tx.token);
    const priceSol = tx.priceUsd / (await getSolPrice()); 
    await prisma.transaction.create({
      data: {
        wallet: { connect: { address } },
        txHash: tx.txHash,
        type: tx.type,
        token: tx.token,
        amount: tx.amount,
        priceUsd: tx.priceUsd,
        priceSol,
        marketCap,
        timestamp: new Date(tx.timestamp),
      },
    });
  }
}

async function getSolPrice() {
  return 150; 
}

export function calculateMetrics(transactions: Transaction[]) {
  const buys = transactions.filter(t => t.type === 'buy');
  const sells = transactions.filter(t => t.type === 'sell');

  const avgMarketCapBuy = buys.reduce((sum, t) => sum + t.marketCap, 0) / buys.length || 0;
  const avgMarketCapSell = sells.reduce((sum, t) => sum + t.marketCap, 0) / sells.length || 0;
  const boughtAvg = buys.reduce((sum, t) => sum + t.priceUsd, 0) / buys.length || 0;
  const soldAvg = sells.reduce((sum, t) => sum + t.priceUsd, 0) / sells.length || 0;

  const totalBought = buys.reduce((sum, t) => sum + t.amount, 0);
  const totalSold = sells.reduce((sum, t) => sum + t.amount, 0);
  const holdPercent = ((totalBought - totalSold) / totalBought) * 100 || 0;

  const pnLUsd = sells.reduce((sum, t) => sum + (t.priceUsd - boughtAvg) * t.amount, 0);

  return { avgMarketCapBuy, avgMarketCapSell, boughtAvg, soldAvg, holdPercent, pnLUsd };
}