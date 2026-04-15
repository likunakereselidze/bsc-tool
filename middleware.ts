import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // On /bsc/new: if a session cookie exists and user didn't explicitly ask for a new one,
  // redirect them back to their existing BSC
  if (pathname === '/bsc/new') {
    if (searchParams.get('new') === '1') return NextResponse.next();
    const sessionId = request.cookies.get('bsc_session_id')?.value;
    if (sessionId) {
      return NextResponse.redirect(new URL(`/bsc/${sessionId}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/bsc/new',
};
