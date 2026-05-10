import { NextRequest, NextResponse } from 'next/server';
import { authService } from 'src/lib/ordercloud/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { FirstName, LastName, Email, Password, AccountType } = body || {};

    if (!FirstName || !LastName || !Email || !Password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Decode password from Base64 (sent from client)
    const decodedPassword = Buffer.from(Password, 'base64').toString('utf8');

    // Map fields for OrderCloud
    const userData = {
      Username: Email,
      Password: decodedPassword,
      FirstName: FirstName,
      LastName: LastName,
      Email: Email,
      xp: {
        AccountType: AccountType || '0' // Default to Personal (0) if not specified
      }
    };

    const result = await authService.register(userData);

    return NextResponse.json({ ok: true, user: result });
  } catch (error: any) {
    console.error('[API Register Error]', error);
    
    // Extract meaningful error message from OrderCloud response if possible
    const message = error.response?.data?.Errors?.[0]?.Message || error.message || 'Internal Server Error';
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
