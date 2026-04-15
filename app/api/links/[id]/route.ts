import { NextRequest, NextResponse } from 'next/server';
import { deleteLink } from '@/lib/bsc-db';
import { canWriteLink } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!await canWriteLink(req, id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await deleteLink(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/links/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
