import { NextResponse } from 'next/server';
import { requireAuth, AppError } from '@/lib/permissions';
import { createDonationSchema } from '@/lib/validation';
import { createDonation } from '@/lib/donations';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const validated = createDonationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const donation = await createDonation(user.id, params.id, validated.data);

    return NextResponse.json({
      message: 'Demo donation successfully confirmed and funds locked',
      donation,
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error(`Error in POST /api/campaigns/${params.id}/donate:`, error);
    return NextResponse.json({ error: 'Internal server error during donation' }, { status: 500 });
  }
}
