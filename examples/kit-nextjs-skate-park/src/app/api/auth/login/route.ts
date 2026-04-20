import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password, remember } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'Missing credentials' }, { status: 400 });
    }

    // TODO: Integrate with your IdP (Auth0, Cognito, Azure AD B2C, etc.)
    await new Promise((res) => setTimeout(res, 1000));
    const ok = true;

    if (!ok) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Example: Set a secure cookie/session here
    // const res = NextResponse.json({ ok: true })
    // res.headers.append('Set-Cookie', `session=...; Path=/; HttpOnly; SameSite=Lax; Secure`)
    // return res
    
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
