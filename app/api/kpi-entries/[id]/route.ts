import { NextRequest, NextResponse } from 'next/server';
import { deleteKpiEntry } from '@/lib/bsc-db';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteKpiEntry(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/kpi-entries/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
