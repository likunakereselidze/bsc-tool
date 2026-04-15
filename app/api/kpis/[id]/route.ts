import { NextRequest, NextResponse } from 'next/server';
import { updateKpi, deleteKpi } from '@/lib/bsc-db';
import { canWriteKpi } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!await canWriteKpi(req, id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await req.json();
    const updated = await updateKpi(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/kpis/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!await canWriteKpi(req, id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await deleteKpi(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/kpis/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
