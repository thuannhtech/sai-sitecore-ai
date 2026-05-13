import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * API Route to handle user logout by clearing authentication cookies.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear the authentication and profile cookies
    cookieStore.delete('oc-token');
    cookieStore.delete('skate-park.user-data');

    return NextResponse.json({
      ok: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('[API Logout Error]', error);
    return NextResponse.json(
      { error: 'Failed to logout' }, 
      { status: 500 }
    );
  }
}
