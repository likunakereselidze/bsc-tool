import { NextRequest, NextResponse } from 'next/server';
import { deleteLink } from '@/lib/bsc-db';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteLink(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/links/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
