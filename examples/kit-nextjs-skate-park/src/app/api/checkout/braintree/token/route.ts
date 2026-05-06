import { NextResponse } from 'next/server';
import braintree from 'braintree';
import client from 'src/lib/sitecore-client';

/**
 * GraphQL Query để lấy cấu hình Payment Method từ Sitecore Item ID
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

/**
 * API Generate Braintree Client Token (Secure Version)
 * Tự động truy vấn Sitecore để lấy Key và sinh mã Authorization.
 */
export async function POST(request: Request) {
  try {
    const { datasourceId } = await request.json();

    if (!datasourceId) {
      return NextResponse.json({ success: false, message: 'Thiếu Datasource ID.' }, { status: 400 });
    }

    // 1. Truy vấn cấu hình từ Sitecore Edge (Server-to-Server)
    const data = await client.getData<{ item: any }>(GET_PAYMENT_CONFIG, { path: datasourceId });
    const item = data?.item;

    if (!item) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy cấu hình thanh toán trên Sitecore.' }, { status: 404 });
    }

    // 2. Xác định môi trường và bộ Key tương ứng
    const isSandbox = item.useSandbox?.value === '1' || item.useSandbox?.value === 'true';
    const config = {
      merchantId: isSandbox ? (item.sandbox_merchantId?.value || item.merchantId?.value) : item.merchantId?.value,
      publicKey: isSandbox ? (item.sandbox_publicKey?.value || item.publicKey?.value) : item.publicKey?.value,
      privateKey: isSandbox ? (item.sandbox_privateKey?.value || item.privateKey?.value) : item.privateKey?.value,
      environment: isSandbox ? braintree.Environment.Sandbox : braintree.Environment.Production
    };

    if (!config.merchantId || !config.publicKey || !config.privateKey) {
      return NextResponse.json({ success: false, message: 'Cấu hình thanh toán trên Sitecore không đầy đủ.' }, { status: 400 });
    }

    // 3. Khởi tạo Gateway & Sinh Token
    const gateway = new braintree.BraintreeGateway({
      environment: config.environment,
      merchantId: config.merchantId,
      publicKey: config.publicKey,
      privateKey: config.privateKey,
    });

    const response = await gateway.clientToken.generate({});

    if (response.success) {
      return NextResponse.json({ success: true, clientToken: response.clientToken });
    } else {
      return NextResponse.json({ success: false, message: 'Braintree rejected token generation.' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Braintree Token Secure API Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
