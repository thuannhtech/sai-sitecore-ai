import { NextRequest, NextResponse } from 'next/server';
import { cartService } from 'src/lib/ordercloud/cart';
import { orderService } from 'src/lib/ordercloud/orders';
import {
  buildOrderConfirmationEmailInformation,
  type WorkatoEmailInformation,
  type WorkatoProcessOrderPayload,
  workatoService,
} from 'src/lib/workato/order';
import { fa } from 'zod/v4/locales';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const asString = (value: unknown) => (typeof value === 'string' ? value : '');

const asNumber = (value: unknown) => (typeof value === 'number' ? value : undefined);

const formatAddress = (addressValue: unknown) => {
  const address = asRecord(addressValue);
  const parts = [
    asString(address.FirstName) || asString(address.firstName),
    asString(address.LastName) || asString(address.lastName),
    asString(address.Street1) || asString(address.addressLine1),
    asString(address.Country) || asString(address.country),
  ].filter(Boolean);

  return parts.join(', ');
};

export async function GET() {
  try {
    const order = await orderService.getOrder();

    return NextResponse.json({
      ok: true,
      order,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Failed to fetch order');
    const status = message === 'Missing OrderCloud access token' ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as WorkatoProcessOrderPayload;
      let workatoResponse: unknown;

    if (body) {
      try {
        const order = await orderService.getOrder();

        console.log('[API /orders] Order details fetched for Workato processing:', order);
        const lineItems = await cartService.getLineItems();
        const orderRecord = asRecord(order);
        const orderXp = asRecord(orderRecord.xp);
        const fromUser = asRecord(orderRecord.FromUser);
        const shippingAddress = orderRecord.ShippingAddress;
        const billingAddress = orderRecord.BillingAddress;
        const contactAddress = shippingAddress || billingAddress;
       
        const orderItems = lineItems.map((item) => {
          const itemRecord = asRecord(item);
          const product = asRecord(itemRecord.Product);

          return {
            name:
              asString(product.Name) ||
              asString(itemRecord.ProductID) ||
              'Product',
            quantity: asNumber(itemRecord.Quantity) ?? 0,
            price: asNumber(itemRecord.LineTotal) ?? asNumber(itemRecord.UnitPrice),
          };
        });

        const email = fromUser.Email || orderXp.Email;

        const emailInformation =  buildOrderConfirmationEmailInformation({
            to: [
            {
                "Email": email ? asString(email) : ''
            }
           ],
            from: "dmx@brother.com.sg",
            customerName:
              `${asString(asRecord(contactAddress).FirstName)} ${asString(asRecord(contactAddress).LastName)}`.trim(),
            customerEmail:
              asString(fromUser.Email) ||
              asString(orderXp.Email),
            orderId: body.OrderId || asString(orderRecord.ID),
            orderDate:
              asString(orderRecord.DateSubmitted) ||
              new Date().toISOString().split('T')[0],
            currency:
              asString(orderRecord.Currency) ||
              'HKD',
            shippingAddress: formatAddress(contactAddress),
            shippingRemark: asString(orderXp.CustomerMessage),
            contactName:
              `${asString(asRecord(contactAddress).FirstName)} ${asString(asRecord(contactAddress).LastName)}`.trim(),
            phoneNumber: asString(asRecord(contactAddress).Phone),
            subtotal: asNumber(orderRecord.Subtotal),
            shippingFee: asNumber(orderRecord.ShippingCost),
            discount: asNumber(orderRecord.PromotionDiscount),
            totalAmount: asNumber(orderRecord.Total),
            items: orderItems,
          });

        workatoResponse = await workatoService.submitOrder({
          ...body,
          EmailInformation: emailInformation,
          Succeeded: body.Succeeded ?? false,
        });
      } catch (workatoError: unknown) {
        console.error('[API /orders] Workato Error:', workatoError);

        return NextResponse.json(
          {
            ok: false,
            message: 'Order created, but Workato request failed',
            error: getErrorMessage(workatoError, 'Failed to call Workato process-order endpoint'),
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      workato: workatoResponse,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Failed to create order');
    const status = message === 'Missing OrderCloud access token' ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
