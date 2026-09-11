import { NextResponse } from 'next/server';
import fs from 'fs';
import { requireAuth, AppError, ForbiddenError, NotFoundError } from '@/lib/permissions';
import { query } from '@/lib/db';
import { resolveSafeStoragePath } from '@/lib/storage';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id: fileId } = await params;

    // Fetch file record along with ownership context
    const sql = `
      SELECT 
        pf.id,
        pf.proof_id,
        pf.file_name,
        pf.file_path,
        pf.mime_type,
        pf.file_size,
        c.ngo_id
      FROM proof_files pf
      JOIN proofs p ON pf.proof_id = p.id
      JOIN milestones m ON p.milestone_id = m.id
      JOIN campaigns c ON m.campaign_id = c.id
      WHERE pf.id = $1
    `;

    const res = await query<{
      id: string;
      proof_id: string;
      file_name: string;
      file_path: string;
      mime_type: string;
      file_size: number;
      ngo_id: string;
    }>(sql, [fileId]);

    if (res.rowCount === 0) {
      throw new NotFoundError('Proof file not found');
    }

    const fileRecord = res.rows[0];

    // Access Control Enforcement
    if (user.role === 'DONOR') {
      throw new ForbiddenError('Donors do not have permission to access private evidence files.');
    }

    if (user.role === 'NGO' && fileRecord.ngo_id !== user.id) {
      throw new ForbiddenError('You can only access evidence files for your own campaigns.');
    }

    // Resolve secure disk path
    const absolutePath = resolveSafeStoragePath(fileRecord.file_path);
    const fileBuffer = await fs.promises.readFile(absolutePath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': fileRecord.mime_type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${encodeURIComponent(fileRecord.file_name)}"`,
        'Content-Length': fileRecord.file_size.toString(),
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error in GET /api/proof-files/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
