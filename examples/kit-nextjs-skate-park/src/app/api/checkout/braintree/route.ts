import { NextResponse } from 'next/server';
import braintree from 'braintree';

// [Security Note] These should always be in .env and never committed.
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID || 'sandbox_8n47g625', 
  publicKey: process.env.BRAINTREE_PUBLIC_KEY || '2n8p9m6q9m7y7y7y',
  privateKey: process.env.BRAINTREE_PRIVATE_KEY || 'your_private_key_here',
});

/**
 * Braintree Transaction API
 * Processes the payment method nonce from the client.
 */
export async function POST(request: Request) {
  try {
    const { nonce, amount } = await request.json();

    if (!nonce || !amount) {
      return NextResponse.json({ success: false, message: 'Missing nonce or amount' }, { status: 400 });
    }

    // [POC Logic] Creating the transaction
    const result = await gateway.transaction.sale({
      amount: amount.toString(),
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true,
      },
    });

    if (result.success) {
      console.log('Transaction successful:', result.transaction.id);
      return NextResponse.json({ 
        success: true, 
        transactionId: result.transaction.id,
        status: result.transaction.status 
      });
    } else {
      console.error('Transaction failed:', result.message);
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Braintree Server Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
