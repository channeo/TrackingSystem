import express from 'express';
import multer from 'multer';
import walletRoutes from './router/wallet';
import cors from 'cors';
const app = express();
const upload = multer();

app.use(express.json());
app.use(cors());
app.use('/api/wallets', walletRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));