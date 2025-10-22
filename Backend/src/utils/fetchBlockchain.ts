import axios from 'axios';
import { EtherscanTokenTx, BlockchainTransaction } from '../types/transaction';

export async function fetchTransactionData(address: string): Promise<BlockchainTransaction[]> {
  try {
    const apiKey = process.env.ETHERSCAN_API_KEY;
    if (!apiKey) {
      console.warn('ETHERSCAN_API_KEY not set, returning mock data');
      return generateMockTransactions(address); 
    }

    const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    
    const response = await axios.get(url);
    console.log('Fetching from URL:', url);
    const result = response.data;
    
    if (!result || typeof result !== 'object' || result.status !== '1') {
      console.error('Etherscan API error:', result?.message || 'Invalid response structure');
      return [];
    }

    const etherscanTxs: EtherscanTokenTx[] = result.result || [];
    const transactions: BlockchainTransaction[] = [];

    for (const tx of etherscanTxs) {
      const type: 'buy' | 'sell' = tx.to.toLowerCase() === address.toLowerCase() ? 'buy' : 'sell';
      
      const amount = parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal));
      const priceUsd = await fetchPriceUsd(tx.contractAddress);
      
      transactions.push({
        txHash: tx.hash,
        type,
        token: tx.contractAddress,
        amount,
        priceUsd,
        timestamp: parseInt(tx.timeStamp) * 1000, 
        from: tx.from,
        to: tx.to
      });
    }

    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return generateMockTransactions(address); 
  }
}

function generateMockTransactions(address: string): BlockchainTransaction[] {
  return [
    {
      txHash: '0x123abc...mock1',
      type: 'buy',
      token: '0xA0b86a33E...USDC',
      amount: 1000,
      priceUsd: 1.0,
      timestamp: Date.now() - 86400000, // 1 day ago
      to: address
    },
    {
      txHash: '0x456def...mock2',
      type: 'sell',
      token: '0xA0b86a33E...USDC',
      amount: 500,
      priceUsd: 1.05,
      timestamp: Date.now() - 43200000, // 12 hours ago
      from: address
    }
  ];
}

async function fetchPriceUsd(tokenAddress: string): Promise<number> {
  return 1.0; 
}

export async function fetchMarketCap(token: string): Promise<number> {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${token}`;
    const response = await axios.get(url, { timeout: 5000 });
    return response.data.market_data?.market_cap?.usd || 0;
  } catch (error) {
    console.error('Error fetching market cap:', error);
    return 0;
  }
}