import { NextResponse } from 'next/server';
import { orderService } from 'src/lib/ordercloud/orders';

export async function GET() {
  try {
    const order = await orderService.getOrder();

    return NextResponse.json({
      ok: true,
      order,
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to fetch order';
    const status = message === 'Missing OrderCloud access token' ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST() {
  try {
    const order = await orderService.createOrder();

    return NextResponse.json({
      ok: true,
      order,
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to create order';
    const status = message === 'Missing OrderCloud access token' ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
