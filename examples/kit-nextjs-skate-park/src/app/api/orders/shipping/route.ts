import { NextRequest, NextResponse } from 'next/server';
import { orderService } from 'src/lib/ordercloud/orders';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      companyName,
    } = body || {};

    const order = await orderService.setShippingAddress({
      firstName,
      lastName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      companyName,
    });

    return NextResponse.json({
      ok: true,
      order,
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to set shipping address';
    const status = message === 'Missing OrderCloud access token' ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
