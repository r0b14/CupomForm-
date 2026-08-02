// One-time coupon stock import.
import { readFile } from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';
import { isSupportedCouponCode, normalizeCouponCode } from '../common/coupon';

const prisma = new PrismaClient();

async function main() {
  const filePath = process.env.COUPON_CSV_PATH;
  if (!filePath) throw new Error('Defina COUPON_CSV_PATH com o caminho do CSV de cupons.');
  const campaign = await prisma.campaign.findFirst({ where: { active: true } });
  if (!campaign) throw new Error('Nenhuma campanha ativa foi encontrada. Execute o seed primeiro.');

  const file = await readFile(filePath, 'utf8');
  const codes = [...new Set(file.split(/\r?\n/).map((line) => normalizeCouponCode(line.split(',')[0] ?? '')).filter(Boolean))]
    .filter((code) => code.toLowerCase() !== 'code' && code.toLowerCase() !== 'codigo' && code.toLowerCase() !== 'código');
  if (!codes.length) throw new Error('Nenhum código foi encontrado na primeira coluna do CSV.');
  if (codes.some((code) => !isSupportedCouponCode(code))) {
    throw new Error('O CSV contém código fora do padrão GENTE-005-* ou GENTE-010-*.');
  }

  const result = await prisma.coupon.createMany({
    data: codes.map((code) => ({ campaignId: campaign.id, code })),
    skipDuplicates: true,
  });
  console.log(`${result.count} cupom(ns) importado(s).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
