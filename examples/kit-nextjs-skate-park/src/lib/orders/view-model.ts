import { OrderViewModel } from 'src/lib/checkout/models';

interface SourceLineItem {
  id?: string;
  ID?: string;
  name?: string;
  Product?: {
    Name?: string;
    xp?: {
      Images?: Array<{
        Url?: string;
      }>;
    };
  };
  ProductID?: string;
  quantity?: number | string;
  Quantity?: number | string;
  unitPrice?: number | string;
  price?: number | string;
  UnitPrice?: number | string;
  lineTotal?: number | string;
  LineTotal?: number | string;
  imageUrl?: string;
  xp?: {
    ImageUrl?: string;
  };
  ShippingAddress?: {
    FirstName?: string;
    LastName?: string;
    Street1?: string;
    Phone?: string;
  };
}

export const mapOrderApiResponse = (result: { order?: Record<string, any>; lineItems?: SourceLineItem[] }) => {
  const ocOrder = result.order || {};
  const storefrontCheckout = ocOrder.xp?.storefrontCheckout || ocOrder.xp?.StorefrontCheckout || {};
  const storefrontPaymentMethod = storefrontCheckout.paymentMethod || {};
  const storefrontTransaction = storefrontCheckout.transaction || {};
  const ocItems =
    result.lineItems && result.lineItems.length > 0
      ? result.lineItems
      : storefrontCheckout.cart?.items || [];
  const shippingAddress = result.lineItems?.[0]?.ShippingAddress || {};

  const mappedOrder: OrderViewModel = {
    orderId: ocOrder.ID,
    orderDate: ocOrder.DateSubmitted || ocOrder.DateCreated,
    status: ocOrder.Status || ocOrder.xp?.PaymentStatus || 'Open',
    customer: {
      firstName: ocOrder?.FromUser?.FirstName || 'N/A',
      lastName: ocOrder?.FromUser?.LastName || '',
      phoneNumber: ocOrder?.FromUser?.Phone || 'N/A',
    },
    shippingAddress: {
      FullName: `${shippingAddress.FirstName || ''} ${shippingAddress.LastName || ''}`.trim(),
      Address: `${shippingAddress.Street1 || ''}`.trim(),
      PhoneNumber: shippingAddress.Phone,
    },
    shippingMethod: {
      id: ocOrder.xp?.ShippingMethodID || storefrontCheckout.shippingMethod?.id || '',
      name: ocOrder.xp?.ShippingMethodName || storefrontCheckout.shippingMethod?.name || '',
      time: ocOrder.xp?.ShippingMethodTime || storefrontCheckout.shippingMethod?.time || '',
      price: Number(
        ocOrder.xp?.ShippingCost ?? storefrontCheckout.shippingMethod?.price ?? ocOrder.ShippingCost
      ) || 0,
    },
    paymentMethod: {
      id: storefrontPaymentMethod.id || ocOrder.xp?.PaymentMethod || 'Credit Card',
      label:
        storefrontPaymentMethod.label ||
        storefrontTransaction.description ||
        (storefrontPaymentMethod.cardType && storefrontPaymentMethod.last4
          ? `${storefrontPaymentMethod.cardType} ending in ${storefrontPaymentMethod.last4}`
          : storefrontPaymentMethod.id || ocOrder.xp?.PaymentMethod || 'Credit Card'),
      provider: storefrontPaymentMethod.provider || storefrontTransaction.provider || '',
      cardType: storefrontPaymentMethod.cardType || storefrontTransaction.cardType || '',
      last4: storefrontPaymentMethod.last4 || storefrontTransaction.last4 || '',
      status: ocOrder.xp?.PaymentStatus || '',
    },
    cart: {
      items: ocItems.map((item: SourceLineItem) => ({
        id: item.id || item.ID || '',
        name: item.name || item.Product?.Name || item.ProductID || 'Product',
        quantity: Number(item.quantity || item.Quantity) || 0,
        unitPrice: Number(item.unitPrice || item.price || item.UnitPrice) || 0,
        lineTotal: Number(item.lineTotal || item.LineTotal) || 0,
        imageUrl: item.imageUrl || item.xp?.ImageUrl || item.Product?.xp?.Images?.[0]?.Url,
      })),
      subtotal: Number(ocOrder.Subtotal || storefrontCheckout.cart?.subtotal) || 0,
      shippingCost: Number(ocOrder.ShippingCost ?? storefrontCheckout.cart?.shippingAmount) || 0,
      taxCost: Number(ocOrder.TaxCost ?? storefrontCheckout.cart?.taxAmount) || 0,
      promotionDiscount:
        Number(ocOrder.PromotionDiscount ?? storefrontCheckout.cart?.promotionDiscount) || 0,
      total: Number(ocOrder.Total ?? storefrontCheckout.cart?.total) || 0,
      gstRate: Number(ocOrder.xp?.GST) || 0,
    },
  };

  return mappedOrder;
};
