import { NextResponse } from 'next/server';
import { getLiveBlockchainStats } from '@/lib/blockchain';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getLiveBlockchainStats();
    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      blockNumber: 194821,
      network: 'Testnet Simulated',
      contractAddress: null,
    });
  }
}
