import { NextRequest, NextResponse } from 'next/server';
import { deleteKpiEntry } from '@/lib/bsc-db';
import { canWriteKpiEntry } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!await canWriteKpiEntry(req, id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await deleteKpiEntry(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/kpi-entries/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
