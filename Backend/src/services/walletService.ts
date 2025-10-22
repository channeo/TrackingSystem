import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function addWallet(address: string) {
  await prisma.wallet.upsert({
    where: { address },
    update: {},
    create: { address },
  });
}