import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getFullSession } from '@/lib/bsc-db';
import BscBuilder from './BscBuilder';

export default async function BscPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getFullSession(id);

  if (!session) notFound();

  return (
    <Suspense>
      <BscBuilder initialSession={session} />
    </Suspense>
  );
}
