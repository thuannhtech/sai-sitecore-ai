import { NextRequest, NextResponse } from 'next/server';
import { cartService } from 'lib/ordercloud/cart';
import { orderService } from 'lib/ordercloud/orders';
import { Orders, Cart, Me } from 'lib/ordercloud';
import {
  buildOrderConfirmationEmailInformation,
  workatoService,
} from 'lib/workato/order';
import { OrderPlacementRequestSchema } from 'lib/checkout/models';
import { checkoutService } from 'lib/checkout/service';
import client from 'lib/sitecore-client';
import braintree from 'braintree';

/**
 * GraphQL Query để lấy cấu hình Payment Method từ Sitecore (giống token/route.ts)
 */
const GET_PAYMENT_CONFIG = `
  query GetPaymentConfig($path: String!) {
    item(path: $path, language: "en") {
      useSandbox: field(name: "UseSandbox") { value }
      merchantId: field(name: "MerchantID") { value }
      publicKey: field(name: "PublicKey") { value }
      privateKey: field(name: "PrivateKey") { value }
      sandbox_merchantId: field(name: "Sandbox_MerchantID") { value }
      sandbox_publicKey: field(name: "Sandbox_PublicKey") { value }
      sandbox_privateKey: field(name: "Sandbox_PrivateKey") { value }
    }
  }
`;

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id') || undefined;
    
    const order = await orderService.getOrder(orderId);
    
    // Lấy LineItems: 
    // Nếu có orderId, lấy từ danh sách đơn hàng đã gửi (Outgoing)
    // Nếu không, lấy từ giỏ hàng hiện tại
    let lineItems = [];
    try {
      const accessToken = await cartService.getAccessTokenFromCookies();
      if (orderId) {
        // Sử dụng Me.ListLineItems để lấy sản phẩm của đơn hàng đã chốt (đã gửi)
        const liResponse = await Me.ListLineItems(orderId, { accessToken });
        lineItems = liResponse.Items || [];
      } else {
        lineItems = await cartService.getLineItems();
      }
    } catch (liError) {
      console.error('[API /orders] Failed to fetch line items:', liError);
    }

    return NextResponse.json({ 
        ok: true, 
        order,
        lineItems: lineItems
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Failed to fetch order');
    const status = message === 'Missing OrderCloud access token' ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // 1. Validate Payload
    const parsed = OrderPlacementRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: 'Invalid payload' }, { status: 400 });
    }

    const payload = parsed.data;

    // 2. Lấy cấu hình Payment từ Sitecore (Nếu là Braintree)
    let paymentConfig = null;
    if (payload.paymentMethod.id === 'braintree' && payload.paymentMethod.itemId) {
      console.log('[API /orders] Fetching Braintree config from Sitecore for ID:', payload.paymentMethod.itemId);
      
      const data = await client.getData<{ item: any }>(GET_PAYMENT_CONFIG, { path: payload.paymentMethod.itemId });
      const item = data?.item;

      if (item) {
        const isSandbox = item.useSandbox?.value === '1' || item.useSandbox?.value === 'true';
        paymentConfig = {
          merchantId: isSandbox ? (item.sandbox_merchantId?.value || item.merchantId?.value) : item.merchantId?.value,
          publicKey: isSandbox ? (item.sandbox_publicKey?.value || item.publicKey?.value) : item.publicKey?.value,
          privateKey: isSandbox ? (item.sandbox_privateKey?.value || item.privateKey?.value) : item.privateKey?.value,
          environment: isSandbox ? 'Sandbox' : 'Production'
        };
      }
    }

    // 3. Thực hiện Đặt hàng (Truyền thêm paymentConfig)
    const checkoutResult = await checkoutService.placeOrder(payload, paymentConfig);
    const { orderId, paymentSummary } = checkoutResult;

    // 4. Xử lý Workato / Email (Phần này giữ nguyên logic cũ)
    let workatoResponse: unknown;
    let workatoWarning: string | null = null;

    try {
        const order = await orderService.getOrder(orderId);
        const lineItems = await cartService.getLineItems();
        
        const orderRecord = asRecord(order);
        const orderXp = asRecord(orderRecord.xp);
        const fromUser = asRecord(orderRecord.FromUser);
        const contactAddress = orderRecord.ShippingAddress || orderRecord.BillingAddress;
       
        const orderItems = lineItems.map((item) => {
          const itemRecord = asRecord(item);
          const product = asRecord(itemRecord.Product);
          return {
            name: asString(product.Name) || asString(itemRecord.ProductID) || 'Product',
            quantity: asNumber(itemRecord.Quantity) ?? 0,
            price: asNumber(itemRecord.LineTotal) ?? asNumber(itemRecord.UnitPrice),
          };
        });

        const email = fromUser.Email || orderXp.Email;

        const emailInformation = buildOrderConfirmationEmailInformation({
            to: [{ "Email": email ? asString(email) : '' }],
            from: "dmx@brother.com.sg",
            customerName: `${asString(asRecord(contactAddress).FirstName)} ${asString(asRecord(contactAddress).LastName)}`.trim(),
            customerEmail: asString(fromUser.Email) || asString(orderXp.Email),
            orderId: orderId || asString(orderRecord.ID),
            orderDate: asString(orderRecord.DateSubmitted) || new Date().toISOString().split('T')[0],
            currency: asString(orderRecord.Currency) || 'HKD',
            shippingAddress: formatAddress(contactAddress),
            shippingRemark: asString(orderXp.CustomerMessage) || 'N/A',
            contactName: `${asString(asRecord(contactAddress).FirstName)} ${asString(asRecord(contactAddress).LastName)}`.trim(),
            phoneNumber: asString(asRecord(contactAddress).Phone),
            subtotal: asNumber(orderRecord.Subtotal),
            shippingFee: asNumber(orderRecord.ShippingCost),
            discount: asNumber(orderRecord.PromotionDiscount),
            totalAmount: asNumber(orderRecord.Total),
            items: orderItems,
            paymentProvider: paymentSummary.type,
            transactionId: paymentSummary.transactionId
          });

        workatoResponse = await workatoService.submitOrder({
          OrderId: orderId,
          EmailInformation: emailInformation,
          Succeeded: true,
        });
      } catch (workatoError: unknown) {
        console.error('[API /orders] Workato/Email Error (Ignored):', workatoError);
        workatoWarning = getErrorMessage(workatoError, 'Failed to send confirmation email');
      }

    return NextResponse.json({
      ok: true,
      orderId: orderId,
      workato: workatoResponse,
      message: workatoWarning
    });

  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Failed to create order');
    const status = message === 'Missing OrderCloud access token' ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
