import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postalCode =
    searchParams.get('postalCode') ||
    searchParams.get('postalcode') ||
    searchParams.get('q');

  if (!postalCode || postalCode.trim().length !== 6) {
    return NextResponse.json(
      { success: false, error: 'Postal code must be exactly 6 digits.' },
      { status: 400 }
    );
  }

  try {
    const cleanPostal = postalCode.trim();
    const oneMapUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
      cleanPostal
    )}&returnGeom=N&getAddrDetails=Y&pageNum=1`;

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    };

    if (process.env.ONEMAP_API_TOKEN) {
      headers['Authorization'] = process.env.ONEMAP_API_TOKEN;
    }

    const res = await fetch(oneMapUrl, {
      method: 'GET',
      headers,
    });

    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const first = data.results[0];
      const address =
        first.ADDRESS ||
        [
          first.BLK_NO ? `${first.BLK_NO}` : '',
          first.ROAD_NAME,
          first.BUILDING && first.BUILDING !== 'NIL' ? first.BUILDING : '',
          `SINGAPORE ${first.POSTAL || cleanPostal}`,
        ]
          .filter(Boolean)
          .join(' ');

      return NextResponse.json({
        success: true,
        found: true,
        postalCode: cleanPostal,
        address,
        details: {
          block: first.BLK_NO || '',
          road: first.ROAD_NAME || '',
          building: first.BUILDING && first.BUILDING !== 'NIL' ? first.BUILDING : '',
          postal: first.POSTAL || cleanPostal,
        },
      });
    }

    return NextResponse.json({
      success: true,
      found: false,
      message: 'No address found for this postal code in Singapore.',
    });
  } catch (err: any) {
    console.error('[OneMap Proxy Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to query OneMap API' },
      { status: 500 }
    );
  }
}
