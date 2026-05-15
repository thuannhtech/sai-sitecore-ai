import { NextRequest, NextResponse } from 'next/server';
import { activateAccountFromToken } from 'src/lib/auth/activation';
import { authService } from 'src/lib/ordercloud/auth';
import { tokenHelper } from 'src/lib/ordercloud/token-helper';
import { userService } from 'src/lib/ordercloud/user';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const activateFromToken = async (token: string) => {
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Missing activation token' }, { status: 400 });
  }

  try {
    const result = await activateAccountFromToken(token);

    return NextResponse.json({
      ok: true,
      activated: result.activated,
      alreadyActive: result.alreadyActive,
      userId: result.userId,
      email: result.email,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Failed to activate account');
    const status = message === 'Activation token expired' || message.includes('token')
      ? 400
      : 500;

    return NextResponse.json({ ok: false, error: message }, { status });
  }
};

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';

  if (!token) {
    return NextResponse.redirect(new URL('/account/activation?status=failed', request.url));
  }

  try {
    const result = await activateAccountFromToken(token);
    const tokenResponse = await authService.getUserAccessToken(result.userId);
    const accessToken = tokenResponse.access_token;
    const user = await userService.getUser(accessToken);

    const response = NextResponse.redirect(new URL('/', request.url));

    tokenHelper.setAccessTokenOnResponse(response, accessToken);
    tokenHelper.setUserDataOnResponse(response, user as Record<string, unknown>);

    return response;
  } catch (error) {
    console.error('[API Activation Redirect Error]', error);
    return NextResponse.redirect(new URL('/account/activation?status=failed', request.url));
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body?.token === 'string' ? body.token : '';
  return activateFromToken(token);
}
