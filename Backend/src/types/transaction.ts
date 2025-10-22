export interface BlockchainTransaction {
  txHash: string;
  type: 'buy' | 'sell';
  token: string;
  amount: number;
  priceUsd: number;
  timestamp: string | number; // Unix timestamp hoặc ISO string
  from?: string;
  to?: string;
}

export interface EtherscanTokenTx {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string; // Token address
  to: string;
  value: string; // Amount in wei
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}