import { NextRequest, NextResponse } from 'next/server';
import { activationTokenService } from 'src/lib/auth/activation-token';
import { authService } from 'src/lib/ordercloud/auth';
import {
  buildAccountActivationEmailInformation,
  workatoAuthService,
} from 'src/lib/workato/auth';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

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
    const fullName = `${FirstName} ${LastName}`.trim();
    const activationToken = activationTokenService.createToken({
      userId: result.ID || '',
      email: Email,
    });
    const activationUrl = new URL('/activate-account', req.nextUrl.origin);
    activationUrl.pathname = '/api/auth/activation';
    activationUrl.searchParams.set('token', activationToken);

    let activationEmailResponse: unknown;
    let activationEmailWarning: string | null = null;

    try {
      const emailInformation = buildAccountActivationEmailInformation({
        to: [{ Email }],
        from: 'dmx@brother.com.sg',
        customerName: fullName,
        customerEmail: Email,
        activationUrl: activationUrl.toString(),
      });

      activationEmailResponse = await workatoAuthService.submitActivationEmail({
        EmailInformation: emailInformation,
      });
    } catch (emailError: unknown) {
      console.error('[API Register Activation Email Error]', emailError);
      activationEmailWarning = getErrorMessage(
        emailError,
        'Failed to send activation email'
      );
    }

    return NextResponse.json({
      ok: true,
      user: result,
      activationEmail: activationEmailResponse,
      message: activationEmailWarning,
    });
  } catch (error: any) {
    console.error('[API Register Error]', error);
    
    // Extract meaningful error message from OrderCloud response if possible
    const message = error.response?.data?.Errors?.[0]?.Message || error.message || 'Internal Server Error';
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
