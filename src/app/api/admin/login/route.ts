import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    const serverPin = process.env.ADMIN_PIN || '4321';

    if (pin && pin.trim() === serverPin.trim()) {
      const response = NextResponse.json({ success: true, message: 'Admin verified' });
      response.cookies.set('admin_session', 'kkl_admin_verified_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid Admin PIN' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error during authentication' },
      { status: 500 }
    );
  }
}
