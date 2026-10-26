import { NextRequest, NextResponse } from 'next/server';
import { getRecaptchaSettingsForSite } from 'lib/recaptcha-settings';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

/**
 * Server-side Google reCAPTCHA Verification Endpoint
 * Dynamically fetches Secret Key exclusively from Sitecore Edge:
 * /sitecore/content/{siteName}/{siteName}/Settings/Google reCAPTCHA
 */
export async function POST(req: NextRequest) {
  try {
    const { token, siteName } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing reCAPTCHA token. Please complete the captcha challenge.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const effectiveSite = siteName || process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || 'sai-sitecore';
    const settings = await getRecaptchaSettingsForSite(effectiveSite);
    const secretKey = settings.secretKey;

    if (!secretKey) {
      console.error(
        `[reCAPTCHA] Secret key not found in Sitecore path: /sitecore/content/${effectiveSite}/${effectiveSite}/Settings/Google reCAPTCHA`
      );
      return NextResponse.json(
        {
          success: false,
          error: `reCAPTCHA Secret Key is not configured in Sitecore Settings for site "${effectiveSite}".`,
        },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    const googleRes = await fetch(verificationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const googleData = await googleRes.json();

    if (googleData.success) {
      return NextResponse.json(
        {
          success: true,
          score: googleData.score, // present in v3
          action: googleData.action,
        },
        { status: 200, headers: CORS_HEADERS }
      );
    } else {
      console.warn('[reCAPTCHA] Verification failed:', googleData);
      return NextResponse.json(
        {
          success: false,
          error: 'reCAPTCHA verification failed with Google.',
          errorCodes: googleData['error-codes'] || [],
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }
  } catch (error: any) {
    console.error('[reCAPTCHA] Error during verification:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error during reCAPTCHA verification' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
