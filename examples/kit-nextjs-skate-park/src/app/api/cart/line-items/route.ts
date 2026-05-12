import { NextRequest, NextResponse } from 'next/server';
import { cartService } from 'src/lib/ordercloud/cart';
import { tokenHelper } from 'src/lib/ordercloud/token-helper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ProductID, Quantity, ImageUrl } = body || {};

    if (!ProductID || typeof Quantity !== 'number' || Quantity <= 0) {
      return NextResponse.json(
        { error: 'ProductID and a positive Quantity are required' },
        { status: 400 }
      );
    }

    const accessToken = await tokenHelper.getValidToken();
    const lineItem = await cartService.addLineItem({
      ProductID,
      Quantity,
    });

    return NextResponse.json({
      ok: true,
      lineItem,
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to add line item';
    const status = message === 'Missing OrderCloud access token' ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { LineItemID, Quantity } = body || {};

    if (!LineItemID || typeof Quantity !== 'number' || Quantity < 0) {
      return NextResponse.json(
        { error: 'LineItemID and a non-negative Quantity are required' },
        { status: 400 }
      );
    }

    const accessToken = await tokenHelper.getValidToken();
    if (Quantity === 0) {
      await cartService.removeLineItem(LineItemID);

      return NextResponse.json({
        ok: true,
        removed: true,
        lineItemId: LineItemID,
      });
    }

    const lineItem = await cartService.updateLineItemQuantity({
      LineItemID,
      Quantity,
    });

    return NextResponse.json({
      ok: true,
      lineItem,
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to update line item quantity';
    const status = message === 'Missing OrderCloud access token' ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { LineItemID } = body || {};

    if (!LineItemID) {
      return NextResponse.json({ error: 'LineItemID is required' }, { status: 400 });
    }

    await cartService.removeLineItem(LineItemID);

    return NextResponse.json({
      ok: true,
      removed: true,
      lineItemId: LineItemID,
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to remove line item';
    const status = message === 'Missing OrderCloud access token' ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
