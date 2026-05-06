import { NextResponse } from 'next/server';
import braintree from 'braintree';
import client from 'src/lib/sitecore-client';

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

/**
 * API Submit Order (Enterprise Orchestrator)
 * 1. Verify Payment with Braintree
 * 2. Create Order Record (Mocked for now, ready for OrderCloud)
 * 3. Return Confirmation
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nonce, amount, datasourceId, shippingAddress, shippingMethod, items } = body;

    // A. Validation Server-side
    if (!nonce || !amount || !datasourceId || !shippingAddress || !items) {
      return NextResponse.json({ success: false, message: 'Missing order data' }, { status: 400 });
    }

    // B. Lấy cấu hình Braintree từ Sitecore
    const data = await client.getData<{ item: any }>(GET_PAYMENT_CONFIG, { path: datasourceId });
    const configItem = data?.item;

    if (!configItem) {
      return NextResponse.json({ success: false, message: 'Payment configuration not found' }, { status: 404 });
    }

    const isSandbox = configItem.useSandbox?.value === '1' || configItem.useSandbox?.value === 'true';
    const braintreeConfig = {
      merchantId: isSandbox ? (configItem.sandbox_merchantId?.value || configItem.merchantId?.value) : configItem.merchantId?.value,
      publicKey: isSandbox ? (configItem.sandbox_publicKey?.value || configItem.publicKey?.value) : configItem.publicKey?.value,
      privateKey: isSandbox ? (configItem.sandbox_privateKey?.value || configItem.privateKey?.value) : configItem.privateKey?.value,
      environment: isSandbox ? braintree.Environment.Sandbox : braintree.Environment.Production
    };

    // C. Thực hiện thanh toán (Payment Gateway Transaction)
    const gateway = new braintree.BraintreeGateway(braintreeConfig);
    const paymentResult = await gateway.transaction.sale({
      amount: amount.toString(),
      paymentMethodNonce: nonce,
      options: { submitForSettlement: true },
    });

    if (!paymentResult.success) {
      return NextResponse.json({ 
        success: false, 
        message: `Payment Declined: ${paymentResult.message}` 
      }, { status: 400 });
    }

    // D. Xử lý Đơn hàng (OrderCloud Integration Point)
    // Tương lai: Gọi API OrderCloud tại đây
    const orderId = `SAI-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    console.log('--- ORDER CREATED (MOCK) ---');
    console.log('ID:', orderId);
    console.log('Customer:', `${shippingAddress.firstName} ${shippingAddress.lastName}`);
    console.log('Total:', amount);
    console.log('Items Count:', items.length);
    console.log('Transaction ID:', paymentResult.transaction.id);
    console.log('----------------------------');

    // E. Trả về kết quả
    return NextResponse.json({ 
      success: true, 
      orderId,
      transactionId: paymentResult.transaction.id,
      message: 'Order placed successfully'
    });

  } catch (error: any) {
    console.error('Order Submission Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
