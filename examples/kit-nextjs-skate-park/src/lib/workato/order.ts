import { config } from 'src/lib/config';

export interface WorkatoEmailRecipient {
  Email: string;
}

export interface WorkatoEmailInformation {
  From?: string;
  BodyEmailTemplated?: string;
  Subject?: string;
  To?: WorkatoEmailRecipient[];
  [key: string]: unknown;
}

export interface WorkatoOrderConfirmationItem {
  name: string;
  quantity: number;
  price?: number;
}

interface BuildOrderConfirmationEmailArgs {
  to: WorkatoEmailRecipient[];
  from?: string;
  cc?: WorkatoEmailRecipient[];
  bcc?: WorkatoEmailRecipient[];
  customerName?: string;
  customerEmail?: string;
  orderId: string;
  orderDate?: string;
  currency?: string;
  shippingAddress?: string;
  shippingRemark?: string;
  contactName?: string;
  phoneNumber?: string;
  paymentProvider?: string;
  paymentTerms?: string;
  transactionId?: string;
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  totalAmount?: number;
  pointsUsed?: number;
  items?: WorkatoOrderConfirmationItem[];
}

export interface WorkatoProcessOrderPayload {
  OrderId: string;
  Succeeded?: boolean;
  EmailInformation?: WorkatoEmailInformation;
  [key: string]: unknown;
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatMoney = (amount?: number, currency = 'SGD') => {
  if (amount === undefined) {
    return 'TBD';
  }

  try {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

const formatText = (value?: string) => escapeHtml(value?.trim() || 'N/A');

const formatMultilineText = (value?: string) =>
  formatText(value).replaceAll('\n', '<br />');

export const buildOrderConfirmationEmailInformation = (
  input: BuildOrderConfirmationEmailArgs
): WorkatoEmailInformation => {
  const storefrontName = 'Sitecore AI';
  const customerName = input.customerName?.trim() || 'Customer';
  const orderDate = input.orderDate?.trim() || new Date().toISOString().split('T')[0];
  const itemMarkup = (input.items?.length ? input.items : []).length
    ? input.items!
        .map((item) => {
          const name = escapeHtml(item.name);
          const quantity = item.quantity;
          const price = item.price !== undefined ? formatMoney(item.price, input.currency) : 'TBD';

          return `<tr><td style="padding:12px 16px;border-bottom:1px solid #d9d9d9;font-size:14px;color:#212121;">${name}</td><td style="padding:12px 16px;border-bottom:1px solid #d9d9d9;text-align:center;font-size:14px;color:#212121;">${quantity}</td><td style="padding:12px 16px;border-bottom:1px solid #d9d9d9;text-align:right;font-size:14px;color:#212121;">${price}</td></tr>`;
        })
        .join('')
    : '<tr><td colspan="3" style="padding:12px 16px;border-bottom:1px solid #d9d9d9;font-size:14px;color:#212121;">Order items are not available.</td></tr>';

  return {
    From: input.from,
    To: input.to,
    Subject: `Your order confirmation - ${input.orderId}`,
    BodyEmailTemplated: `
      <table role="presentation" style="width:100%;min-width:100%;background-color:#f2f4f8;padding:24px 0;margin:0;font-family:Arial,sans-serif;">
        <tbody>
          <tr>
            <td align="center">
              <table role="presentation" style="width:100%;max-width:720px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08);margin:0 auto;">
                <tbody>
                  <tr>
                    <td style="background:#0c2d48;padding:28px 32px;text-align:left;color:#ffffff;">
                      <p style="margin:0;font-size:28px;line-height:34px;font-weight:700;">Order Confirmed</p>
                      <p style="margin:8px 0 0;font-size:16px;line-height:24px;color:#cbd6e0;">Thanks for shopping with ${escapeHtml(storefrontName)}. Your order is being processed.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 20px;font-size:20px;line-height:28px;font-weight:700;color:#212121;">Hi ${escapeHtml(customerName)},</p>
                      <p style="margin:0 0 24px;font-size:16px;line-height:24px;color:#4f5b6b;">We’ve received your order and will notify you once it ships. Below are the details we have recorded.</p>

                      <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                        <tbody>
                          <tr>
                            <td style="vertical-align:top;padding:12px 0;width:50%;">
                              <p style="margin:0 0 10px;font-size:14px;line-height:20px;color:#65748b;font-weight:700;">Order Number</p>
                              <p style="margin:0;font-size:16px;line-height:24px;color:#212121;">${formatText(input.orderId)}</p>
                            </td>
                            <td style="vertical-align:top;padding:12px 0;width:50%;">
                              <p style="margin:0 0 10px;font-size:14px;line-height:20px;color:#65748b;font-weight:700;">Order Date</p>
                              <p style="margin:0;font-size:16px;line-height:24px;color:#212121;">${formatText(orderDate)}</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="vertical-align:top;padding:12px 0;width:50%;">
                              <p style="margin:0 0 10px;font-size:14px;line-height:20px;color:#65748b;font-weight:700;">Shipping Address</p>
                              <p style="margin:0;font-size:16px;line-height:24px;color:#212121;">${formatMultilineText(input.shippingAddress)}</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="vertical-align:top;padding:12px 0;width:50%;">
                              <p style="margin:0 0 10px;font-size:14px;line-height:20px;color:#65748b;font-weight:700;">Contact Person</p>
                              <p style="margin:0;font-size:16px;line-height:24px;color:#212121;">${formatText(input.contactName)}</p>
                            </td>
                            <td style="vertical-align:top;padding:12px 0;width:50%;">
                              <p style="margin:0 0 10px;font-size:14px;line-height:20px;color:#65748b;font-weight:700;">Contact Number</p>
                              <p style="margin:0;font-size:16px;line-height:24px;color:#212121;">${formatText(input.phoneNumber)}</p>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding:12px 0;">
                              <p style="margin:0;font-size:14px;line-height:20px;color:#65748b;font-weight:700;">Email</p>
                              <p style="margin:6px 0 0;font-size:16px;line-height:24px;color:#1965e1;">${formatText(input.customerEmail)}</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div style="background:#f6f8fb;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:24px;">
                        <p style="margin:0 0 16px;font-size:16px;line-height:24px;font-weight:700;color:#212121;">Order Summary</p>
                        <table role="presentation" style="width:100%;border-collapse:collapse;">
                          <thead>
                            <tr>
                              <th style="padding:14px 16px;text-align:left;font-size:14px;font-weight:700;color:#4f5b6b;border-bottom:1px solid #dfe4ea;">Product</th>
                              <th style="padding:14px 16px;text-align:center;font-size:14px;font-weight:700;color:#4f5b6b;border-bottom:1px solid #dfe4ea;">Qty</th>
                              <th style="padding:14px 16px;text-align:right;font-size:14px;font-weight:700;color:#4f5b6b;border-bottom:1px solid #dfe4ea;">Total</th>
                            </tr>
                          </thead>
                          <tbody>${itemMarkup}</tbody>
                        </table>
                      </div>

                      <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:32px;">
                        <tbody>
                          <tr>
                            <td style="padding:10px 0;font-size:16px;line-height:24px;color:#65748b;">Subtotal</td>
                            <td style="padding:10px 0;text-align:right;font-size:16px;line-height:24px;color:#212121;">${escapeHtml(formatMoney(input.subtotal, input.currency))}</td>
                          </tr>
                          <tr>
                            <td style="padding:10px 0;font-size:16px;line-height:24px;color:#65748b;">Shipping</td>
                            <td style="padding:10px 0;text-align:right;font-size:16px;line-height:24px;color:#212121;">${escapeHtml(formatMoney(input.shippingFee, input.currency))}</td>
                          </tr>
                          <tr>
                            <td style="padding:10px 0;font-size:16px;line-height:24px;color:#65748b;">Discount</td>
                            <td style="padding:10px 0;text-align:right;font-size:16px;line-height:24px;color:#212121;">${escapeHtml(formatMoney(input.discount, input.currency))}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding:0 0 0;margin:0;border-bottom:1px solid #e2e8f0;"></td>
                          </tr>
                          <tr>
                            <td style="padding:16px 0 0;font-size:18px;line-height:26px;font-weight:700;color:#212121;">Grand Total</td>
                            <td style="padding:16px 0 0;text-align:right;font-size:18px;line-height:26px;font-weight:700;color:#212121;">${escapeHtml(formatMoney(input.totalAmount, input.currency))}</td>
                          </tr>
                        </tbody>
                      </table>

                      ${(input.paymentProvider || input.paymentTerms || input.transactionId)
                        ? `<div style="background:#fff8e1;border:1px solid #ffecb5;border-radius:16px;padding:20px;margin-bottom:24px;">
                          <p style="margin:0 0 12px;font-size:16px;line-height:24px;font-weight:700;color:#7f5a00;">Payment details</p>
                          ${input.paymentProvider ? `<p style="margin:0 0 8px;font-size:15px;line-height:22px;color:#7f5a00;"><strong>Provider:</strong> ${escapeHtml(input.paymentProvider)}</p>` : ''}
                          ${input.paymentTerms ? `<p style="margin:0 0 8px;font-size:15px;line-height:22px;color:#7f5a00;"><strong>Payment Terms:</strong> ${escapeHtml(input.paymentTerms)}</p>` : ''}
                          ${input.transactionId ? `<p style="margin:0;font-size:15px;line-height:22px;color:#7f5a00;"><strong>Transaction ID:</strong> ${escapeHtml(input.transactionId)}</p>` : ''}
                        </div>`
                        : ''}

                      <div style="padding:24px 24px 20px;background:#f6f8fb;border-radius:16px;">
                        <p style="margin:0 0 12px;font-size:18px;line-height:26px;font-weight:700;color:#212121;">Need help?</p>
                        <p style="margin:0;font-size:15px;line-height:24px;color:#4f5b6b;">If you have any questions about your order, our customer support team is happy to help.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    `.trim(),
  };
};

export const workatoService = {
  submitOrder: async (payload: WorkatoProcessOrderPayload) => {
    const url = config.workato.processOrderUrl;
    const apiToken = config.workato.apiToken;

    if (!url || !apiToken) {
      throw new Error('Missing Workato configuration');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-token': apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const responseText = await response.text();
    let responseBody: unknown = responseText;

    if (responseText) {
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = responseText;
      }
    }

    if (!response.ok) {
      throw new Error(
        `Workato request failed with status ${response.status}${responseText ? `: ${responseText}` : ''}`
      );
    }

    return responseBody;
  },
};
