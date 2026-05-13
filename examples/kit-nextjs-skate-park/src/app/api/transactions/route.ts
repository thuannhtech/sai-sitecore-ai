import { NextRequest, NextResponse } from 'next/server';
import type { Payment, PaymentTransaction } from 'ordercloud-javascript-sdk';
import { cartService } from 'src/lib/ordercloud/cart';

interface TransactionPayload {
  ID?: string;
  Type: string;
  DateExecuted?: string;
  Currency?: string;
  Amount: number;
  Succeeded?: boolean;
  ResultCode?: string;
  ResultMessage?: string;
  xp?: Record<string, unknown>;
}

interface TransactionRequest {
  paymentID?: string;
  type?: string;
  amount: number;
  currency: string;
  description?: string;
  accepted?: boolean;
  xp?: Record<string, unknown>;
  transaction: TransactionPayload;
  accessToken?: string;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TransactionRequest;
    const { paymentID, type, amount, currency, description, accepted, xp, transaction } = body;

    if (!amount || !currency || !transaction || !transaction.Type || !transaction.Amount) {
      return NextResponse.json(
        { ok: false, message: 'Missing required payment or transaction fields' },
        { status: 400 }
      );
    }

    const accessToken = await cartService.getAccessTokenFromCookies();

    if (!accessToken) {
      return NextResponse.json({ ok: false, message: 'Missing OrderCloud access token' }, { status: 401 });
    }

    const payment: Payment = {
      ID: paymentID,
      Type: (type || 'CreditCard') as Payment['Type'],
      Amount: amount,
      Currency: currency,
      Description: description,
      Accepted: accepted ?? true,
      xp,
    };

    const createdPayment = await cartService.createPayment(payment, accessToken);

    const transactionPayload: PaymentTransaction = {
      ID: transaction.ID,
      Type: transaction.Type,
      DateExecuted: transaction.DateExecuted ?? new Date().toISOString(),
      Currency: transaction.Currency ?? currency,
      Amount: transaction.Amount,
      Succeeded: transaction.Succeeded ?? true,
      ResultCode: transaction.ResultCode,
      ResultMessage: transaction.ResultMessage,
      xp: transaction.xp,
    };

    const createdTransaction = await cartService.createPaymentTransaction(
      createdPayment.ID,
      transactionPayload,
      accessToken
    );

    return NextResponse.json({
      ok: true,
      payment: createdPayment,
      transaction: createdTransaction,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Failed to create OrderCloud payment transaction');
    const status = message === 'Missing OrderCloud access token' ? 401 : 500;

    console.error('[API /transactions] Error:', error);
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
