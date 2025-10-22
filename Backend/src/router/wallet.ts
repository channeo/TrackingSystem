// backend/src/routes/wallet.ts
import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { fetchTransactions, calculateMetrics } from '../services/transactionService';
import { addWallet } from '../services/walletService';
import cors from 'cors';

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

router.get('/', async (req, res) => {
  try {
    const wallets = await prisma.wallet.findMany({
      include: { transactions: true },
    });
    const walletsWithMetrics = wallets.map(wallet => ({
      ...wallet,
      metrics: calculateMetrics(wallet.transactions),
    }));
    res.json(walletsWithMetrics);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

router.post('/import', upload.single('file'), async (req, res) => {
  const file = req.file;
  const fileType = req.body.type;

  if (!file) return res.status(400).send('No file uploaded');

  try {
    if (fileType === 'csv') {
      const wallets: string[] = [];
      fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (row) => wallets.push(row.address))
        .on('end', async () => {
          for (const address of wallets) {
            await addWallet(address);
            await fetchTransactions(address);
            console.log(`Processed address: ${address}`);
          }
          fs.unlinkSync(file.path);
          res.send('Wallets imported and transactions fetched');
        });
    } else if (fileType === 'json') {
      const data = JSON.parse(fs.readFileSync(file.path, 'utf-8'));
      for (const { address } of data) {
        await addWallet(address);
        await fetchTransactions(address);
        console.log(`Processed address: ${address}`);
      }
      fs.unlinkSync(file.path);
      res.send('Wallets imported and transactions fetched');
    } else {
      res.status(400).send('Invalid file type');
    }
  } catch (error) {
    console.error('Error in import:', error);
    res.status(500).send('Failed to import wallets');
  }
});

router.get('/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const wallet = await prisma.wallet.findUnique({ where: { address }, include: { transactions: true } });
    if (!wallet) return res.status(404).send('Wallet not found');
    const metrics = calculateMetrics(wallet.transactions);
    res.json({ wallet, metrics });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

router.get('/:address/token/:token', async (req, res) => {
  const { address, token } = req.params;
  try {
    const transactions = await prisma.transaction.findMany({
      where: { wallet: { address }, token },
    });
    const metrics = calculateMetrics(transactions);
    res.json({ transactions, metrics });
  } catch (error) {
    console.error('Error fetching token data:', error);
    res.status(500).json({ error: 'Failed to fetch token data' });
  }
});

export default router;