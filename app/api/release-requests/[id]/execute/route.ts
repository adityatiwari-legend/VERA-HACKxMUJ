import { NextResponse } from 'next/server';
import { requireRole, AppError } from '@/lib/permissions';
import { executeRelease } from '@/lib/release_requests';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await requireRole(['NGO', 'ADMIN']);
    const { id: releaseRequestId } = await params;

    let recipientAddress: string | undefined;

    try {
      const body = await request.json();
      recipientAddress = body.recipientAddress;
    } catch {
      // Empty body
    }

    const result = await executeRelease(user.id, releaseRequestId, recipientAddress);

    return NextResponse.json({
      ...result,
      message: 'Funds released on-chain and confirmed in ledger.'
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error in POST /api/release-requests/[id]/execute:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
