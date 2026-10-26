import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postalCode =
    searchParams.get('postalCode') ||
    searchParams.get('postcode') ||
    searchParams.get('q');
  const countryParam =
    searchParams.get('country') ||
    searchParams.get('site') ||
    'SG';

  if (!postalCode) {
    return NextResponse.json(
      { success: false, error: 'Postal code parameter is required.' },
      { status: 400 }
    );
  }

  const cleanPostal = postalCode.trim();
  const country = countryParam.toUpperCase();

  // Route to Australia Post
  if (country === 'AU' || country.includes('AU') || country.includes('AUSTRALIA')) {
    if (cleanPostal.length !== 4) {
      return NextResponse.json(
        { success: false, error: 'Australian postcode must be 4 digits.' },
        { status: 400 }
      );
    }

    try {
      const ausPostUrl = `https://digitalapi.auspost.com.au/postcode/search.json?q=${encodeURIComponent(
        cleanPostal
      )}&excludepostboxflag=true`;

      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Accept: 'application/json',
      };

      if (process.env.AUSPOST_API_KEY) {
        headers['auth-key'] = process.env.AUSPOST_API_KEY;
      }

      const res = await fetch(ausPostUrl, { method: 'GET', headers });
      if (!res.ok) {
        return NextResponse.json(
          { success: false, error: `Australia Post API returned status ${res.status}` },
          { status: res.status }
        );
      }

      const data = await res.json();
      if (!data || !data.localities || !data.localities.locality) {
        return NextResponse.json({
          success: true,
          found: false,
          country: 'AU',
          postalCode: cleanPostal,
          message: `No locality found for Australian postcode ${cleanPostal}.`,
        });
      }

      const rawLocalities = Array.isArray(data.localities.locality)
        ? data.localities.locality
        : [data.localities.locality];

      if (rawLocalities.length === 0) {
        return NextResponse.json({
          success: true,
          found: false,
          country: 'AU',
          postalCode: cleanPostal,
        });
      }

      const deliveryLocalities = rawLocalities.filter(
        (loc: any) => loc.category === 'Delivery Area' || !loc.category
      );
      const activeList = deliveryLocalities.length > 0 ? deliveryLocalities : rawLocalities;

      const primary =
        activeList.find((loc: any) => loc.location?.toUpperCase() === 'SYDNEY') ||
        activeList.find((loc: any) => loc.location?.toUpperCase() === 'MELBOURNE') ||
        activeList.find((loc: any) => loc.location?.toUpperCase() === 'BRISBANE') ||
        activeList[0];

      const suburbName = primary.location || '';
      const state = primary.state || '';
      const formattedAddress = `${suburbName}, ${state} ${cleanPostal}, AUSTRALIA`;

      const allSuburbs = activeList
        .map((loc: any) => loc.location)
        .filter((v: string, i: number, arr: string[]) => v && arr.indexOf(v) === i);

      return NextResponse.json({
        success: true,
        found: true,
        country: 'AU',
        postalCode: cleanPostal,
        address: formattedAddress,
        details: {
          suburb: suburbName,
          state,
          postal: cleanPostal,
          allSuburbs,
        },
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to query Australia Post API' },
        { status: 500 }
      );
    }
  }

  // Default: Singapore OneMap
  if (cleanPostal.length !== 6) {
    return NextResponse.json(
      { success: false, error: 'Singapore postal code must be 6 digits.' },
      { status: 400 }
    );
  }

  try {
    const oneMapUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
      cleanPostal
    )}&returnGeom=N&getAddrDetails=Y&pageNum=1`;

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    };
    if (process.env.ONEMAP_API_TOKEN) {
      headers['Authorization'] = process.env.ONEMAP_API_TOKEN;
    }

    const res = await fetch(oneMapUrl, { method: 'GET', headers });
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
        country: 'SG',
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
      country: 'SG',
      postalCode: cleanPostal,
      message: 'No address found for this postal code in Singapore.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to query OneMap API' },
      { status: 500 }
    );
  }
}
