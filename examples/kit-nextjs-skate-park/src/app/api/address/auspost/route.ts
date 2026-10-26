import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postalCode =
    searchParams.get('postalCode') ||
    searchParams.get('postcode') ||
    searchParams.get('q');

  if (!postalCode || postalCode.trim().length !== 4) {
    return NextResponse.json(
      { success: false, error: 'Australian postcode must be exactly 4 digits.' },
      { status: 400 }
    );
  }

  const cleanPostal = postalCode.trim();

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

    const res = await fetch(ausPostUrl, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Australia Post API returned status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Australia Post returns {"localities": ""} when not found, or {"localities": {"locality": ...}}
    if (!data || !data.localities || !data.localities.locality) {
      return NextResponse.json({
        success: true,
        found: false,
        country: 'AU',
        postalCode: cleanPostal,
        message: `No locality found for Australian postcode ${cleanPostal}.`,
      });
    }

    // Normalize locality into array
    const rawLocalities = Array.isArray(data.localities.locality)
      ? data.localities.locality
      : [data.localities.locality];

    if (rawLocalities.length === 0) {
      return NextResponse.json({
        success: true,
        found: false,
        country: 'AU',
        postalCode: cleanPostal,
        message: `No locality found for Australian postcode ${cleanPostal}.`,
      });
    }

    // Prefer standard delivery areas
    const deliveryLocalities = rawLocalities.filter(
      (loc: any) => loc.category === 'Delivery Area' || !loc.category
    );
    const activeList = deliveryLocalities.length > 0 ? deliveryLocalities : rawLocalities;

    // Pick primary location (if multiple, e.g. 2000 has Sydney, Barangaroo, etc.)
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
    console.error('[Australia Post Proxy Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to query Australia Post API' },
      { status: 500 }
    );
  }
}
