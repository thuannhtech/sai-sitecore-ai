import { NextRequest, NextResponse } from 'next/server';
import { cartService } from 'src/lib/ordercloud/cart';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const shippingMethodId =
      typeof body?.shippingMethodId === 'string' ? body.shippingMethodId.trim() : '';
    const shippingMethodName =
      typeof body?.shippingMethodName === 'string' ? body.shippingMethodName.trim() : '';
    const shippingMethodTime =
      typeof body?.shippingMethodTime === 'string' ? body.shippingMethodTime.trim() : '';
    const shippingCost =
      typeof body?.shippingCost === 'number' && Number.isFinite(body.shippingCost)
        ? body.shippingCost
        : NaN;

    if (!shippingMethodId || !shippingMethodName || Number.isNaN(shippingCost) || shippingCost < 0) {
      return NextResponse.json(
        { error: 'shippingMethodId, shippingMethodName, and a non-negative shippingCost are required' },
        { status: 400 }
      );
    }

    const cart = await cartService.getCart();
    if (!cart?.ID) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const updatedCart = await cartService.patchCart({
      ID: cart.ID,
      xp: {
        ...(cart.xp ?? {}),
        ShippingCost: shippingCost,
        ShippingMethodID: shippingMethodId,
        ShippingMethodName: shippingMethodName,
        ShippingMethodTime: shippingMethodTime,
      },
    });

    return NextResponse.json({
      ok: true,
      cart: updatedCart,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update cart shipping';
    const status = message === 'Missing OrderCloud access token' ? 401 : 500;

    console.error('[API Cart Shipping Error]', error);
    return NextResponse.json({ error: message }, { status });
  }
}
