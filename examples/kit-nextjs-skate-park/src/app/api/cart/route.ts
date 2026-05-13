import { cartService } from 'src/lib/ordercloud/cart';
import { tokenHelper } from 'src/lib/ordercloud/token-helper';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const cart = await cartService.getCart();
    const items = await cartService.getLineItems();

    return NextResponse.json({
      ok: true,
      cart,
      items,
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to fetch cart';
    const status = message === 'Missing OrderCloud access token' ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
