import { NextRequest, NextResponse } from 'next/server';
import { getRecaptchaSettingsForSite } from 'lib/recaptcha-settings';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteName =
    searchParams.get('siteName') ||
    searchParams.get('site') ||
    process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME ||
    'sai-sitecore';

  try {
    const settings = await getRecaptchaSettingsForSite(siteName);

    return NextResponse.json({
      success: true,
      siteName,
      siteKey: settings.siteKey,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to fetch reCAPTCHA settings from Sitecore path',
        siteKey: '',
      },
      { status: 500 }
    );
  }
}
