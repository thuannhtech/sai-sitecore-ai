import { NextRequest, NextResponse } from 'next/server';
import { authService } from 'src/lib/ordercloud/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // Decode password from Base64 (consistent with registration)
    const decodedPassword = Buffer.from(password, 'base64').toString('utf8');

    // Perform Login via OrderCloud Service
    // Using email as the username as defined in the registration process
    const authResponse = await authService.login(email, decodedPassword);

    // Return the auth response (tokens) and user info to the client
    return NextResponse.json({
      ok: true,
      access_token: authResponse.access_token,
      refresh_token: authResponse.refresh_token,
      expires_in: authResponse.expires_in,
    });

  } catch (error: any) {
    const errorData = error.response?.data;
    console.error('[API Login Error Detail]', JSON.stringify(errorData, null, 2));

    // Extract meaningful error message from OrderCloud response
    const message = errorData?.error_description || errorData?.Errors?.[0]?.Message || error.message || 'Invalid credentials';

    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
