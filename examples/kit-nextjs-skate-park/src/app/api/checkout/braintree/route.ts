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
 * Braintree Transaction API (Secure Version)
 * Tự động lấy cấu hình từ Sitecore để thực hiện thanh toán an toàn.
 */
export async function POST(request: Request) {
  try {
    const { nonce, amount, datasourceId } = await request.json();

    if (!nonce || !amount || !datasourceId) {
      return NextResponse.json({ success: false, message: 'Missing required parameters (nonce, amount, datasourceId)' }, { status: 400 });
    }

    // 1. Lấy cấu hình từ Sitecore (Server-to-Server)
    const data = await client.getData<{ item: any }>(GET_PAYMENT_CONFIG, { path: datasourceId });
    const item = data?.item;

    if (!item) {
      return NextResponse.json({ success: false, message: 'Payment config not found in Sitecore.' }, { status: 404 });
    }

    const isSandbox = item.useSandbox?.value === '1' || item.useSandbox?.value === 'true';
    const config = {
      merchantId: isSandbox ? (item.sandbox_merchantId?.value || item.merchantId?.value) : item.merchantId?.value,
      publicKey: isSandbox ? (item.sandbox_publicKey?.value || item.publicKey?.value) : item.publicKey?.value,
      privateKey: isSandbox ? (item.sandbox_privateKey?.value || item.privateKey?.value) : item.privateKey?.value,
      environment: isSandbox ? braintree.Environment.Sandbox : braintree.Environment.Production
    };

    // 2. Khởi tạo Gateway
    const gateway = new braintree.BraintreeGateway({
      environment: config.environment,
      merchantId: config.merchantId,
      publicKey: config.publicKey,
      privateKey: config.privateKey,
    });

    // 3. Thực hiện giao dịch
    const result = await gateway.transaction.sale({
      amount: amount.toString(),
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true,
      },
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        transactionId: result.transaction.id,
        status: result.transaction.status 
      });
    } else {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Braintree Checkout Secure API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
