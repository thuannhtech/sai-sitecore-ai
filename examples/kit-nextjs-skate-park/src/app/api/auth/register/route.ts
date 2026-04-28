import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, newsletter } = await req.json() || {};

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // TODO: Call your registration endpoint / IdP signup here
    // Example: await fetch(process.env.AUTH_API + '/register', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ firstName, lastName, email, password, newsletter })});

    // Mock response for scaffolding only
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
