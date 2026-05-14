import { NextResponse } from 'next/server';
import { userService } from 'src/lib/ordercloud/user';
import { tokenHelper } from 'src/lib/ordercloud/token-helper';
import { cookies } from 'next/headers';

/**
 * API Route to fetch the current user profile and set a secure cookie.
 * This follows best practices by handling profile data and cookies on the server.
 */
export async function GET() {
  try {
    // 1. Fetch user profile from OrderCloud
    const accessToken = await tokenHelper.getValidToken();
    const user = await userService.getUser(accessToken);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isGuest = tokenHelper.isGuestProfile(user);

    // 3. Set the user data cookie from the server side
    const cookieStore = await cookies();

    // We store the basic user info for fast SSR rendering of the Header
    // We include isGuest in the cached data
    cookieStore.set('skate-park.user-data', JSON.stringify({ ...user, isGuest }), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return NextResponse.json({
      ok: true,
      user: user,
      isGuest: isGuest
    });
  } catch (error: any) {
    console.error('[API Customer Me Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 401 }
    );
  }
}
