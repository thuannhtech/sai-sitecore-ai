import { NextRequest, NextResponse } from 'next/server';
import { Cart } from 'src/lib/ordercloud';
import { cartService } from 'src/lib/ordercloud/cart';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const promoCode = typeof body?.code === 'string' ? body.code.trim() : '';

    if (!promoCode) {
      return NextResponse.json({ ok: false, error: 'Promo code is required' }, { status: 400 });
    }

    const accessToken = await cartService.getAccessTokenFromCookies();
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: 'Missing OrderCloud access token' }, { status: 401 });
    }

    await cartService.ensureCart(accessToken);
    await Cart.AddPromotion(promoCode, { accessToken });

    const cart = await cartService.getCart();
    const items = await cartService.getLineItems();
    const promotions = await Cart.ListPromotions(undefined, { accessToken });

    return NextResponse.json({
      ok: true,
      cart,
      items,
      promotions: promotions.Items || [],
      promoCode,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Failed to apply promotion');
    const status = message === 'Missing OrderCloud access token' ? 401 : 500;

    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
